import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { createRequire } from 'module';

dotenv.config();

const require = createRequire(import.meta.url);
const { encoding_for_model } = require('tiktoken');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Configuration
const SYSTEM_PROMPT = "You are a witty anime and manga expert. You answer briefly, with charm, deep anime knowledge, and concise explanations. Keep responses short and engaging.";
const MODEL = "gpt-4o-mini"; // Cost-effective and fast
const MAX_RESPONSE_TOKENS = 300;
const TOKEN_LIMIT_SESSION = 2000;
const HISTORY_WINDOW_SIZE = 5;

/**
 * Estimates tokens for a string
 */
function estimateTokens(text) {
    const enc = encoding_for_model(MODEL);
    const tokens = enc.encode(text);
    const count = tokens.length;
    enc.free();
    return count;
}

/**
 * Handles the chat logic: context management, token tracking, API call
 */
import sessionStore from './services/sessionStore.js';

// ... (imports remain the same)

/**
 * Handles the chat logic: context management, token tracking, API call
 */
export async function handleChat(sessionId, userMessage) {
    const session = await sessionStore.get(sessionId);

    if (!session) {
        throw new Error('Session not found');
    }

    // 1. Prepare messages
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    if (session.history) {
        // Limit history window
        const historyToSend = session.history.slice(-HISTORY_WINDOW_SIZE);
        messages.push(...historyToSend);
    }
    messages.push({ role: 'user', content: userMessage });

    // 2. Call OpenAI with timeout
    const completionPromise = openai.chat.completions.create({
        model: MODEL,
        messages: messages,
        max_tokens: MAX_RESPONSE_TOKENS,
        temperature: 0.8,
    });

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('OpenAI request timeout')), 30000)
    );

    const completion = await Promise.race([completionPromise, timeoutPromise]);

    const reply = completion.choices[0].message.content;
    const usage = completion.usage;

    // 3. Update Session
    session.tokensUsed += usage.total_tokens;
    if (!session.history) session.history = [];

    session.history.push({ role: 'user', content: userMessage });
    session.history.push({ role: 'assistant', content: reply });

    // Save updated session
    await sessionStore.set(sessionId, session);

    const sessionExhausted = session.tokensUsed >= TOKEN_LIMIT_SESSION;

    return {
        reply,
        tokens_used_this_request: usage.total_tokens,  // Tokens used in THIS request
        session_tokens_used: session.tokensUsed,       // Cumulative session total
        total_tokens: TOKEN_LIMIT_SESSION,
        session_exhausted: sessionExhausted,
        _debug_usage: usage
    };
}
