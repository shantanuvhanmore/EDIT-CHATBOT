import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { handleChat } from './openai.js';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import sessionStore from './services/sessionStore.js';
import conversationsRouter from './routes/conversations.js';
import messagesRouter from './routes/messages.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import tokenRequestsRouter from './routes/tokenRequests.js';
import preferencesRouter from './routes/preferences.js';
import { verifyToken, verifyOwnership } from './middleware/auth.js';
import { chatRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL, // Production frontend (e.g., Vercel)
    ].filter(Boolean);

    // In development, also allow localhost and devtunnels
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('devtunnels.ms')) {
        return callback(null, true);
      }
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Session store initialized in services/sessionStore.js

// Health check
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing_key'
    }
  };

  // Determine overall status
  if (health.checks.database !== 'healthy') {
    health.status = 'degraded';
    res.status(503);
  }

  res.json(health);
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/token-requests', tokenRequestsRouter);
app.use('/api/preferences', preferencesRouter);

// Get user rate limit status
app.get('/api/rate-limit-status/:userId', verifyToken, verifyOwnership, async (req, res) => {
  try {
    const { getRateLimitStatus } = await import('./services/tokenValidator.js');
    // Use req.userId from verified token
    const status = await getRateLimitStatus(req.userId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get rate limit status' });
  }
});

// Chat endpoint - CRITICAL: Now protected with authentication
app.post('/chat', verifyToken, chatRateLimiter, async (req, res) => {
  const { session_id, message } = req.body;
  // Use userId from verified token, not from request body
  const userId = req.userId;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Import User model and token validator
    const { default: User } = await import('./models/User.js');
    const { checkRateLimit, checkTokenLimit, trackTokenUsage, getRateLimitStatus } = await import('./services/tokenValidator.js');

    // Check rate limits
    try {
      await checkRateLimit(userId);
    } catch (error) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: error.message,
        rate_limited: true
      });
    }

    // Estimate tokens (rough estimate: ~4 chars per token)
    const estimatedTokens = Math.ceil(message.length / 4);

    try {
      await checkTokenLimit(userId, estimatedTokens);
    } catch (error) {
      const status = await getRateLimitStatus(userId);
      return res.status(403).json({
        error: 'TOKEN_LIMIT_EXCEEDED',
        message: error.message,
        session_exhausted: true,
        tokens_used: status.tokens.used,
        total_tokens: status.tokens.limit
      });
    }

    // Create or retrieve session
    const validSessionId = session_id || uuidv4();

    let session = await sessionStore.get(validSessionId);
    if (!session) {
      session = {
        history: [],
        tokensUsed: 0,
        lastAccess: new Date()
      };
      await sessionStore.set(validSessionId, session);
    }

    session.lastAccess = new Date();
    await sessionStore.set(validSessionId, session);

    // Process chat
    const response = await handleChat(validSessionId, message);

    // Track actual token usage from this specific request
    await trackTokenUsage(userId, response.tokens_used_this_request);

    // Get updated status
    const status = await getRateLimitStatus(userId);

    // Update tokens used in session
    await sessionStore.updateTokens(validSessionId, status.tokens.used);

    res.json({
      ...response,
      session_id: validSessionId,
      tokens_used: status.tokens.used,
      total_tokens: status.tokens.limit,
      session_exhausted: status.tokens.used >= status.tokens.limit
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
