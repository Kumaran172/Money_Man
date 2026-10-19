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

async function resetAll() {
  console.log('🧹 Wiping all test accounts and transactions...');

  // 1. Reset MongoDB Atlas
  if (MONGODB_URI) {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const uDel = await User.deleteMany({});
    const pDel = await Profile.deleteMany({});
    const aDel = await Account.deleteMany({});
    const tDel = await Transaction.deleteMany({});

    console.log(`🍃 MongoDB Atlas Cleared:`);
    console.log(`   - Users deleted:        ${uDel.deletedCount}`);
    console.log(`   - Profiles deleted:     ${pDel.deletedCount}`);
    console.log(`   - Accounts deleted:     ${aDel.deletedCount}`);
    console.log(`   - Transactions deleted: ${tDel.deletedCount}`);

    // Ensure categories are seeded
    await seedDefaultCategories();
    await mongoose.disconnect();
  }

  // 2. Reset SQLite database as well
  try {
    const sqlite = new Database(sqlitePath);
    sqlite.prepare('DELETE FROM transactions').run();
    sqlite.prepare('DELETE FROM accounts').run();
    sqlite.prepare('DELETE FROM profiles').run();
    sqlite.prepare('DELETE FROM users').run();
    sqlite.close();
    console.log('📁 SQLite database also cleared to zero state.');
  } catch (e) {
    console.log('SQLite reset note:', e.message);
  }

  console.log('\n✨ Database is now completely FRESH & CLEAN with 0 test accounts!');
  process.exit(0);
}

resetAll().catch(err => {
  console.error('Reset failed:', err);
  process.exit(1);
});
