import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User } from 'lucide-react';

// Typing animation component
function TypingText({ text, speed = 20 }) {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text, speed]);

    return <span>{displayedText}</span>;
}

export default function MessageList({ messages }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <AnimatePresence>
                {messages.map((msg, index) => {
                    const isLastMessage = index === messages.length - 1;
                    const isAssistant = msg.role === 'assistant';
                    const shouldAnimate = isLastMessage && isAssistant;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                display: 'flex',
                                gap: '12px',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                alignItems: 'flex-start'
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                flexShrink: 0,
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg, #ff007a, #ff4d9f)'
                                    : 'rgba(0, 255, 245, 0.15)',
                                border: msg.role === 'user' ? 'none' : '1px solid rgba(0, 255, 245, 0.3)',
                                boxShadow: msg.role === 'user'
                                    ? '0 0 20px rgba(255, 0, 122, 0.4)'
                                    : '0 0 20px rgba(0, 255, 245, 0.2)'
                            }}>
                                {msg.role === 'user' ? (
                                    <User size={18} color="white" />
                                ) : (
                                    <Bot size={18} color="#00fff5" />
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div style={{
                                maxWidth: '75%',
                                position: 'relative',
                                padding: '14px 18px',
                                borderRadius: '16px',
                                fontSize: '15px',
                                lineHeight: '1.6',
                                color: msg.isError ? '#fca5a5' : 'white',
                                background: msg.isError
                                    ? 'rgba(239, 68, 68, 0.1)'
                                    : msg.role === 'user'
                                        ? 'linear-gradient(135deg, rgba(255, 0, 122, 0.9), rgba(255, 77, 159, 0.9))'
                                        : 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: msg.isError
                                    ? '1px solid rgba(239, 68, 68, 0.3)'
                                    : msg.role === 'user'
                                        ? 'none'
                                        : '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: msg.role === 'user'
                                    ? '0 4px 20px rgba(255, 0, 122, 0.25)'
                                    : '0 4px 20px rgba(0, 0, 0, 0.3)'
                            }}>
                                {/* Typing animation for last assistant message */}
                                {shouldAnimate ? (
                                    <TypingText text={msg.content} speed={15} />
                                ) : (
                                    msg.content
                                )}

                                {/* Neon accent for assistant */}
                                {msg.role === 'assistant' && !msg.isError && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '3px',
                                        height: '100%',
                                        background: 'linear-gradient(to bottom, #00fff5, rgba(0, 255, 245, 0.3))',
                                        borderRadius: '16px 0 0 16px'
                                    }} />
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
            <div ref={bottomRef} />
        </div>
    );
}
