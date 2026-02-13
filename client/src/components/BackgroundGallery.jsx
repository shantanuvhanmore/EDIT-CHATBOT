import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, X, Check, Shuffle } from 'lucide-react';

const BackgroundGallery = ({
    isOpen,
    onClose,
    onSelectBackground,
    currentBackground,
    likedBackgrounds = [],
    onToggleLike,
    shuffleEnabled = false,
    onShuffleToggle
}) => {
    // State for local filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [showLikedOnly, setShowLikedOnly] = useState(false);
    const [videos, setVideos] = useState([]);
    const [hoveredVideo, setHoveredVideo] = useState(null);

    // Initial load of videos
    useEffect(() => {
        const loadVideos = async () => {
            try {
                const module = await import('../videos.json');
                setVideos(module.default || module);
            } catch (error) {
                console.log("Waiting for videos.json to be generated...", error);
            }
        };

        if (isOpen) {
            loadVideos();
        }
    }, [isOpen]);

    // Filter videos
    const filteredVideos = useMemo(() => {
        return videos.filter(video => {
            const searchLower = searchTerm.toLowerCase();
            const matchesName = video.name.toLowerCase().includes(searchLower);
            const matchesTags = video.tags?.some(tag => tag.toLowerCase().includes(searchLower)) || false;
            const matchesSearch = matchesName || matchesTags;

            const isLiked = likedBackgrounds.includes(video.videoUrl);
            const matchesLike = showLikedOnly ? isLiked : true;
            return matchesSearch && matchesLike;
        });
    }, [videos, searchTerm, showLikedOnly, likedBackgrounds]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    {/* Gallery Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '1000px',
                            height: '85vh',
                            background: '#1a1a2e',
                            border: '1px solid rgba(0, 255, 245, 0.3)',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 0 50px rgba(0, 255, 245, 0.1)',
                            fontFamily: '"Outfit", sans-serif',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.02)'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '24px',
                                color: '#00fff5',
                                fontFamily: '"Rajdhani", sans-serif',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Background Gallery
                            </h2>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Controls Bar */}
                        <div style={{
                            padding: '20px 24px',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            {/* Search Input */}
                            <div style={{
                                position: 'relative',
                                flex: 1,
                                minWidth: '200px'
                            }}>
                                <Search size={18} style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'rgba(255, 255, 255, 0.4)'
                                }} />
                                <input
                                    type="text"
                                    placeholder="Search by name or tags (gojo, bleach, action)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#00fff5'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                />
                            </div>

                            {/* Show Liked Toggle */}
                            <button
                                onClick={() => setShowLikedOnly(!showLikedOnly)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 20px',
                                    background: showLikedOnly ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    border: showLikedOnly ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: showLikedOnly ? '#ef4444' : 'rgba(255, 255, 255, 0.7)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                <Heart size={16} fill={showLikedOnly ? "currentColor" : "none"} />
                                <span>Show Liked</span>
                            </button>

                            {/* Shuffle Toggle Button */}
                            <button
                                onClick={() => onShuffleToggle(!shuffleEnabled)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 20px',
                                    background: shuffleEnabled
                                        ? 'linear-gradient(135deg, rgba(0, 255, 245, 0.2), rgba(0, 200, 255, 0.2))'
                                        : 'rgba(255, 255, 255, 0.05)',
                                    border: shuffleEnabled
                                        ? '1px solid rgba(0, 255, 245, 0.6)'
                                        : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: shuffleEnabled ? '#00fff5' : 'rgba(255, 255, 255, 0.7)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    boxShadow: shuffleEnabled
                                        ? '0 0 20px rgba(0, 255, 245, 0.4), inset 0 0 20px rgba(0, 255, 245, 0.1)'
                                        : 'none',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    if (!shuffleEnabled) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.borderColor = 'rgba(0, 255, 245, 0.3)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!shuffleEnabled) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    }
                                }}
                            >
                                {shuffleEnabled && (
                                    <motion.div
                                        animate={{
                                            opacity: [0.3, 0.6, 0.3],
                                            scale: [1, 1.2, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'radial-gradient(circle, rgba(0, 255, 245, 0.3) 0%, transparent 70%)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                )}
                                <Shuffle size={16} style={{ position: 'relative', zIndex: 1 }} />
                                <span style={{ position: 'relative', zIndex: 1 }}>
                                    {shuffleEnabled ? 'Shuffle ON' : 'Shuffle OFF'}
                                </span>
                            </button>
                        </div>

                        {/* Video Grid */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '0 24px 24px 24px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '20px',
                            alignContent: 'start',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(0, 255, 245, 0.3) rgba(255, 255, 255, 0.05)'
                        }}>
                            {filteredVideos.map((video) => {
                                const isLiked = likedBackgrounds.includes(video.videoUrl);
                                const isHovered = hoveredVideo === video.id;
                                const isSelected = currentBackground === video.videoUrl;

                                return (
                                    <motion.div
                                        key={video.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        onMouseEnter={() => setHoveredVideo(video.id)}
                                        onMouseLeave={() => setHoveredVideo(null)}
                                        onClick={() => onSelectBackground(video.videoUrl, false)}
                                        onDoubleClick={() => {
                                            onSelectBackground(video.videoUrl, true);
                                            onClose();
                                        }}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            paddingBottom: '56.25%', // 16:9 aspect ratio
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: isSelected ? '2px solid #00fff5' : '2px solid transparent',
                                            background: '#000',
                                            boxShadow: isSelected ? '0 0 20px rgba(0, 255, 245, 0.3)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {/* Video Preview or Thumbnail */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%'
                                        }}>
                                            {isHovered ? (
                                                <video
                                                    src={video.videoUrl}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={video.thumbnailUrl}
                                                    alt={video.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        opacity: 0.8
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Overlay Info */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '12px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-end'
                                        }}>
                                            <span style={{
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                            }}>
                                                {video.name}
                                            </span>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleLike(video.videoUrl);
                                                }}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    color: isLiked ? '#ef4444' : 'white'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                                            </button>
                                        </div>

                                        {/* Selected Indicator */}
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: '#00fff5',
                                                borderRadius: '50%',
                                                padding: '4px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                            }}>
                                                <Check size={12} color="black" strokeWidth={3} />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BackgroundGallery;
