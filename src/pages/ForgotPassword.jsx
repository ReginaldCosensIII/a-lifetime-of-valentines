import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;

            setMessage('Check your email for the password reset link! 📧');
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
                <p style={{ color: '#888', marginTop: '0.5rem' }}>Recover your account</p>
            </div>

            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px', borderTop: '4px solid #ff69b4' }}>
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem' }}>Reset Password</h2>

                    {message ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                background: '#e6fffa', color: '#2c7a7b', padding: '1rem',
                                borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #b2f5ea'
                            }}>
                                {message}
                            </div>
                            <p>
                                <Link to="/login" className="secondary" style={{ display: 'inline-block', textDecoration: 'none' }}>Back to Login</Link>
                            </p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div style={{
                                    background: '#fff0f3', color: '#d6336c', padding: '0.8rem',
                                    borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ffccd5',
                                    textAlign: 'center'
                                }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>Your Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="name@example.com"
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <button type="submit" className="primary" style={{ width: '100%', marginTop: '0.5rem', fontSize: '1rem', padding: '1rem' }} disabled={loading}>
                                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                                </button>
                            </form>

                            <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <Link to="/login" style={{ color: '#d6336c', fontWeight: '500' }}>Back to Login</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
