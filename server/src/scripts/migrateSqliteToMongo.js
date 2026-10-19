import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { seedDefaultCategories } from '../database/mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const sqlitePath = path.join(__dirname, '..', '..', 'money_man.db');
const MONGODB_URI = process.env.MONGODB_URI;

async function runMigration() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in server/.env');
    console.log('👉 Please add your MongoDB Atlas connection string into d:\\Kumaran\\Money_Man\\server\\.env');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  console.log(`📂 Reading SQLite DB from: ${sqlitePath}`);
  const sqlite = new Database(sqlitePath);

  // Seed categories in Mongo
  await seedDefaultCategories();

  // 1. Read SQLite data
  const sqliteUsers = sqlite.prepare('SELECT * FROM users').all();
  const sqliteProfiles = sqlite.prepare('SELECT * FROM profiles').all();
  const sqliteAccounts = sqlite.prepare('SELECT * FROM accounts').all();
  const sqliteTransactions = sqlite.prepare('SELECT * FROM transactions').all();

  console.log(`\nFound in SQLite:`);
  console.log(`  Users:        ${sqliteUsers.length}`);
  console.log(`  Profiles:     ${sqliteProfiles.length}`);
  console.log(`  Accounts:     ${sqliteAccounts.length}`);
  console.log(`  Transactions: ${sqliteTransactions.length}`);

  // ID mapping dictionaries (sqliteId -> mongoObjectId)
  const userMap = {};
  const profileMap = {};
  const accountMap = {};

  // 2. Migrate Users
  console.log('\n👤 Migrating Users...');
  for (const u of sqliteUsers) {
    let mongoUser = await User.findOne({ email: u.email.toLowerCase() });
    if (!mongoUser) {
      mongoUser = await User.create({
        name: u.name,
        email: u.email.toLowerCase(),
        password_hash: u.password_hash,
        created_at: new Date(u.created_at)
      });
      console.log(`  + Created user: ${u.name} (${u.email})`);
    } else {
      console.log(`  = Existing user: ${u.name} (${u.email})`);
    }
    userMap[u.id] = mongoUser._id;
  }

  // 3. Migrate Profiles
  console.log('\n🎭 Migrating Profiles...');
  for (const p of sqliteProfiles) {
    const mongoUserId = userMap[p.user_id];
    if (!mongoUserId) continue;

    let mongoProfile = await Profile.findOne({ user_id: mongoUserId, name: p.name });
    if (!mongoProfile) {
      mongoProfile = await Profile.create({
        user_id: mongoUserId,
        name: p.name,
        avatar: p.avatar || '👤',
        color: p.color || '#10b981',
        is_default: Boolean(p.is_default),
        created_at: new Date(p.created_at)
      });
      console.log(`  + Created profile: ${p.name}`);
    }
    profileMap[p.id] = mongoProfile._id;
  }

  // 4. Migrate Accounts
  console.log('\n💳 Migrating Accounts...');
  for (const a of sqliteAccounts) {
    const mongoUserId = userMap[a.user_id];
    if (!mongoUserId) continue;

    let mongoAcc = await Account.findOne({ user_id: mongoUserId, name: a.name });
    if (!mongoAcc) {
      mongoAcc = await Account.create({
        user_id: mongoUserId,
        name: a.name,
        type: a.type,
        balance: a.balance || 0,
        color: a.color || '#3b82f6',
        icon: a.icon || 'Wallet',
        created_at: new Date(a.created_at)
      });
      console.log(`  + Created account: ${a.name} (Balance: ₹${a.balance})`);
    } else {
      mongoAcc.balance = a.balance;
      await mongoAcc.save();
      console.log(`  = Updated account: ${a.name} (Balance: ₹${a.balance})`);
    }
    accountMap[a.id] = mongoAcc._id;
  }

  // 5. Migrate Transactions
  console.log('\n📊 Migrating Transactions...');
  let txInserted = 0;
  for (const t of sqliteTransactions) {
    const mongoUserId = userMap[t.user_id];
    const mongoProfileId = profileMap[t.profile_id];
    const mongoAccountId = accountMap[t.account_id];

    if (!mongoUserId) continue;

    const exists = await Transaction.findOne({
      user_id: mongoUserId,
      date: t.date,
      type: t.type,
      amount: t.amount,
      note: t.note || ''
    });

    if (!exists) {
      await Transaction.create({
        user_id: mongoUserId,
        profile_id: mongoProfileId || (await Profile.findOne({ user_id: mongoUserId }))?._id,
        account_id: mongoAccountId || (await Account.findOne({ user_id: mongoUserId }))?._id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        note: t.note || '',
        date: t.date,
        source: t.source || 'manual',
        created_at: new Date(t.created_at)
      });
      txInserted++;
    }
  }

  console.log(`  + Inserted ${txInserted} new transactions into MongoDB Atlas`);

  console.log('\n🎉 ================================================');
  console.log('✅ MIGRATION TO MONGODB ATLAS COMPLETE!');
  console.log(`   Users:        ${sqliteUsers.length}`);
  console.log(`   Accounts:     ${sqliteAccounts.length}`);
  console.log(`   Transactions: ${sqliteTransactions.length}`);
  console.log('================================================\n');

  await mongoose.disconnect();
  sqlite.close();
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
