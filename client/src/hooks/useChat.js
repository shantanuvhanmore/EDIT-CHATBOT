import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_URL = `${API_BASE}/chat`;

export function useChat(user, token) {
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

    // Conversation management state
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);

    // Use authenticated user ID
    const userId = user?.id;

    // Load session from local storage on mount
    useEffect(() => {
        const storedSessionId = localStorage.getItem('anime_chat_session_id');
        if (storedSessionId) {
            setSessionId(storedSessionId);
        }

        // Load conversations and rate limit status only if user is authenticated
        if (userId) {
            fetchConversations();
            fetchRateLimitStatus();

            // Restore last active conversation
            const storedConversationId = localStorage.getItem('current_conversation_id');
            if (storedConversationId) {
                selectConversation(storedConversationId);
            }
        }
    }, [userId]);

    // Fetch all conversations for the user
    const fetchConversations = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/conversations/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    // Fetch current rate limit status
    const fetchRateLimitStatus = async () => {
        if (!userId) return;

        try {
            const res = await fetch(`${API_BASE}/api/rate-limit-status/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const status = await res.json();
                setTokensUsed(status.tokens.used);
                setTotalTokens(status.tokens.limit);
                setIsSessionExhausted(status.tokens.used >= status.tokens.limit);
            }
        } catch (error) {
            console.error('Error fetching rate limit status:', error);
        }
    };

    // Create a new conversation
    const createConversation = async (title) => {
        try {
            const res = await fetch(`${API_BASE}/api/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, title })
            });

            if (res.ok) {
                const newConversation = await res.json();
                setConversations(prev => [newConversation, ...prev]);
                setCurrentConversationId(newConversation._id);
                // Persist to localStorage
                localStorage.setItem('current_conversation_id', newConversation._id);
                return newConversation._id;
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
        return null;
    };

    // Select a conversation and load its messages
    const selectConversation = async (conversationId) => {
        try {
            const res = await fetch(`${API_BASE}/api/messages/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const messagesData = await res.json();
                // Convert MongoDB messages to chat format
                const chatMessages = messagesData.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                    _id: msg._id,
                    feedback: msg.feedback || 'none'
                }));

                setMessages(chatMessages.length > 0 ? chatMessages : [
                    { role: 'assistant', content: "Welcome! I'm your anime expert. Ask me anything!" }
                ]);
                setCurrentConversationId(conversationId);
                // Persist to localStorage
                localStorage.setItem('current_conversation_id', conversationId);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
            // If conversation not found, clear from localStorage
            localStorage.removeItem('current_conversation_id');
        }
    };

    // Delete a conversation
    const deleteConversation = async (conversationId) => {
        try {
            const res = await fetch(`${API_BASE}/api/conversations/${conversationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setConversations(prev => prev.filter(c => c._id !== conversationId));

                // If we deleted the current conversation, reset
                if (conversationId === currentConversationId) {
                    setCurrentConversationId(null);
                    setMessages([{ role: 'assistant', content: "Welcome! I'm your anime expert. Ask me anything!" }]);
                    localStorage.removeItem('current_conversation_id');
                }
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    // Save a message to the database
    const saveMessage = async (conversationId, sender, content) => {
        try {
            const res = await fetch(`${API_BASE}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ conversationId, sender, content })
            });

            if (res.ok) {
                const savedMessage = await res.json();
                return savedMessage; // Return the saved message with _id
            }
        } catch (error) {
            console.error('Error saving message:', error);
        }
        return null;
    };

    // Update message feedback (like/dislike)
    const updateFeedback = async (messageId, feedback) => {
        try {
            const res = await fetch(`${API_BASE}/api/messages/${messageId}/feedback`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ feedback })
            });

            if (res.ok) {
                // Update local message state
                setMessages(prev => prev.map(msg =>
                    msg._id === messageId ? { ...msg, feedback } : msg
                ));
            }
        } catch (error) {
            console.error('Error updating feedback:', error);
        }
    };

    // Start a new chat
    const startNewChat = () => {
        setCurrentConversationId(null);
        setMessages([{ role: 'assistant', content: "Welcome! I'm your anime expert. Ask me anything!" }]);
        setTokensUsed(0);
        setIsSessionExhausted(false);
        // Clear persisted conversation
        localStorage.removeItem('current_conversation_id');
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading || isSessionExhausted) return;

        const userMsg = input.trim();
        setInput('');

        // Create a conversation if this is the first message
        let conversationId = currentConversationId;
        if (!conversationId && messages.length <= 1) {
            // Generate title from first message (truncate if too long)
            const title = userMsg.length > 50 ? userMsg.substring(0, 47) + '...' : userMsg;
            conversationId = await createConversation(title);
        }

        // Optimistic update
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        // Save user message to database
        if (conversationId) {
            await saveMessage(conversationId, 'user', userMsg);
        }

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: userMsg,
                    userId: userId
                })
            });

            const data = await res.json();

            if (data.session_id && !sessionId) {
                setSessionId(data.session_id);
                localStorage.setItem('anime_chat_session_id', data.session_id);
            }

            if (data.error === "TOKEN_LIMIT_EXCEEDED" || data.error === "SESSION_LIMIT_REACHED") {
                setIsSessionExhausted(true);
                setTokensUsed(data.tokens_used);
                setTotalTokens(data.total_tokens);
                const errorMsg = { role: 'assistant', content: data.message, isError: true };
                setMessages(prev => [...prev, errorMsg]);

                // Save error message to database
                if (conversationId) {
                    await saveMessage(conversationId, 'bot', data.message);
                }
            } else if (data.reply) {
                setTokensUsed(data.tokens_used);
                setTotalTokens(data.total_tokens);
                setIsSessionExhausted(data.session_exhausted);

                // Save bot reply to database and get the message ID
                if (conversationId) {
                    const savedMsg = await saveMessage(conversationId, 'bot', data.reply);
                    const botMsg = {
                        role: 'assistant',
                        content: data.reply,
                        _id: savedMsg?._id,
                        feedback: savedMsg?.feedback || 'none'
                    };
                    setMessages(prev => [...prev, botMsg]);
                } else {
                    // No conversation yet, just add message without ID
                    const botMsg = { role: 'assistant', content: data.reply };
                    setMessages(prev => [...prev, botMsg]);
                }
            }
        } catch (error) {
            console.error(error);
            const errorMsg = { role: 'assistant', content: "Gomenasai! Something went wrong with the server.", isError: true };
            setMessages(prev => [...prev, errorMsg]);
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
        setCurrentConversationId(null); // Start a new conversation
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
        resetSession,
        // Conversation management
        conversations,
        currentConversationId,
        createConversation,
        selectConversation,
        deleteConversation,
        fetchConversations,
        // New features
        updateFeedback,
        startNewChat
    };
}
