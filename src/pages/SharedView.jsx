import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SharedView() {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) fetchSharedData();
    }, [token]);

    const fetchSharedData = async () => {
        try {
            // Call the secure RPC function
            const { data: result, error: rpcError } = await supabase
                .rpc('get_shared_timeline', { limit_token: token });

            console.log('Shared Data:', result);

            if (rpcError) throw rpcError;
            if (!result) throw new Error('Invalid or expired link.');

            setData(result);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to load shared view.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading shared memories... 💖</div>;

    if (error) return (
        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
            <h2>Link Expired or Invalid 💔</h2>
            <p>{error}</p>
        </div>
    );

    const { media, plans } = data;

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            <header className="glass-header">
                <div>
                    <h1 style={{ fontWeight: 'bold' }}>
                        <span className="brand-gradient-text">A Lifetime of Valentines</span>
                        <span> 💖</span>
                    </h1>
                </div>
            </header>

            <div className="container" style={{ marginTop: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.8rem', color: '#d6336c' }}>Our Shared Journey</h2>
                </div>

                {/* 1. Timeline Section */}
                {plans && plans.length > 0 && (
                    <div style={{ marginBottom: '4rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅 Our Timeline</h3>
                            <p style={{ color: '#888', fontStyle: 'italic' }}>The plan for our special day</p>
                        </div>

                        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {plans.map(plan => (
                                <div key={plan.id} className="card timeline-card" style={{
                                    padding: '1.5rem',
                                    marginBottom: 0, // Reset margin since we use flex gap
                                    borderLeft: '4px solid #ff69b4',
                                    background: 'rgba(255, 255, 255, 0.9)'
                                }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#d6336c', fontSize: '1.25rem' }}>{plan.title}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', color: '#666', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                                        <span>📅 {new Date(plan.date).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {plan.location && <span>📍 {plan.location}</span>}
                                    </div>
                                    {plan.notes && <p style={{ margin: 0, lineHeight: '1.6', color: '#444' }}>{plan.notes}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Media Section (Bento Grid) */}
                {media && media.length > 0 && (
                    <div className="fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📸 Shared Memories</h3>
                            <p style={{ color: '#888', fontStyle: 'italic' }}>Moments frozen in time</p>
                        </div>

                        <div className="bento-grid">
                            {media.map((item, index) => {
                                const publicUrl = supabase.storage.from('memories').getPublicUrl(item.url).data.publicUrl;
                                // Simple logic to span some items for visual variety (every 5th item spans 2 cols, every 7th 2 rows)
                                const isSpanCol = index % 5 === 0;
                                const isSpanRow = index % 7 === 0;

                                return (
                                    <div key={item.id} className={`bento-item ${isSpanCol ? 'span-2' : ''} ${isSpanRow ? 'row-2' : ''}`}>
                                        {item.type === 'image' ? (
                                            <img src={publicUrl} alt={item.caption || 'Memory'} loading="lazy" />
                                        ) : (
                                            <video src={publicUrl} muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                                        )}

                                        <div className="bento-overlay">
                                            <div className="bento-caption">
                                                <p style={{ margin: 0 }}>{item.caption || '❤️'}</p>
                                                {item.year && <small style={{ opacity: 0.8, fontWeight: 'normal' }}>{item.year}</small>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
