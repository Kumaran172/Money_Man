import express from 'express';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.js';
import { Account } from '../models/Account.js';
import { Profile } from '../models/Profile.js';
import { validateTransaction } from '../middleware/validator.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { profile_id, type, account_id, search, limit = 100 } = req.query;
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const filter = { user_id: userObjectId };

    if (profile_id) filter.profile_id = new mongoose.Types.ObjectId(profile_id);
    if (type && ['credit', 'debit'].includes(type)) filter.type = type;
    if (account_id) filter.account_id = new mongoose.Types.ObjectId(account_id);
    if (search) {
      filter.$or = [
        { note: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(filter)
      .populate('profile_id', 'name')
      .populate('account_id', 'name type color')
      .sort({ date: -1, created_at: -1 })
      .limit(parseInt(limit, 10));

    const data = transactions.map(t => ({
      id: t._id.toString(),
      user_id: t.user_id?.toString(),
      profile_id: t.profile_id?._id ? t.profile_id._id.toString() : (t.profile_id?.toString() || ''),
      profile_name: t.profile_id?.name || 'Personal',
      account_id: t.account_id?._id ? t.account_id._id.toString() : (t.account_id?.toString() || ''),
      account_name: t.account_id?.name || 'Account',
      account_type: t.account_id?.type || 'bank',
      account_color: t.account_id?.color || '#3b82f6',
      type: t.type,
      amount: t.amount,
      category: t.category,
      note: t.note || '',
      date: t.date,
      source: t.source || 'manual',
      created_at: t.created_at
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
});

router.post('/', validateTransaction, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let effectiveProfileId = req.body.profile_id;
    if (!effectiveProfileId) {
      const defaultProfile = await Profile.findOne({ user_id: userObjectId, is_default: true }) || await Profile.findOne({ user_id: userObjectId });
      effectiveProfileId = defaultProfile?._id;
    }

    const { type, amount, category, account_id, note = '', date } = req.body;
    const txDate = date || new Date().toISOString().split('T')[0];

    const accountObjectId = new mongoose.Types.ObjectId(account_id);
    const profileObjectId = new mongoose.Types.ObjectId(effectiveProfileId);

    const tx = await Transaction.create({
      user_id: userObjectId,
      profile_id: profileObjectId,
      account_id: accountObjectId,
      type,
      amount: parseFloat(amount),
      category,
      note: note.trim(),
      date: txDate,
      source: 'manual'
    });

    const delta = type === 'credit' ? parseFloat(amount) : -parseFloat(amount);
    await Account.findByIdAndUpdate(accountObjectId, { $inc: { balance: delta } });

    const populatedTx = await Transaction.findById(tx._id)
      .populate('profile_id', 'name')
      .populate('account_id', 'name type color');

    res.status(201).json({
      success: true,
      message: `${type === 'credit' ? 'Credited' : 'Debited'} ₹${amount} successfully!`,
      data: {
        id: populatedTx._id.toString(),
        user_id: populatedTx.user_id.toString(),
        profile_id: populatedTx.profile_id?._id?.toString(),
        profile_name: populatedTx.profile_id?.name || 'Personal',
        account_id: populatedTx.account_id?._id?.toString(),
        account_name: populatedTx.account_id?.name || 'Account',
        account_type: populatedTx.account_id?.type || 'bank',
        account_color: populatedTx.account_id?.color || '#3b82f6',
        type: populatedTx.type,
        amount: populatedTx.amount,
        category: populatedTx.category,
        note: populatedTx.note,
        date: populatedTx.date,
        source: populatedTx.source,
        created_at: populatedTx.created_at
      }
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tx = await Transaction.findOne({ _id: req.params.id, user_id: userId });
    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found.' });

    const reverseDelta = tx.type === 'credit' ? -tx.amount : tx.amount;
    await Account.findByIdAndUpdate(tx.account_id, { $inc: { balance: reverseDelta } });
    await Transaction.deleteOne({ _id: tx._id });

    res.json({ success: true, message: 'Transaction deleted and balance restored.' });
  } catch (err) {
    next(err);
  }
});

export default router;
