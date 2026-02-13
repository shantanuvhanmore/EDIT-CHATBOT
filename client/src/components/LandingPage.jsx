import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';
import BackgroundVideo from './BackgroundVideo';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: '#0f0c29',
            fontFamily: '"Outfit", sans-serif'
        }}>
            {/* Background Video */}
            <BackgroundVideo videoIndex={0} />

            {/* Main Content */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '20px'
            }}>
                {/* Logo and Branding */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                        textAlign: 'center',
                        marginBottom: '60px'
                    }}
                >
                    <h1 style={{
                        fontSize: '72px',
                        fontWeight: '700',
                        letterSpacing: '0.2em',
                        color: 'white',
                        fontFamily: '"Orbitron", sans-serif',
                        textTransform: 'uppercase',
                        textShadow: '0 0 40px rgba(0, 255, 245, 0.6)',
                        margin: 0,
                        marginBottom: '20px'
                    }}>
                        <span style={{
                            color: '#00fff5',
                            textShadow: '0 0 40px rgba(0, 255, 245, 1)'
                        }}>AI</span>NIME
                    </h1>

                    <p style={{
                        fontSize: '18px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        fontFamily: '"Rajdhani", sans-serif',
                        fontWeight: '600',
                        margin: 0
                    }}>
                        Your Anime & Manga Expert
                    </p>
                </motion.div>

                {/* Sign Up Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    style={{
                        background: 'rgba(20, 20, 40, 0.7)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 255, 245, 0.1)',
                        padding: '32px 40px',
                        textAlign: 'center',
                        maxWidth: '400px',
                        width: '100%'
                    }}
                >
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '24px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        Sign In with Google
                    </h2>

                    {/* Google Sign Up Button */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <GoogleLoginButton />
                    </div>

                    <p style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginTop: '20px',
                        lineHeight: '1.4'
                    }}>
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    style={{
                        marginTop: '50px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '14px',
                        fontWeight: '500',
                        letterSpacing: '0.05em'
                    }}
                >
                    Anime Recommendations | Manga Insights | Smart Conversations
                </motion.div>
            </div>
        </div>
    );
}
