import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Ensure we have a session (handled by auto-login from link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If no session, maybe link expired?
                setError('Invalid or expired reset link. Please try again.');
            }
        });
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            alert('Password updated successfully! Redirecting to dashboard...');
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '2rem 1rem 1rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    margin: 0,
                    filter: 'drop-shadow(0 2px 4px rgba(214, 51, 108, 0.2))',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap'
                }}>
                    <span className="brand-gradient-text">A Lifetime of Valentines</span>
                    <span> 💖</span>
                </h1>
                <p style={{ color: '#888', marginTop: '0.5rem' }}>Secure your account</p>
            </div>

            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px', borderTop: '4px solid #ff69b4' }}>
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem' }}>Set New Password</h2>

                    {error && (
                        <div style={{
                            background: '#fff0f3', color: '#d6336c', padding: '0.8rem',
                            borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ffccd5',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <button type="submit" className="primary" style={{ width: '100%', marginTop: '0.5rem', fontSize: '1rem', padding: '1rem' }} disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
