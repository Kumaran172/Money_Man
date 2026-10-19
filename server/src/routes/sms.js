import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { parseBankSMS, parseBulkSMS } from '../utils/smsParser.js';

const router = express.Router();

// GET /api/sms/webhook — status check so phone browser can confirm it's online
router.get('/webhook', (req, res) => {
  res.json({
    status: 'online',
    database: 'MongoDB Atlas',
    message: 'Money Man SMS Webhook is ONLINE. Send POST requests from MacroDroid!',
    instructions: 'POST body: {"text": "[sms_message]", "sender": "[sms_number]"}'
  });
});

// POST /api/sms/parse — preview parse a single SMS (no DB write)
router.post('/parse', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'SMS text is required.' });

  const userId = req.user?.id || null;
  const profile = userId ? await Profile.findOne({ user_id: userId, is_default: true }) : null;
  const result = parseBankSMS(text, userId, profile?._id?.toString() || null);
  res.json(result);
});

// POST /api/sms/webhook — single SMS auto-sync (used by MacroDroid)
router.post('/webhook', async (req, res, next) => {
  try {
    let bodyObj = req.body;
    if (typeof req.body === 'string') {
      try { bodyObj = JSON.parse(req.body); } catch { bodyObj = { text: req.body }; }
    }

    const rawText = bodyObj?.text || bodyObj?.body || bodyObj?.message || bodyObj?.content || '';
    const sender = bodyObj?.sender || bodyObj?.from || 'Bank SMS';

    if (!rawText?.trim()) {
      return res.status(400).json({ success: false, error: 'No SMS message body found.' });
    }

    const user = req.user?.id ? await User.findById(req.user.id) : await User.findOne().sort({ created_at: 1 });
    if (!user) return res.status(401).json({ success: false, error: 'No user registered yet.' });

    const profile = await Profile.findOne({ user_id: user._id, is_default: true }) || await Profile.findOne({ user_id: user._id });

    const parseResult = parseBankSMS(rawText, user._id.toString(), profile?._id?.toString());
    if (!parseResult.success) {
      return res.status(422).json({ success: false, error: parseResult.error, raw_sms: rawText });
    }

    const { type, amount, category, note, date, available_balance, bank_name, account_digits, account_name, bank_color } = parseResult.data;

    // Duplicate check
    const exists = await Transaction.findOne({
      user_id: user._id,
      date,
      type,
      amount
    });

    if (exists) {
      return res.json({ success: true, message: 'Duplicate transaction skipped.', duplicate: true });
    }

    // Smart Account Finder: Find user's matching account by account digits OR bank name
    let account = null;
    if (account_digits) {
      account = await Account.findOne({ user_id: user._id, name: { $regex: account_digits, $options: 'i' } });
    }
    if (!account && bank_name && !/bank account/i.test(bank_name)) {
      account = await Account.findOne({ user_id: user._id, name: { $regex: bank_name.split(' ')[0], $options: 'i' } });
    }
    if (!account) {
      // Auto-create payment account for this bank & last 4 digits
      account = await Account.create({
        user_id: user._id,
        name: account_name,
        type: 'bank',
        balance: available_balance !== null && available_balance !== undefined ? available_balance : 0,
        color: bank_color || '#3b82f6'
      });
      console.log(`✨ Auto-created new payment account: ${account_name} for user ${user.name}`);
    }

    await Transaction.create({
      user_id: user._id,
      profile_id: profile?._id,
      account_id: account._id,
      type,
      amount,
      category,
      note,
      date,
      source: 'sms'
    });

    if (available_balance !== null && available_balance !== undefined) {
      account.balance = available_balance;
      await account.save();
    } else {
      const delta = type === 'credit' ? amount : -amount;
      account.balance += delta;
      await account.save();
    }

    console.log(`✅ MongoDB SMS Auto-sync: ${type.toUpperCase()} ₹${amount} on ${date} (${category}) -> ${account.name}`);
    res.status(201).json({ success: true, message: `Auto-recorded ₹${amount} ${type} into ${account.name}!` });
  } catch (err) {
    next(err);
  }
});

// POST /api/sms/bulk — paste many messages at once for history import into MongoDB Atlas
router.post('/bulk', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'Bulk SMS text is required.' });

    const user = req.user?.id ? await User.findById(req.user.id) : await User.findOne().sort({ created_at: 1 });
    if (!user) return res.status(401).json({ success: false, error: 'Please log in to import SMS history.' });

    const profile = await Profile.findOne({ user_id: user._id, is_default: true }) || await Profile.findOne({ user_id: user._id });

    const bulkResult = parseBulkSMS(text, user._id.toString(), profile?._id?.toString());
    if (!bulkResult.success) return res.status(400).json(bulkResult);

    let inserted = 0;
    let duplicates = 0;
    const errors = [];

    // Sort chronologically ascending so balances apply accurately
    const items = [...bulkResult.parsed].sort((a, b) => a.date.localeCompare(b.date));

    for (const item of items) {
      const { type, amount, category, note, date, available_balance, bank_name, account_digits, account_name, bank_color } = item;

      // Duplicate check
      const exists = await Transaction.findOne({
        user_id: user._id,
        date,
        type,
        amount
      });

      if (exists) {
        duplicates++;
        continue;
      }

      // Smart Account Finder per item
      let account = null;
      if (account_digits) {
        account = await Account.findOne({ user_id: user._id, name: { $regex: account_digits, $options: 'i' } });
      }
      if (!account && bank_name && !/bank account/i.test(bank_name)) {
        account = await Account.findOne({ user_id: user._id, name: { $regex: bank_name.split(' ')[0], $options: 'i' } });
      }
      if (!account) {
        account = await Account.create({
          user_id: user._id,
          name: account_name,
          type: 'bank',
          balance: available_balance !== null && available_balance !== undefined ? available_balance : 0,
          color: bank_color || '#3b82f6'
        });
        console.log(`✨ Auto-created new payment account: ${account_name}`);
      }

      await Transaction.create({
        user_id: user._id,
        profile_id: profile?._id,
        account_id: account._id,
        type,
        amount,
        category,
        note,
        date,
        source: 'sms_bulk'
      });

      inserted++;

      if (available_balance !== null && available_balance !== undefined) {
        account.balance = available_balance;
        await account.save();
      } else {
        const delta = type === 'credit' ? amount : -amount;
        account.balance += delta;
        await account.save();
      }
    }

    console.log(`📥 MongoDB Bulk SMS Import: ${inserted} inserted, ${duplicates} duplicates skipped`);
    res.json({
      success: true,
      message: `Imported ${inserted} transaction${inserted !== 1 ? 's' : ''}! ${duplicates} duplicate${duplicates !== 1 ? 's' : ''} skipped.`,
      summary: { ...bulkResult.summary, inserted, duplicates, errors }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
