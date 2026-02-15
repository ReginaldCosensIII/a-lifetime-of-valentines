
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function PartnerRegister() {
    const [inviteCode, setInviteCode] = useState('');
    const [email, setEmail] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
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
                return;
            }
            if (data && data.is_locked) {
                setIsSystemLocked(true);
            }
        } catch (err) {
            console.error('System Check Exception:', err);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Verify invite code and temp password using Secure RPC
            const { data: rpcData, error: rpcError } = await supabase
                .rpc('verify_invite', { invite_code_input: inviteCode });

            if (rpcError) {
                console.error('RPC Error:', rpcError);
                throw new Error('Error verifying invite code.');
            }

            if (!rpcData || rpcData.length === 0) {
                throw new Error('Invalid invite code. Please check and try again.');
            }

            const coupleData = rpcData[0];

            if (coupleData.partner_user_id) {
                throw new Error('This invite code has already been used.');
            }

            // Verify email matches the one invited
            if (coupleData.partner_email && coupleData.partner_email.toLowerCase() !== email.toLowerCase()) {
                throw new Error('This email address does not match the one invited.');
            }

            // Verify temp password
            if (coupleData.partner_temp_password !== tempPassword) {
                throw new Error('Invalid temporary password.');
            }

            // 2. Sign up the partner
            const { data: { user }, error: authError } = await supabase.auth.signUp({
                email,
                password: newPassword, // Use the NEW password
            });

            if (authError) {
                throw new Error(authError.message);
            }

            if (user) {
                // 3. Link partner to couple
                const { error: updateError } = await supabase
                    .from('couples')
                    .update({
                        partner_email: email,
                        partner_user_id: user.id,
                        partner_temp_password: null // Clear temp password after use for security
                    })
                    .eq('id', coupleData.id);

                if (updateError) {
                    console.error('Error linking partner:', updateError);
                    // Critical error: User created but not linked. 
                    // In production, we'd need a robust retry or "claim" flow.
                    setError('Account created but failed to link to couple. Please contact support.');
                    setLoading(false);
                } else {
                    alert('Partner account created successfully! You are now linked.');
                    navigate('/');
                }
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
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
                <p style={{ color: '#888', marginTop: '0.5rem' }}>Join your partner's world</p>
            </div>

            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px', borderTop: '4px solid #ff69b4' }}>
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem' }}>Join Partner</h2>

                    {isSystemLocked ? (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                            <h3 style={{ color: '#d6336c' }}>Setup Complete</h3>
                            <p style={{ color: '#666' }}>
                                Both partners have joined this timeline. The circle is complete! 💖
                            </p>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                                <Link to="/login" className="primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Go to Login</Link>
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

                            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>Invite Code</label>
                                    <input
                                        type="text"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value)}
                                        placeholder="Received from partner"
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>

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
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>Temporary Password</label>
                                    <input
                                        type="text"
                                        value={tempPassword}
                                        onChange={(e) => setTempPassword(e.target.value)}
                                        placeholder="Provided in invite"
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ borderTop: '1px dashed #ddd', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#d6336c' }}>Set New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Create your permanent password"
                                        required
                                        minLength={6}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <button type="submit" className="primary" style={{ width: '100%', marginTop: '0.5rem', fontSize: '1rem', padding: '1rem' }} disabled={loading}>
                                    {loading ? 'Joining...' : 'Join & Set Password'}
                                </button>
                            </form>

                            <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <p style={{ marginBottom: '0.5rem' }}>Starting a new couple? <Link to="/signup" style={{ color: '#d6336c', fontWeight: '600' }}>Sign Up Here</Link></p>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>Already have an account? <Link to="/login" style={{ color: '#d6336c' }}>Login</Link></p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
