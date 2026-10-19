import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'money_man.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDB() {
  db.exec(`
    -- Users table (for login/registration)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Profiles (linked to a user, one user can have multiple profiles)
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT DEFAULT '👤',
      color TEXT DEFAULT '#10b981',
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Accounts (payment sources linked to a profile)
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL DEFAULT 0,
      color TEXT DEFAULT '#3b82f6',
      icon TEXT DEFAULT 'Wallet',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Categories (global, not user-specific)
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL
    );

    -- Transactions
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      profile_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      account_id TEXT NOT NULL,
      note TEXT,
      date TEXT NOT NULL,
      source TEXT DEFAULT 'manual',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (profile_id) REFERENCES profiles(id),
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    );
  `);

  // Seed global categories only (no fake transactions or user data)
  const catCount = db.prepare('SELECT count(*) as c FROM categories').get();
  if (catCount.c === 0) {
    seedCategories();
  }

  console.log('✅ Database schema ready (clean slate — no demo data)');
}

function seedCategories() {
  const insert = db.prepare('INSERT INTO categories (id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)');

  const cats = [
    // Expense
    ['cat_food',     'Food & Dining',      'expense', 'Utensils',       '#f43f5e'],
    ['cat_shopping', 'Shopping',           'expense', 'ShoppingBag',    '#ec4899'],
    ['cat_travel',   'Travel & Fuel',      'expense', 'Car',            '#06b6d4'],
    ['cat_bills',    'Bills & Recharge',   'expense', 'FileText',       '#eab308'],
    ['cat_ent',      'Entertainment',      'expense', 'Film',           '#8b5cf6'],
    ['cat_grocery',  'Groceries',          'expense', 'ShoppingCart',   '#10b981'],
    ['cat_health',   'Health & Medical',   'expense', 'HeartPulse',     '#ef4444'],
    ['cat_edu',      'Education',          'expense', 'GraduationCap',  '#3b82f6'],
    ['cat_other',    'General / Other',    'expense', 'MoreHorizontal', '#64748b'],
    // Income
    ['cat_salary',    'Salary',            'income',  'Briefcase',      '#10b981'],
    ['cat_freelance', 'Freelance',         'income',  'Laptop',         '#3b82f6'],
    ['cat_cashback',  'Cashback & Rewards','income',  'Gift',           '#f59e0b'],
    ['cat_received',  'Money Received',    'income',  'ArrowDownLeft',  '#8b5cf6'],
    ['cat_interest',  'Interest / Returns','income',  'TrendingUp',     '#06b6d4'],
  ];

  for (const c of cats) insert.run(...c);
  console.log('✅ Global categories seeded');
}

// Helper: create a full set of default accounts for a new user
export function createDefaultAccountsForUser(userId) {
  const insert = db.prepare(`
    INSERT INTO accounts (id, name, type, balance, color, icon, user_id)
    VALUES (?, ?, ?, 0, ?, ?, ?)
  `);

  const defaults = [
    [`acc_kvb_${userId}`,        'KVB A/c ...1516',    'bank',       '#047857', 'Landmark'],
    [`acc_gpay_${userId}`,       'Google Pay (UPI)',    'gpay',       '#4285F4', 'Smartphone'],
    [`acc_supermoney_${userId}`, 'Supermoney UPI',      'supermoney', '#8B5CF6', 'Zap'],
    [`acc_cash_${userId}`,       'Cash Wallet',         'cash',       '#F59E0B', 'Banknote'],
  ];

  for (const [id, name, type, color, icon] of defaults) {
    insert.run(id, name, type, color, icon, userId);
  }
}

export default db;
