
import React, { useEffect, useState } from 'react';
import '../heart-animations.css';

const HeartBackground = () => {
    const [hearts, setHearts] = useState([]);

    useEffect(() => {
        const createHeart = () => ({
            id: Date.now() + Math.random(),
            createdAt: Date.now(),
            left: Math.random() * 100 + '%',
            animationDuration: (Math.random() * 10 + 10) + 's', // 10-20s float time
            size: (Math.random() * 20 + 10) + 'px',
            delay: (Math.random() * 5) + 's',
            opacity: Math.random() * 0.5 + 0.1
        });

        // Create initial batch
        setHearts(Array.from({ length: 15 }).map(createHeart));

        const interval = setInterval(() => {
            setHearts(prev => {
                const now = Date.now();
                const kept = prev.filter(h => now - h.createdAt < 20000);
                if (kept.length < 25) {
                    return [...kept, createHeart()];
                }
                return kept;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="heart-bg-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1, // Strictly behind everything
            pointerEvents: 'none', // Clicks pass through
            overflow: 'hidden'
        }}>
            {hearts.map(heart => (
                <div
                    key={heart.id}
                    className="floating-heart"
                    style={{
                        left: heart.left,
                        fontSize: heart.size, // Use fontSize for emoji scaling
                        animationDuration: heart.animationDuration,
                        animationDelay: heart.delay,
                        opacity: heart.opacity,
                        position: 'absolute',
                        bottom: '-10%',
                        userSelect: 'none'
                    }}
                >
                    ❤️
                </div>
            ))}
        </div>
    );
};

export default HeartBackground;
