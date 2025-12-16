import React, { useState } from 'react';

// Import local videos
import shanksVideo from '../videos/final shanks wallpaper.mp4';
import gojoVideo from '../videos/Gojo vs Sukuna (JJK Manga Animation).mp4';
import himenoVideo from '../videos/himeno 4k.mp4';

const VIDEO_SOURCES = [
    shanksVideo,
    gojoVideo,
    himenoVideo
];

export default function BackgroundVideo({ videoIndex = 0 }) {
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
                key={VIDEO_SOURCES[videoIndex]}
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
                <source src={VIDEO_SOURCES[videoIndex]} type="video/mp4" />
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
