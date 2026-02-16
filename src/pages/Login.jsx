import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSystemLocked, setIsSystemLocked] = useState(false);
    const [isSignupLocked, setIsSignupLocked] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);

    useEffect(() => {
        checkSystemStatus();
    }, []);

    const checkSystemStatus = async () => {
        try {
            const { data } = await supabase.rpc('get_system_status');
            if (data) {
                if (data.is_locked) setIsSystemLocked(true);
                if (data.is_signup_locked) setIsSignupLocked(true);
            }
        } catch (err) {
            console.error('System check failed:', err);
        }
    };

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

    const handleLockedNavigation = (e, path) => {
        e.preventDefault();

        // Granular locking logic
        if (path === '/signup' && (isSignupLocked || isSystemLocked)) {
            setShowLockModal(true);
        } else if (path === '/register-partner' && isSystemLocked) {
            setShowLockModal(true);
        } else {
            navigate(path);
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
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Sign in to your love story</p>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--primary-color)' }}>Email</label>
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
                                <label style={{ fontWeight: '500', color: 'var(--primary-color)' }}>Password</label>
                                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#d6336c', textDecoration: 'none' }}>Forgot?</Link>
                            </div>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? "🙉" : "🙈"}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="primary" style={{ width: '100%', marginTop: '0.5rem', fontSize: '1rem', padding: '1rem' }} disabled={loading}>
                            {loading ? 'Logging in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                        <p style={{ marginBottom: '0.5rem' }}>
                            Don't have an account?{' '}
                            <a href="/signup" onClick={(e) => handleLockedNavigation(e, '/signup')} style={{ color: '#d6336c', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' }}>
                                Sign Up
                            </a>
                        </p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Got an invite?{' '}
                            <a href="/register-partner" onClick={(e) => handleLockedNavigation(e, '/register-partner')} style={{ color: '#d6336c', textDecoration: 'none', cursor: 'pointer' }}>
                                Join Partner
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* System Locked Modal */}
            {showLockModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }} onClick={() => setShowLockModal(false)}>
                    <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔒</div>
                        <h3 style={{ color: '#d6336c', marginTop: 0 }}>System Locked</h3>
                        <p style={{ color: '#555', lineHeight: '1.6' }}>
                            This instance has already been setup by its couple. <br />
                            However, you can deploy your own private version!
                        </p>

                        <div style={{ background: '#fff9fa', padding: '1rem', borderRadius: '8px', border: '1px dashed #ffb6c1', margin: '1.5rem 0' }}>
                            <a
                                href="https://github.com/ReginaldCosensIII/a-lifetime-of-valentines"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="primary"
                                style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}
                            >
                                Fork on GitHub ↗
                            </a>
                            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem', marginBottom: 0 }}>
                                Free, private, and easy to setup.
                            </p>
                        </div>

                        <button onClick={() => setShowLockModal(false)} className="secondary" style={{ width: '100%' }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
