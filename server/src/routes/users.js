import express from 'express';
import { User } from '../models/User.js';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { Profile } from '../models/Profile.js';

const router = express.Router();

/**
 * GET /api/users
 * Returns list of all registered users and their overall balances & transaction counts
 * directly from MongoDB Atlas
 */
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().sort({ created_at: -1 });

    const userDetails = await Promise.all(
      users.map(async (u) => {
        const accounts = await Account.find({ user_id: u._id });
        const profiles = await Profile.find({ user_id: u._id });
        const txCount = await Transaction.countDocuments({ user_id: u._id });
        const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          created_at: u.created_at,
          totalBalance,
          transactionCount: txCount,
          profileCount: profiles.length,
          accounts: accounts.map(a => ({
            id: a._id.toString(),
            name: a.name,
            type: a.type,
            balance: a.balance,
            color: a.color
          }))
        };
      })
    );

    res.json({
      success: true,
      totalUsers: userDetails.length,
      data: userDetails
    });
  } catch (err) {
    next(err);
  }
});

export default router;
