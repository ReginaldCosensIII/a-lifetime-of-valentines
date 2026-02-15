import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            {/* Branding Header */}
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
                <p style={{ color: '#888', marginTop: '0.5rem' }}>Sign in to your love story</p>
            </div>

            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px', borderTop: '4px solid #ff69b4' }}>
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem' }}>Login</h2>

                    {error && (
                        <div style={{
                            background: '#fff0f3', color: '#d6336c', padding: '0.8rem',
                            borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ffccd5',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: '500', color: '#555' }}>Password</label>
                                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#d6336c', textDecoration: 'none' }}>Forgot?</Link>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <button type="submit" className="primary" style={{ width: '100%', marginTop: '0.5rem', fontSize: '1rem', padding: '1rem' }} disabled={loading}>
                            {loading ? 'Logging in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                        <p style={{ marginBottom: '0.5rem' }}>Don't have an account? <Link to="/signup" style={{ color: '#d6336c', fontWeight: '600' }}>Sign Up</Link></p>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>Got an invite? <Link to="/register-partner" style={{ color: '#d6336c' }}>Join Partner</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
