import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from '../models/Category.js';
import { Account } from '../models/Account.js';

dotenv.config();

// Fix Windows Node.js SRV record lookup issues with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where custom DNS servers cannot be set
}

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function connectMongoDB() {
  if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not found in .env. MongoDB is not connected yet.');
    return false;
  }

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ MongoDB Atlas connected successfully!');
    await seedDefaultCategories();
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
    return false;
  }
}

export async function seedDefaultCategories() {
  const count = await Category.countDocuments();
  if (count > 0) return;

  const cats = [
    // Expense
    { name: 'Food & Dining',      type: 'expense', icon: 'Utensils',       color: '#f43f5e' },
    { name: 'Shopping',           type: 'expense', icon: 'ShoppingBag',    color: '#ec4899' },
    { name: 'Travel & Fuel',      type: 'expense', icon: 'Car',            color: '#06b6d4' },
    { name: 'Bills & Recharge',   type: 'expense', icon: 'FileText',       color: '#eab308' },
    { name: 'Entertainment',      type: 'expense', icon: 'Film',           color: '#8b5cf6' },
    { name: 'Groceries',          type: 'expense', icon: 'ShoppingCart',   color: '#10b981' },
    { name: 'Health & Medical',   type: 'expense', icon: 'HeartPulse',     color: '#ef4444' },
    { name: 'Education',          type: 'expense', icon: 'GraduationCap',  color: '#3b82f6' },
    { name: 'General / Other',    type: 'expense', icon: 'MoreHorizontal', color: '#64748b' },
    // Income
    { name: 'Salary',             type: 'income',  icon: 'Briefcase',      color: '#10b981' },
    { name: 'Freelance',          type: 'income',  icon: 'Laptop',         color: '#3b82f6' },
    { name: 'Cashback & Rewards', type: 'income',  icon: 'Gift',           color: '#f59e0b' },
    { name: 'Money Received',     type: 'income',  icon: 'ArrowDownLeft',  color: '#8b5cf6' },
    { name: 'Interest / Returns', type: 'income',  icon: 'TrendingUp',     color: '#06b6d4' },
  ];

  await Category.insertMany(cats);
  console.log('✅ Default categories seeded in MongoDB');
}

export async function createDefaultAccountsForUser(userId) {
  const defaults = [
    { name: 'Primary Bank A/c',    type: 'bank', balance: 0, color: '#004c8f', icon: 'Landmark',   user_id: userId },
    { name: 'Google Pay (UPI)',    type: 'gpay', balance: 0, color: '#4285F4', icon: 'Smartphone', user_id: userId },
    { name: 'Cash Wallet',         type: 'cash', balance: 0, color: '#F59E0B', icon: 'Banknote',   user_id: userId },
  ];

  await Account.insertMany(defaults);
}
