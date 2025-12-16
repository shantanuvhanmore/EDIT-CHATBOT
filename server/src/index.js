import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { handleChat } from './openai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory session store
// { [sessionId]: { history: [], tokensUsed: 0, lastAccess: Date } }
global.sessions = {};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

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
