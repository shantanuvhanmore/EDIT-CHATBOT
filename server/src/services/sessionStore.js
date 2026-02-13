class SessionStore {
    constructor() {
        this.sessions = {}; // In-memory storage
        console.log('✓ Using in-memory sessions (Demo Mode)');
    }

    async get(sessionId) {
        return this.sessions[sessionId] || null;
    }

    async set(sessionId, data, ttl = 86400) {
        this.sessions[sessionId] = data;
        // Simple TTL implementation for memory store
        // For a demo, memory leak is negligible over 3 hours
    }

    async delete(sessionId) {
        delete this.sessions[sessionId];
    }

    async updateTokens(sessionId, tokensUsed) {
        try {
            const session = await this.get(sessionId);
            if (session) {
                // Ensure tokensUsed is a number
                session.tokensUsed = typeof tokensUsed === 'number' ? tokensUsed : (session.tokensUsed || 0);
                session.lastAccess = new Date();
                await this.set(sessionId, session);
            }
        } catch (error) {
            console.error('Error updating session tokens:', error);
        }
    }
}

export default new SessionStore();
