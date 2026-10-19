import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { requireAuth, optionalAuth } from './middleware/auth.js';

// Routes
import authRouter from './routes/auth.js';
import transactionsRouter from './routes/transactions.js';
import accountsRouter from './routes/accounts.js';
import profilesRouter from './routes/profiles.js';
import analyticsRouter from './routes/analytics.js';
import categoriesRouter from './routes/categories.js';
import smsRouter from './routes/sms.js';
import usersRouter from './routes/users.js';

const app = express();

// Middleware pipeline
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: ['text/*'] }));
app.use(requestLogger);

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Money Man API (MERN Stack)',
    database: 'MongoDB Atlas',
    version: '2.5.0',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (public)
app.use('/api/auth', authRouter);

// Public directory of all created accounts (for inspection)
app.use('/api/users', usersRouter);

// SMS routes (accepts JWT if logged in, falls back for phone background webhooks)
app.use('/api/sms', optionalAuth, smsRouter);

// Protected routes (require JWT token)
app.use('/api/transactions', requireAuth, transactionsRouter);
app.use('/api/accounts',     requireAuth, accountsRouter);
app.use('/api/profiles',     requireAuth, profilesRouter);
app.use('/api/analytics',    requireAuth, analyticsRouter);
app.use('/api/categories',   categoriesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found.` });
});

app.use(globalErrorHandler);

export default app;
