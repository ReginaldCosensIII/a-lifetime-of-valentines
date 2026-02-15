import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateInviteCode } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [partnerEmail, setPartnerEmail] = useState(''); // New state for partner email
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSystemLocked, setIsSystemLocked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkSystemStatus();
    }, []);

    const checkSystemStatus = async () => {
        try {
            const { data, error } = await supabase.rpc('get_system_status');
            if (error) {
                console.error('System Check Error:', error);
                // On error, we default to unlocked so users aren't blocked by technical issues
                return;
            }
            if (data && (data.is_locked || data.is_signup_locked)) {
                setIsSystemLocked(true);
            }
        } catch (err) {
            console.error('System Check Exception:', err);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Sign up the user (Primary)
        const { data: { user }, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (user) {
            // 2. Generate invite code and temp password
            const inviteCode = generateInviteCode();
            const tempPassword = Math.random().toString(36).slice(-8); // Simple temp password

            console.log('User created:', user.id);
            console.log('Invite Code:', inviteCode);
            console.log('Partner Temp Password:', tempPassword);

            const { data, error: dbError } = await supabase.from('couples').insert([
                {
                    owner_user_id: user.id,
                    invite_code: inviteCode,
                    partner_email: partnerEmail,
                    partner_temp_password: tempPassword
                },
            ]).select();

            if (dbError) {
                console.error('Error creating couple record:', dbError);
                setError(`Account created, but failed to setup couple profile. DB Error: ${dbError.message}`);
                setLoading(false);
            } else {
                console.log('Couple record created:', data);
                // Alert the user with the credentials to share
                alert(`Account created! \n\nShare these with your partner:\nInvite Code: ${inviteCode}\nTemp Password: ${tempPassword}\n\nThey will need these to join.`);
                navigate('/');
            }
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
                <p style={{ color: '#888', marginTop: '0.5rem' }}>Start your journey together</p>
            </div>

            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px', borderTop: '4px solid #ff69b4' }}>
                    {isSystemLocked ? (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                            <h3 style={{ color: '#d6336c', marginBottom: '0.5rem' }}>System Locked</h3>
                            <p style={{ color: '#666', marginBottom: '1rem', lineHeight: '1.5' }}>
                                This instance of <strong>A Lifetime of Valentines</strong> has already been claimed by its couple.
                            </p>
                            <div style={{ background: '#fff9fa', padding: '1rem', borderRadius: '8px', border: '1px dashed #ffb6c1', marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.5rem' }}>
                                    Want to create your own?
                                </p>
                                <a
                                    href="https://github.com/ReginaldCosensIII/a-lifetime-of-valentines"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="secondary"
                                    style={{ display: 'inline-block', textDecoration: 'none', fontSize: '0.9rem' }}
                                >
                                    Fork on GitHub ↗
                                </a>
                            </div>
                            <p style={{ fontSize: '0.9rem' }}>
                                <Link to="/login" className="primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Back to Login</Link>
                            </p>
                        </div>
                    ) : (
                        <>
                            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem' }}>Create Account</h2>

                            {error && (
                                <div style={{
                                    background: '#fff0f3', color: '#d6336c', padding: '0.8rem',
                                    borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ffccd5',
                                    textAlign: 'center'
                                }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
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

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Create a password"
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ borderTop: '1px dashed #eee', paddingTop: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>Partner's Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={partnerEmail}
                                        onChange={(e) => setPartnerEmail(e.target.value)}
                                        placeholder="Enter your partner's email"
                                        style={{ width: '100%' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                                        We'll use this to link their account when they join.
                                    </p>
                                </div>

                                <button type="submit" className="primary" style={{ width: '100%', marginTop: '0.5rem', fontSize: '1rem', padding: '1rem' }} disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Sign Up & Invite Partner'}
                                </button>
                            </form>

                            <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <p>Already have an account? <Link to="/login" style={{ color: '#d6336c', fontWeight: '600' }}>Login</Link></p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
