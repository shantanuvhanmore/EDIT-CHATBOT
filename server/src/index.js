import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { handleChat } from './openai.js';
import connectDB from './config/db.js';
import conversationsRouter from './routes/conversations.js';
import messagesRouter from './routes/messages.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost
    if (origin.includes('localhost')) return callback(null, true);

    // Allow dev tunnels (inc1.devtunnels.ms)
    if (origin.includes('devtunnels.ms')) return callback(null, true);

    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory session store
// { [sessionId]: { history: [], tokensUsed: 0, lastAccess: Date } }
global.sessions = {};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/admin', adminRouter);

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { session_id, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Create or retrieve session
  const validSessionId = session_id || uuidv4();
  if (!global.sessions[validSessionId]) {
    global.sessions[validSessionId] = {
      history: [],
      tokensUsed: 0,
      lastAccess: new Date()
    };
  }

  const session = global.sessions[validSessionId];
  session.lastAccess = new Date();

  // Check limits
  if (session.tokensUsed >= 2000) {
    return res.status(403).json({
      error: "SESSION_LIMIT_REACHED",
      message: "Session token limit reached. Please reset after 24 hours.",
      session_exhausted: true,
      tokens_used: session.tokensUsed,
      total_tokens: 2000
    });
  }

  try {
    const response = await handleChat(validSessionId, message);
    res.json({
      ...response,
      session_id: validSessionId // Return ID in case client needs it
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
