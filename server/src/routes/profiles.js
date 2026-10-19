import express from 'express';
import mongoose from 'mongoose';
import { Profile } from '../models/Profile.js';
import { Transaction } from '../models/Transaction.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const profiles = await Profile.find({ user_id: userObjectId }).sort({ is_default: -1, created_at: 1 });

    const stats = await Transaction.aggregate([
      { $match: { user_id: userObjectId } },
      {
        $group: {
          _id: '$profile_id',
          total_income: {
            $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] }
          },
          total_spent: {
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

    const data = profiles.map(p => {
      const s = statsMap[p._id.toString()] || { total_income: 0, total_spent: 0, transaction_count: 0 };
      return {
        id: p._id.toString(),
        user_id: p.user_id.toString(),
        name: p.name,
        avatar: p.avatar,
        color: p.color,
        is_default: p.is_default ? 1 : 0,
        total_income: s.total_income,
        total_spent: s.total_spent,
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
    const { name, avatar = '👤', color = '#10b981' } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Profile name is required.' });

    const profile = await Profile.create({
      user_id: new mongoose.Types.ObjectId(userId),
      name: name.trim(),
      avatar,
      color,
      is_default: false
    });

    res.status(201).json({
      success: true,
      data: {
        id: profile._id.toString(),
        user_id: profile.user_id.toString(),
        name: profile.name,
        avatar: profile.avatar,
        color: profile.color,
        is_default: 0
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
