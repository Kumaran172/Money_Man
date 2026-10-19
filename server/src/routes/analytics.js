import express from 'express';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.js';
import { Account } from '../models/Account.js';
import { Category } from '../models/Category.js';

const router = express.Router();

router.get('/summary', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { profile_id } = req.query;

    // Total balance from all user accounts
    const accounts = await Account.find({ user_id: userObjectId });
    const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

    const match = { user_id: userObjectId };
    if (profile_id) match.profile_id = new mongoose.Types.ObjectId(profile_id);

    const stats = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total_income: {
            $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] }
          },
          total_expense: {
            $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] }
          },
          total_transactions: { $sum: 1 }
        }
      }
    ]);

    const income = stats[0]?.total_income || 0;
    const expense = stats[0]?.total_expense || 0;
    const txCount = stats[0]?.total_transactions || 0;

    res.json({
      success: true,
      data: {
        totalBalance,
        totalIncome: income,
        totalExpense: expense,
        netSavings: income - expense,
        savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
        transactionCount: txCount
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/charts', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { profile_id } = req.query;

    const match = { user_id: userObjectId };
    if (profile_id) match.profile_id = new mongoose.Types.ObjectId(profile_id);

    // 1. Spending by Category
    const categorySpend = await Transaction.aggregate([
      { $match: { ...match, type: 'debit' } },
      {
        $group: {
          _id: '$category',
          total_amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total_amount: -1 } }
    ]);

    // Fetch categories for colors/icons
    const allCategories = await Category.find();
    const catMap = {};
    for (const c of allCategories) catMap[c.name] = c;

    const totalExpense = categorySpend.reduce((s, i) => s + i.total_amount, 0);
    const categoryBreakdown = categorySpend.map(c => {
      const meta = catMap[c._id] || { color: '#3b82f6', icon: 'ShoppingBag' };
      return {
        category: c._id,
        total_amount: c.total_amount,
        count: c.count,
        color: meta.color,
        icon: meta.icon,
        percentage: totalExpense > 0 ? Math.round((c.total_amount / totalExpense) * 100) : 0
      };
    });

    // 2. Source Breakdown (Accounts)
    const accounts = await Account.find({ user_id: userObjectId });
    const accStats = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$account_id',
          total_spent: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
          total_received: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
          count: { $sum: 1 }
        }
      }
    ]);

    const accStatMap = {};
    for (const s of accStats) {
      if (s._id) accStatMap[s._id.toString()] = s;
    }

    const sourceBreakdown = accounts.map(a => {
      const s = accStatMap[a._id.toString()] || { total_spent: 0, total_received: 0, count: 0 };
      return {
        account_name: a.name,
        account_type: a.type,
        color: a.color,
        total_spent: s.total_spent,
        total_received: s.total_received,
        count: s.count
      };
    }).sort((a, b) => b.total_spent - a.total_spent);

    // 3. Daily Trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const minDateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const dailyTrend = await Transaction.aggregate([
      { $match: { ...match, date: { $gte: minDateStr } } },
      {
        $group: {
          _id: '$date',
          expense: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
          income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } }
        }
      },
      { $project: { date: '$_id', expense: 1, income: 1, _id: 0 } },
      { $sort: { date: 1 } }
    ]);

    // 4. Monthly Trend
    const monthlyTrend = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] }, // 'YYYY-MM'
          expense: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
          income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } }
        }
      },
      { $project: { month: '$_id', expense: 1, income: 1, _id: 0 } },
      { $sort: { month: 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        categoryBreakdown,
        sourceBreakdown,
        dailyTrend,
        monthlyTrend,
        totalExpense
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/insights', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { profile_id } = req.query;

    const match = { user_id: userObjectId };
    if (profile_id) match.profile_id = new mongoose.Types.ObjectId(profile_id);

    const stats = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } }
        }
      }
    ]);

    const income = stats[0]?.income || 0;
    const expense = stats[0]?.expense || 0;

    const topCatAgg = await Transaction.aggregate([
      { $match: { ...match, type: 'debit' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);
    const topCat = topCatAgg[0] ? { category: topCatAgg[0]._id, total: topCatAgg[0].total } : null;

    const topSrcAgg = await Transaction.aggregate([
      { $match: { ...match, type: 'debit' } },
      {
        $group: {
          _id: '$account_id',
          total: { $sum: '$amount' },
          tx_count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);

    let topSrc = null;
    if (topSrcAgg[0]?._id) {
      const acc = await Account.findById(topSrcAgg[0]._id);
      if (acc) {
        topSrc = {
          name: acc.name,
          type: acc.type,
          total: topSrcAgg[0].total,
          tx_count: topSrcAgg[0].tx_count
        };
      }
    }

    const insights = [];
    if (income > 0) {
      const burnPct = Math.round((expense / income) * 100);
      if (burnPct > 80) {
        insights.push({ type: 'warning', tag: 'High Spend Alert', icon: 'AlertTriangle', color: '#ef4444', title: `You have spent ${burnPct}% of your income`, description: 'Try reducing discretionary spending on dining and shopping.' });
      } else if (burnPct <= 50) {
        insights.push({ type: 'positive', tag: 'Great Savings', icon: 'TrendingUp', color: '#10b981', title: `Strong financial health! You saved ${100 - burnPct}%`, description: 'Your savings rate is excellent. Consider investing the surplus.' });
      } else {
        insights.push({ type: 'info', tag: 'On Track', icon: 'CheckCircle', color: '#38bdf8', title: `You have spent ${burnPct}% of your income`, description: 'Spending is within a healthy range. Track your top categories to optimize further.' });
      }
    } else {
      insights.push({ type: 'info', tag: 'Get Started', icon: 'MessageSquareCode', color: '#8b5cf6', title: 'Import your KVB SMS history', description: 'Go to SMS Sync tab and paste your old bank messages to see real insights!' });
    }

    if (topCat) {
      const pct = expense > 0 ? Math.round((topCat.total / expense) * 100) : 0;
      insights.push({ type: 'info', tag: 'Top Category', icon: 'PieChart', color: '#f59e0b', title: `${topCat.category} is ${pct}% of spending (₹${topCat.total.toLocaleString('en-IN')})`, description: 'Tracking this closely will give you the fastest path to savings.' });
    }

    if (topSrc) {
      insights.push({ type: 'source', tag: 'Primary Payment App', icon: 'Zap', color: '#8b5cf6', title: `${topSrc.name} is your most-used source`, description: `₹${topSrc.total.toLocaleString('en-IN')} across ${topSrc.tx_count} payments. Check for cashback rewards!` });
    }

    insights.push({ type: 'tip', tag: 'Smart Money Rule', icon: 'Lightbulb', color: '#06b6d4', title: 'The 50/30/20 Rule', description: 'Aim for 50% Needs, 30% Wants, 20% Savings every month.' });

    res.json({ success: true, data: insights });
  } catch (err) {
    next(err);
  }
});

export default router;
