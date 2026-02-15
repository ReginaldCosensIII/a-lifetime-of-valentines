
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function MediaCarousel({ coupleId }) {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        fetchRecentMedia();
    }, [coupleId]);

    const fetchRecentMedia = async () => {
        try {
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .eq('couple_id', coupleId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setMedia(data);
        } catch (error) {
            console.error('Error fetching carousel media:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % media.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const prevSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    useEffect(() => {
        if (media.length <= 1) return;
        const interval = setInterval(() => {
            // Only auto-advance if not currently animating/interacting
            if (!isAnimating) {
                setCurrentIndex((prev) => (prev + 1) % media.length);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [media.length, isAnimating]);

    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (!touchStart) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        if (diff > 50) nextSlide();
        if (diff < -50) prevSlide();
        setTouchStart(null);
    };

    if (loading) return null;
    if (media.length === 0) return (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', marginBottom: '1rem' }}>
            <p style={{ margin: 0 }}>Start capturing memories to see them here! 📸</p>
        </div>
    );

    const currentItem = media[currentIndex];
    const url = supabase.storage.from('memories').getPublicUrl(currentItem.storage_path).data.publicUrl;

    return (
        <div
            className="carousel-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
        >

            {/* Background Image (Blurred) */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(30px) brightness(0.7)',
                transform: 'scale(1.2)',
                transition: 'background-image 0.5s ease-in-out'
            }} />

            {/* Main Content */}
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isAnimating ? 0.5 : 1, transition: 'opacity 0.3s ease'
            }}>
                {currentItem.type === 'image' ? (
                    <img
                        src={url}
                        alt="Memory"
                        style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}
                    />
                ) : (
                    <video
                        src={url}
                        controls
                        style={{ maxHeight: '90%', maxWidth: '90%', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}
                    />
                )}
            </div>

            {/* Caption Overlay */}
            {currentItem.caption && (
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    color: 'white', padding: '3rem 1rem 1.5rem',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{currentItem.caption}</p>
                    <small style={{ opacity: 0.8, fontSize: '0.8rem' }}>{new Date(currentItem.created_at).toLocaleDateString()}</small>
                </div>
            )}

            {/* Navigation Chevrons - Desktop & Mobile */}
            <button
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="carousel-nav-button"
                style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    border: 'none', borderRadius: '50%',
                    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '1.5rem',
                    zIndex: 10
                }}
            >
                ‹
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="carousel-nav-button"
                style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    border: 'none', borderRadius: '50%',
                    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '1.5rem',
                    zIndex: 10
                }}
            >
                ›
            </button>

            {/* Dots Indicators */}
            <div style={{ position: 'absolute', bottom: '15px', right: '20px', display: 'flex', gap: '8px', zIndex: 10 }}>
                {media.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        style={{
                            width: idx === currentIndex ? '12px' : '8px',
                            height: '8px', borderRadius: '4px',
                            background: idx === currentIndex ? '#ff69b4' : 'rgba(255,255,255,0.5)',
                            transition: 'all 0.3s ease', cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
