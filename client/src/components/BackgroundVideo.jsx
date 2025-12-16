import React from 'react';

// Import all videos from the videos folder
// TO ADD NEW VIDEOS: 
// 1. Add your .mp4 file to src/videos/ folder
// 2. Import it below with a unique name
// 3. Add it to the VIDEO_SOURCES array

import shanksVideo from '../videos/final shanks wallpaper.mp4';
import gojoVideo from '../videos/Gojo vs Sukuna (JJK Manga Animation).mp4';
import himenoVideo from '../videos/himeno 4k.mp4';
import zenitsuVideo from '../videos/Anime Edit Zenitsu Demon Slayer.mp4';
import upscaleVideo from '../videos/UpscaleVideo_2_20240602 (1).mp4';
import vmakeVideo from '../videos/Vmake-1705855656420.mp4';
import angerVideo from '../videos/anger.mp4';
import girlVideo from '../videos/girl ame 13.mp4';
import cloudsVideo from '../videos/hopar clouds ful1.mp4';
import opxoVideo from '../videos/op xo.mp4';

// Add all imported videos to this array
const VIDEO_SOURCES = [
    gojoVideo,        // 0: Gojo vs Sukuna
    shanksVideo,      // 1: Shanks wallpaper
    himenoVideo,      // 2: Himeno 4k
    zenitsuVideo,     // 3: Zenitsu Demon Slayer
    upscaleVideo,     // 4: Upscale video
    vmakeVideo,       // 5: Vmake video
    angerVideo,       // 6: Anger
    girlVideo,        // 7: Girl anime
    cloudsVideo,      // 8: Hopar clouds
    opxoVideo         // 9: OP XO
];

export default function BackgroundVideo({ videoIndex = 0 }) {
    // Ensure index is within bounds
    const safeIndex = videoIndex % VIDEO_SOURCES.length;

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
                key={VIDEO_SOURCES[safeIndex]}
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
                <source src={VIDEO_SOURCES[safeIndex]} type="video/mp4" />
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

// Export the count for App.jsx to know how many videos there are
export const VIDEO_COUNT = VIDEO_SOURCES.length;
