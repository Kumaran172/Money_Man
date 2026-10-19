import express from 'express';
import mongoose from 'mongoose';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const accounts = await Account.find({ user_id: userObjectId }).sort({ balance: -1 });

    // Aggregate totals for each account
    const stats = await Transaction.aggregate([
      { $match: { user_id: userObjectId } },
      {
        $group: {
          _id: '$account_id',
          total_credited: {
            $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] }
          },
          total_debited: {
            $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] }
          },
          transaction_count: { $sum: 1 }
        }
      }
    ]);

    const statsMap = {};
    for (const s of stats) {
      if (s._id) statsMap[s._id.toString()] = s;
    }

    const data = accounts.map(a => {
      const s = statsMap[a._id.toString()] || { total_credited: 0, total_debited: 0, transaction_count: 0 };
      return {
        id: a._id.toString(),
        user_id: a.user_id.toString(),
        name: a.name,
        type: a.type,
        balance: a.balance,
        color: a.color,
        icon: a.icon,
        total_credited: s.total_credited,
        total_debited: s.total_debited,
        transaction_count: s.transaction_count
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, type, balance = 0, color = '#3b82f6', icon = 'Wallet' } = req.body;
    if (!name || !type) return res.status(400).json({ success: false, error: 'Name and type are required.' });

    const account = await Account.create({
      user_id: new mongoose.Types.ObjectId(userId),
      name: name.trim(),
      type,
      balance: parseFloat(balance) || 0,
      color,
      icon
    });

    res.status(201).json({
      success: true,
      data: {
        id: account._id.toString(),
        user_id: account.user_id.toString(),
        name: account.name,
        type: account.type,
        balance: account.balance,
        color: account.color,
        icon: account.icon
      }
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { balance, name } = req.body;
    const update = {};
    if (balance !== undefined) update.balance = parseFloat(balance);
    if (name) update.name = name.trim();

    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user_id: userId },
      { $set: update },
      { new: true }
    );

    if (!account) return res.status(404).json({ success: false, error: 'Account not found.' });

    res.json({
      success: true,
      data: {
        id: account._id.toString(),
        user_id: account.user_id.toString(),
        name: account.name,
        type: account.type,
        balance: account.balance,
        color: account.color,
        icon: account.icon
      }
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const account = await Account.findOneAndDelete({
      _id: req.params.id,
      user_id: new mongoose.Types.ObjectId(userId)
    });
    if (!account) return res.status(404).json({ success: false, error: 'Account not found.' });

    res.json({ success: true, message: `Account "${account.name}" removed successfully.` });
  } catch (err) {
    next(err);
  }
});

export default router;
