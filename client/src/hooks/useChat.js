import { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:3000/chat';

export function useChat() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Welcome! I'm your anime expert. Ask me anything!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [tokensUsed, setTokensUsed] = useState(0);
    const [totalTokens, setTotalTokens] = useState(2000);
    const [isSessionExhausted, setIsSessionExhausted] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false); // Sidebar toggle

    // Load session from local storage on mount
    useEffect(() => {
        const storedSessionId = localStorage.getItem('anime_chat_session_id');
        if (storedSessionId) {
            setSessionId(storedSessionId);
        } else {
            // New session will be created by backend on first request or we can generate one
            // We'll let backend generate one or we generate one here?
            // Backend handles it. We just rely on backend-returned ID unless we have one.
        }
    }, []);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading || isSessionExhausted) return;

        const userMsg = input.trim();
        setInput('');

        // Optimistic update
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: userMsg
                })
            });

            const data = await res.json();

            if (data.session_id && !sessionId) {
                setSessionId(data.session_id);
                localStorage.setItem('anime_chat_session_id', data.session_id);
            }

            if (data.error === "SESSION_LIMIT_REACHED") {
                setIsSessionExhausted(true);
                setTokensUsed(data.tokens_used);
                setMessages(prev => [...prev, { role: 'assistant', content: data.message, isError: true }]);
            } else if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
                setTokensUsed(data.tokens_used);
                setTotalTokens(data.total_tokens);
                setIsSessionExhausted(data.session_exhausted);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Gomenasai! Something went wrong with the server.", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const resetSession = () => {
        localStorage.removeItem('anime_chat_session_id');
        setSessionId(null);
        setMessages([{ role: 'assistant', content: "Session reset! Let's start over." }]);
        setTokensUsed(0);
        setIsSessionExhausted(false);
    };

    return {
        messages,
        input,
        setInput,
        sendMessage,
        isLoading,
        tokensUsed,
        totalTokens,
        isSessionExhausted,
        historyOpen,
        setHistoryOpen,
        resetSession
    };
}
