import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Typing animation component with markdown support
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

    return <MarkdownContent content={displayedText} />;
}

// Markdown renderer with anime-styled components
function MarkdownContent({ content }) {
    return (
        <ReactMarkdown
            components={{
                // Bold text with neon glow
                strong: ({ children }) => (
                    <span style={{
                        color: '#00fff5',
                        fontWeight: '700',
                        textShadow: '0 0 8px rgba(0, 255, 245, 0.5)'
                    }}>
                        {children}
                    </span>
                ),
                // Italic with accent color
                em: ({ children }) => (
                    <span style={{
                        color: '#ff007a',
                        fontStyle: 'italic',
                        fontWeight: '500'
                    }}>
                        {children}
                    </span>
                ),
                // Code blocks
                code: ({ children }) => (
                    <code style={{
                        background: 'rgba(0, 255, 245, 0.1)',
                        color: '#00fff5',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontFamily: '"Fira Code", monospace',
                        fontSize: '0.9em'
                    }}>
                        {children}
                    </code>
                ),
                // Paragraphs
                p: ({ children }) => (
                    <p style={{ margin: '0' }}>{children}</p>
                ),
                // Lists
                ul: ({ children }) => (
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ul>
                ),
                li: ({ children }) => (
                    <li style={{ marginBottom: '4px' }}>{children}</li>
                )
            }}
        >
            {content}
        </ReactMarkdown>
    );
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
            paddingLeft: '80px',
            paddingBottom: '140px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            fontFamily: '"Outfit", "Inter", sans-serif'
        }}>
            <AnimatePresence>
                {messages.map((msg, index) => {
                    const isLastMessage = index === messages.length - 1;
                    const isAssistant = msg.role === 'assistant';
                    const shouldAnimate = isLastMessage && isAssistant;
                    const isUser = msg.role === 'user';

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                display: 'flex',
                                gap: '12px',
                                flexDirection: isUser ? 'row-reverse' : 'row',
                                alignItems: 'flex-start'
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                flexShrink: 0,
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isUser
                                    ? 'linear-gradient(135deg, #ff007a, #ff4d9f)'
                                    : 'linear-gradient(135deg, rgba(0, 255, 245, 0.2), rgba(0, 200, 200, 0.1))',
                                border: isUser ? 'none' : '2px solid rgba(0, 255, 245, 0.4)',
                                boxShadow: isUser
                                    ? '0 0 25px rgba(255, 0, 122, 0.5)'
                                    : '0 0 25px rgba(0, 255, 245, 0.3)'
                            }}>
                                {isUser ? (
                                    <User size={20} color="white" />
                                ) : (
                                    <Bot size={20} color="#00fff5" />
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div style={{
                                maxWidth: '70%',
                                position: 'relative',
                                padding: '16px 20px',
                                borderRadius: '20px',
                                fontSize: '15px',
                                lineHeight: '1.7',
                                letterSpacing: '0.02em',
                                color: msg.isError ? '#fca5a5' : 'white',
                                background: msg.isError
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : isUser
                                        ? 'linear-gradient(135deg, rgba(255, 0, 122, 0.95), rgba(200, 0, 100, 0.9))'
                                        : 'rgba(20, 20, 40, 0.7)',
                                backdropFilter: 'blur(15px)',
                                border: msg.isError
                                    ? '1px solid rgba(239, 68, 68, 0.4)'
                                    : isUser
                                        ? 'none'
                                        : '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: isUser
                                    ? '0 8px 32px rgba(255, 0, 122, 0.35)'
                                    : '0 8px 32px rgba(0, 0, 0, 0.4)'
                            }}>
                                {/* Render markdown or typing animation */}
                                {shouldAnimate ? (
                                    <TypingText text={msg.content} speed={12} />
                                ) : (
                                    <MarkdownContent content={msg.content} />
                                )}

                                {/* Glowing accent for assistant */}
                                {isAssistant && !msg.isError && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10%',
                                        left: 0,
                                        width: '3px',
                                        height: '80%',
                                        background: 'linear-gradient(to bottom, #00fff5, #00fff5, rgba(0, 255, 245, 0.2))',
                                        borderRadius: '3px',
                                        boxShadow: '0 0 10px rgba(0, 255, 245, 0.5)'
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
