import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ShareModal({ coupleId, onClose }) {
    const [duration, setDuration] = useState('1'); // hours
    const [generatedLink, setGeneratedLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [copyStatus, setCopyStatus] = useState('');

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // 1. Calculate Expiry
            const hours = parseInt(duration);
            const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
            const token = crypto.randomUUID(); // Secure random token

            // 2. Insert into DB
            const { error } = await supabase
                .from('shared_links')
                .insert([{
                    couple_id: coupleId,
                    token: token,
                    expires_at: expiresAt,
                    is_active: true
                }]);

            if (error) throw error;

            // 3. Create Link
            const link = `${window.location.origin}/share/${token}`;
            setGeneratedLink(link);

        } catch (err) {
            console.error(err);
            alert('Failed to generate link.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopyStatus('Copied! ✅');
        setTimeout(() => setCopyStatus(''), 2000);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 2000, backdropFilter: 'blur(5px)'
        }}>
            <div className="card" style={{ maxWidth: '500px', width: '90%', margin: '1rem', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                    ✕
                </button>

                <h3 style={{ marginTop: 0, color: '#d6336c' }}>Share Your Love 🌏</h3>
                <p>Create a temporary link to share your timeline and memories with friends & family.</p>

                {!generatedLink ? (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Link Duration</label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            style={{ width: '100%', marginBottom: '1.5rem', padding: '0.8rem' }}
                        >
                            <option value="1">1 Hour</option>
                            <option value="3">3 Hours</option>
                            <option value="6">6 Hours</option>
                            <option value="12">12 Hours</option>
                            <option value="24">1 Day</option>
                            <option value="48">2 Days</option>
                        </select>

                        <button onClick={handleGenerate} className="primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Secure Link 🔗'}
                        </button>
                    </div>
                ) : (
                    <div className="fade-in">
                        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', wordBreak: 'break-all', marginBottom: '1rem', fontFamily: 'monospace' }}>
                            {generatedLink}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={handleCopy} className="primary" style={{ flex: 1 }}>
                                {copyStatus || 'Copy Link 📋'}
                            </button>
                            <button onClick={onClose} className="secondary">Done</button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '1rem', textAlign: 'center' }}>
                            This link will expire automatically in {duration} hour(s).
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
