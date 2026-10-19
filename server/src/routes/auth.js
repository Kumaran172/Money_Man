import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Account } from '../models/Account.js';
import { createDefaultAccountsForUser } from '../database/mongo.js';
import { JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Create a new user account with auto-created profile and default payment sources in MongoDB Atlas
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
    }
    if (password.length < 4) {
      return res.status(400).json({ success: false, error: 'Password must be at least 4 characters.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Create User
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash
    });

    // 2. Create Default Profile
    const profile = await Profile.create({
      user_id: user._id,
      name: `${name.trim()}'s Account`,
      avatar: '👤',
      color: '#10b981',
      is_default: true
    });

    // 3. Create Default Accounts (KVB, GPay, Supermoney, Cash)
    await createDefaultAccountsForUser(user._id);

    // Issue JWT token
    const token = jwt.sign(
      { id: user._id.toString(), name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: `Welcome to Money Man, ${name}! Your account is ready.`,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        created_at: user.created_at
      },
      profile: {
        id: profile._id.toString(),
        user_id: user._id.toString(),
        name: profile.name,
        avatar: profile.avatar,
        color: profile.color,
        is_default: profile.is_default
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Authenticate existing user against MongoDB Atlas and return a JWT token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'No account found with this email. Please register first.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const profile = await Profile.findOne({ user_id: user._id, is_default: true }) || await Profile.findOne({ user_id: user._id });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        created_at: user.created_at
      },
      profile: profile ? {
        id: profile._id.toString(),
        user_id: user._id.toString(),
        name: profile.name,
        avatar: profile.avatar,
        color: profile.color,
        is_default: profile.is_default
      } : null
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Returns the currently logged-in user from MongoDB Atlas
 */
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const profile = await Profile.findOne({ user_id: user._id, is_default: true }) || await Profile.findOne({ user_id: user._id });

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        created_at: user.created_at
      },
      profile: profile ? {
        id: profile._id.toString(),
        user_id: user._id.toString(),
        name: profile.name,
        avatar: profile.avatar,
        color: profile.color,
        is_default: profile.is_default
      } : null
    });
  } catch {
    res.status(403).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
  }
});

export default router;
