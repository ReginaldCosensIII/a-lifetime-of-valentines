
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import PartnerRegister from './pages/PartnerRegister'
import MediaUpload from './components/MediaUpload'
import CollageView from './components/CollageView'
import HeartBackground from './components/HeartBackground'
import PlansTimeline from './components/PlansTimeline'
import MediaCarousel from './components/MediaCarousel'
import PartnerMessage from './components/PartnerMessage'
import ShareModal from './components/ShareModal'
import SharedView from './pages/SharedView'

function Dashboard({ session }) {
    const [couple, setCouple] = useState(null)
    const [loading, setLoading] = useState(true)
    const [inviteSending, setInviteSending] = useState(false)
    const [valentinePlans, setValentinePlans] = useState('')
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [isMemoriesExpanded, setIsMemoriesExpanded] = useState(false)

    useEffect(() => {
        if (session?.user?.id) {
            fetchCoupleData(session.user.id)
        }
    }, [session])

    const fetchCoupleData = async (userId) => {
        try {
            console.log('Fetching couple data for user:', userId);

            // Check if owner
            const { data: ownerData, error: ownerError } = await supabase
                .from('couples')
                .select('*')
                .eq('owner_user_id', userId)
                .maybeSingle();

            if (ownerError && ownerError.code !== 'PGRST116') {
                console.error('Error fetching as owner:', ownerError);
            }

            if (ownerData) {
                console.log('Found as owner:', ownerData);
                setCouple(ownerData);
                return;
            }

            // Check if partner
            const { data: partnerData, error: partnerError } = await supabase
                .from('couples')
                .select('*')
                .eq('partner_user_id', userId)
                .maybeSingle();

            if (partnerError && partnerError.code !== 'PGRST116') {
                console.error('Error fetching as partner:', partnerError);
            }

            if (partnerData) {
                console.log('Found as partner:', partnerData);
                setCouple(partnerData);
            } else {
                console.log('No couple record found for this user.');
            }

        } catch (error) {
            console.error('Error in fetchCoupleData:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvite = async () => {
        if (!couple || !couple.partner_email || !couple.invite_code || !couple.partner_temp_password) {
            alert('Missing partner details. Cannot send invite.');
            return;
        }

        setInviteSending(true);
        try {
            console.log('Sending invite via direct fetch...');
            const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;

            const response = await fetch(`${VITE_SUPABASE_URL}/functions/v1/send-invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    partner_email: couple.partner_email,
                    invite_code: couple.invite_code,
                    temp_password: couple.partner_temp_password,
                    valentine_plans: valentinePlans
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Edge Function failed (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            alert('Invite email sent successfully! 💌');
            setShowInviteModal(false);
        } catch (error) {
            console.error('Error sending invite:', error);
            alert('Failed to send invite: ' + error.message);
        } finally {
            setInviteSending(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut()
    }

    if (loading) return <div className="container">Loading...</div>

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* Sticky Floating Glass Header */}
            <header className="glass-header">
                <div>
                    <h1 style={{ fontWeight: 'bold' }}>
                        <span className="brand-gradient-text">A Lifetime of Valentines</span>
                        <span> 💖</span>
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setShowShareModal(true)} className="secondary" style={{ whiteSpace: 'nowrap' }}>
                        🔗 Share
                    </button>
                    <button onClick={handleSignOut} className="secondary" style={{ whiteSpace: 'nowrap' }}>Sign Out</button>
                </div>
            </header>

            <div className="container" style={{ position: 'relative', zIndex: 1, marginTop: '2rem' }}>

                {couple ? (
                    <>
                        {/* TOP SECTION: Message Board & Carousel */}
                        {/* We use a max-width container to keep it neat inside the main flow */}
                        <div style={{ maxWidth: '700px', margin: '0 auto 2rem auto' }}>
                            <PartnerMessage coupleId={couple.id} currentUserId={session.user.id} />
                            <MediaCarousel coupleId={couple.id} />
                        </div>

                        {/* STATUS BANNER (If waiting) */}
                        {!couple.partner_user_id && (
                            <div className="card" style={{ maxWidth: '600px', margin: '0 auto 2rem auto', textAlign: 'center', background: '#fff9fa', border: '1px dashed #ffb6c1' }}>
                                <h3 style={{ marginTop: 0 }}>Waiting for Partner ⏳</h3>
                                <p>Share this code with your valentine:</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px', background: 'white', display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                                    {couple.invite_code}
                                </p>
                                {couple.partner_email && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <button onClick={() => setShowInviteModal(true)} className="primary">
                                            Resend Invite Email 💌
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MAIN LAYOUT: STRICT VERTICAL STACK (Single Column) */}
                        <div className="dashboard-grid">

                            {/* Section 1: Timeline */}
                            <div>
                                <PlansTimeline coupleId={couple.id} />
                            </div>

                            {/* Section 2: Collapsible Memories */}
                            <div className="card" style={{ padding: '1rem' }}>
                                <div
                                    onClick={() => setIsMemoriesExpanded(!isMemoriesExpanded)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                >
                                    <h3 style={{ margin: 0 }}>📸 Memories & Uploads</h3>
                                    <span style={{ fontSize: '1.2rem', transform: isMemoriesExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
                                </div>

                                {isMemoriesExpanded && (
                                    <div className="fade-in" style={{ marginTop: '1.5rem' }}>
                                        <MediaUpload coupleId={couple.id} onUploadComplete={() => fetchCoupleData(session.user.id)} />
                                        <div style={{ marginTop: '2rem' }}>
                                            <CollageView coupleId={couple.id} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </>
                ) : (
                    <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                        <div className="loader"></div>
                        <p>Loading your love story...</p>
                    </div>
                )}
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} coupleId={couple?.id} />
            )}

            {showInviteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%', margin: '1rem' }}>
                        <h3>Send Valentine's Invite 💌</h3>
                        <p>Customize the message for your partner.</p>

                        <textarea
                            value={valentinePlans}
                            onChange={(e) => setValentinePlans(e.target.value)}
                            placeholder="Add a special message or your Valentine's Day plans..."
                            style={{ width: '100%', height: '100px', margin: '1rem 0' }}
                        />

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowInviteModal(false)} className="secondary">Cancel</button>
                            <button onClick={handleSendInvite} className="primary" disabled={inviteSending}>
                                {inviteSending ? 'Sending...' : 'Send Email'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

import ForgotPassword from './pages/ForgotPassword'
import UpdatePassword from './pages/UpdatePassword'

function App() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (loading) {
        return <div className="container">Loading...</div>
    }

    return (
        <Router>
            <HeartBackground />
            <Routes>
                <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
                <Route path="/signup" element={!session ? <SignUp /> : <Navigate to="/" />} />
                <Route path="/register-partner" element={!session ? <PartnerRegister /> : <Navigate to="/" />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/share/:token" element={<SharedView />} />
                <Route path="/" element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    )
}

export default App
