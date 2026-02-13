import React, { useState, useEffect } from 'react';

export default function BackgroundVideo({ videoUrl }) {
    // If no videoUrl provided, maybe show a default or fallback
    // Since we handle "default saved" in App.jsx, we can assume videoUrl might be passed.

    // We can use a default if null
    // But better to just render nothing or a static background if no video
    if (!videoUrl) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            overflow: 'hidden',
            background: '#0f0c29'
        }}>
            <video
                key={videoUrl} // Key ensures video element re-renders when source changes
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.8
                }}
            >
                <source src={videoUrl} type="video/mp4" />
            </video>

            {/* Dark overlay for readability */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 12, 41, 0.5)',
                mixBlendMode: 'multiply',
                zIndex: 10
            }} />
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, rgba(15, 12, 41, 0.6), transparent, rgba(15, 12, 41, 0.6))',
                zIndex: 10
            }} />
        </div>
    );
}

// Removed VIDEO_COUNT as it's no longer static
