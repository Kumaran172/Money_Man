import express from 'express';
import { Category } from '../models/Category.js';

const router = express.Router();

// GET /api/categories - List all categories from MongoDB Atlas
router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;

    const categories = await Category.find(filter).sort({ type: 1, name: 1 });
    const data = categories.map(c => ({
      id: c._id.toString(),
      name: c.name,
      type: c.type,
      icon: c.icon,
      color: c.color
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
