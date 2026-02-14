import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

    return <MarkdownContent content={displayedText} />;
}

// Markdown renderer
function MarkdownContent({ content }) {
    return (
        <ReactMarkdown
            components={{
                strong: ({ children }) => (
                    <span style={{
                        color: '#00fff5',
                        fontWeight: '700',
                        textShadow: '0 0 8px rgba(0, 255, 245, 0.5)'
                    }}>
                        {children}
                    </span>
                ),
                em: ({ children }) => (
                    <span style={{
                        color: '#ff007a',
                        fontStyle: 'italic',
                        fontWeight: '500'
                    }}>
                        {children}
                    </span>
                ),
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
                p: ({ children }) => (
                    <p style={{ margin: '0' }}>{children}</p>
                ),
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

// Responsive hook
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
}

export default function MessageList({ messages, onUpdateFeedback }) {
    const bottomRef = useRef(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isMobile ? '12px' : '12px 24px',
            paddingLeft: isMobile ? '0' : '80px', // Remove left padding on mobile (sidebar covers)
            boxSizing: 'border-box'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '16px' : '20px',
                fontFamily: '"Outfit", "Inter", sans-serif',
                paddingBottom: '20px' // Extra space at bottom
            }}>
                <AnimatePresence>
                    {messages.map((msg, index) => {
                        const isLastMessage = index === messages.length - 1;
                        const isAssistant = msg.role === 'assistant';
                        const shouldAnimate = isLastMessage && isAssistant;
                        const isUser = msg.role === 'user';
                        const hasFeedback = isAssistant && !msg.isError && msg._id && onUpdateFeedback;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    display: 'flex',
                                    gap: isMobile ? '8px' : '12px',
                                    flexDirection: isUser ? 'row-reverse' : 'row',
                                    alignItems: 'flex-start',
                                    marginBottom: (isMobile && hasFeedback) ? '25px' : '0' // Space for feedback buttons on mobile
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    flexShrink: 0,
                                    width: isMobile ? '32px' : '40px',
                                    height: isMobile ? '32px' : '40px',
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
                                        <User size={isMobile ? 16 : 20} color="white" />
                                    ) : (
                                        <Bot size={isMobile ? 16 : 20} color="#00fff5" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div style={{
                                    maxWidth: isMobile ? '85%' : '70%',
                                    position: 'relative',
                                    padding: isMobile ? '12px 16px' : '16px 20px',
                                    borderRadius: '20px',
                                    fontSize: isMobile ? '14px' : '15px',
                                    lineHeight: '1.7',
                                    letterSpacing: '0.04em',
                                    color: msg.isError ? '#fca5a5' : 'white',
                                    background: msg.isError
                                        ? 'rgba(239, 68, 68, 0.15)'
                                        : isUser
                                            ? 'linear-gradient(135deg, rgba(255, 0, 122, 0.95), rgba(200, 0, 100, 0.9))'
                                            : 'rgba(0, 0, 0, 0.5)',
                                    backdropFilter: 'blur(20px)',
                                    border: msg.isError
                                        ? '1px solid rgba(239, 68, 68, 0.4)'
                                        : isUser
                                            ? 'none'
                                            : '1px solid rgba(0, 255, 245, 0.2)',
                                    boxShadow: isUser
                                        ? '0 8px 32px rgba(255, 0, 122, 0.35)'
                                        : '0 8px 32px rgba(0, 0, 0, 0.4)'
                                }}>
                                    {shouldAnimate ? (
                                        <TypingText text={msg.content} speed={5} />
                                    ) : (
                                        <MarkdownContent content={msg.content} />
                                    )}

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

                                    {/* Like/Dislike Buttons */}
                                    {hasFeedback && (
                                        <div style={{
                                            position: 'absolute',
                                            right: isMobile ? '0' : '-50px',
                                            top: isMobile ? 'auto' : '50%',
                                            bottom: isMobile ? '-35px' : 'auto',
                                            transform: isMobile ? 'none' : 'translateY(-50%)',
                                            display: 'flex',
                                            flexDirection: isMobile ? 'row' : 'column',
                                            gap: '8px',
                                            zIndex: 10
                                        }}>
                                            <button
                                                onClick={() => {
                                                    const newFeedback = msg.feedback === 'liked' ? 'none' : 'liked';
                                                    onUpdateFeedback(msg._id, newFeedback);
                                                }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: isMobile ? '20px' : '24px',
                                                    transition: 'all 0.2s',
                                                    opacity: msg.feedback === 'liked' ? 1 : 0.5,
                                                    transform: msg.feedback === 'liked' ? 'scale(1.2)' : 'scale(1)',
                                                    padding: '4px'
                                                }}
                                                title="Like"
                                            >
                                                💙
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const newFeedback = msg.feedback === 'disliked' ? 'none' : 'disliked';
                                                    onUpdateFeedback(msg._id, newFeedback);
                                                }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: isMobile ? '20px' : '24px',
                                                    transition: 'all 0.2s',
                                                    opacity: msg.feedback === 'disliked' ? 1 : 0.5,
                                                    transform: msg.feedback === 'disliked' ? 'scale(1.2)' : 'scale(1)',
                                                    padding: '4px'
                                                }}
                                                title="Report"
                                            >
                                                ⚠️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
