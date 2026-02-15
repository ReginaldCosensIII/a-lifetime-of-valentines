
import { useState, useEffect, useRef } from 'react'
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
import DemoBanner from './components/DemoBanner'
import { mockData } from './data/mockData'
import LoadingHeart from './components/LoadingHeart'
import logger from './utils/logger'
import ForgotPassword from './pages/ForgotPassword'
import UpdatePassword from './pages/UpdatePassword'

function Dashboard({ session, couple, showDemo, handleExitDemo, refreshData }) {
    const [inviteSending, setInviteSending] = useState(false)
    const [valentinePlans, setValentinePlans] = useState('')
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [isMemoriesExpanded, setIsMemoriesExpanded] = useState(false)
    const [manualInviteData, setManualInviteData] = useState(null)



    const [partnerEmail, setPartnerEmail] = useState('')

    useEffect(() => {
        if (couple?.partner_email) {
            setPartnerEmail(couple.partner_email)
        }
    }, [couple])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
    }

    const handleSendInvite = async () => {
        try {
            if (!partnerEmail) {
                alert('Please enter your partner\'s email address.')
                return
            }

            // Refresh session to ensure token is valid
            const { data: { session: freshSession }, error: refreshError } = await supabase.auth.refreshSession()
            if (refreshError || !freshSession) {
                console.error('Session refresh failed:', refreshError)
                alert('Session expired. Please sign in again.')
                return
            }

            setInviteSending(true)

            // If email changed or was missing, update it in DB first
            if (partnerEmail !== couple?.partner_email) {
                const { error: updateError } = await supabase
                    .from('couples')
                    .update({ partner_email: partnerEmail })
                    .eq('id', couple.id)

                if (updateError) throw updateError
            }

            // Log payload for debugging
            // console.log('Sending Invite with payload:', {
            //     coupleId: couple?.id,
            //     valentinePlans: valentinePlans || 'No plans specified',
            //     partner_email: partnerEmail,
            //     invite_code: couple.invite_code,
            //     temp_password: '***'
            // });

            const { error } = await supabase.functions.invoke('send-invite', {
                body: {
                    coupleId: couple?.id,
                    valentinePlans,
                    partner_email: partnerEmail,
                    invite_code: couple.invite_code,
                    temp_password: couple.partner_temp_password
                }
            })
            if (error) throw error
            setShowInviteModal(false)
            setValentinePlans('')
            alert('Invite sent successfully!')
        } catch (error) {
            console.error('Error sending invite:', error)
            // Fallback to manual display
            setManualInviteData({
                code: couple?.invite_code,
                password: couple?.partner_temp_password
            });
            // Don't close modal, let it re-render with manual data
        } finally {
            setInviteSending(false)
        }
    }


    // For logged-in users, if couple is null, it means they have no data yet OR data fetch failed/timed out.
    // Do NOT fall back to mockData.
    const displayCouple = couple;

    // CRITICAL FIX: If loading finished but we have no data, show an empty state or error
    // instead of crashing on displayCouple.partner_user_id
    if (!displayCouple) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h3>Starting your journey... 💖</h3>
                <p>We are setting up your personalized dashboard.</p>
                <button className="primary" onClick={() => window.location.reload()}>
                    Click to Retry
                </button>
            </div>
        )
    }

    return (
        <>
            <div style={{ paddingBottom: '4rem' }}>
                {/* ... header ... */}
                <header className="glass-header">
                    <div>
                        <h1 style={{ fontWeight: 'bold' }}>
                            <span className="brand-gradient-text">A Lifetime of Valentines</span>
                            <span> 💖</span>
                        </h1>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!displayCouple.partner_user_id && (
                            <div className="desktop-only">
                                <button onClick={() => setShowInviteModal(true)} className="primary" style={{ whiteSpace: 'nowrap' }}>
                                    Invite Partner 💌
                                </button>
                            </div>
                        )}
                        <button onClick={() => setShowShareModal(true)} className="secondary" style={{ whiteSpace: 'nowrap' }}>
                            🔗 Share
                        </button>
                        <button onClick={handleSignOut} className="secondary" style={{ whiteSpace: 'nowrap' }}>Sign Out</button>
                    </div>
                </header>

                {/* Mobile Invite Button (Stacked under header) */}
                {!displayCouple.partner_user_id && (
                    <div className="container mobile-only" style={{ marginTop: '0.5rem', marginBottom: '-1rem', textAlign: 'center' }}>
                        <button onClick={() => setShowInviteModal(true)} className="primary" style={{ width: '100%' }}>
                            Invite Partner 💌
                        </button>
                    </div>
                )}

                <div className="container" style={{ position: 'relative', zIndex: 1, marginTop: '2rem' }}>

                    {displayCouple ? (
                        <>
                            {showDemo && (
                                <DemoBanner
                                    onExit={handleExitDemo}
                                />
                            )}

                            {/* TOP SECTION: Message Board & Carousel */}
                            <div style={{ maxWidth: '700px', margin: '0 auto 2rem auto' }}>
                                <PartnerMessage
                                    coupleId={displayCouple.id}
                                    currentUserId={session.user.id}
                                    demoMode={showDemo}
                                    demoData={mockData.messages}
                                />
                                <MediaCarousel
                                    coupleId={displayCouple.id}
                                    demoMode={showDemo}
                                    demoData={mockData.media}
                                />
                            </div>

                            {/* STATUS BANNER (If waiting) - text modified for demo */}
                            {!displayCouple.partner_user_id && !showDemo && (
                                <div className="card" style={{ maxWidth: '600px', margin: '0 auto 2rem auto', textAlign: 'center', background: '#fff9fa', border: '1px dashed #ffb6c1' }}>
                                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto 2rem auto', textAlign: 'center', background: '#fff9fa', border: '1px dashed #ffb6c1' }}>
                                        <h3>Waiting for Partner... ⏳</h3>
                                        <p>Your timeline is technically active, but it looks better with two!</p>
                                        <p>Share your invite code: <strong>{displayCouple.invite_code}</strong></p>
                                        <button onClick={() => setShowInviteModal(true)} className="primary">
                                            Send Invite Email 💌
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* MAIN LAYOUT: STRICT VERTICAL STACK (Single Column) */}
                            <div className="dashboard-grid">

                                {/* Section 1: Timeline */}
                                <div>
                                    <PlansTimeline
                                        coupleId={displayCouple.id}
                                        demoMode={showDemo}
                                        demoData={mockData.timeline}
                                    />
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
                                            <MediaUpload
                                                coupleId={displayCouple.id}
                                                onUploadComplete={() => refreshData(session.user.id)}
                                                demoMode={showDemo}
                                                onDemoAction={handleExitDemo}
                                            />
                                            <div style={{ marginTop: '2rem' }}>
                                                <CollageView
                                                    coupleId={displayCouple.id}
                                                    demoMode={showDemo}
                                                    demoData={mockData.media}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </>
                    ) : (
                        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                            {/* Empty State / Loading */}
                            {/* If we are here, we are not loading, and we have no couple. */}
                            {/* This should act as the "Start Journey" state if Demo is exited */}
                            <h2>Ready to write your own story?</h2>
                            <button className="primary" onClick={() => window.location.href = '/setup'}>
                                Setup My Page
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Share Modal */}
            {
                showShareModal && (
                    <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} coupleId={couple?.id} />
                )
            }

            {
                showInviteModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
                        <div className="card" style={{ maxWidth: '500px', width: '90%', margin: '1rem' }}>
                            {manualInviteData ? (
                                <>
                                    <h3 style={{ color: '#d6336c' }}>Invite Email Failed 😓</h3>
                                    <p>But don't worry! You can send these details to your partner manually:</p>

                                    <div style={{ background: '#fff9fa', padding: '1rem', borderRadius: '8px', border: '1px dashed #ffb6c1', margin: '1rem 0', textAlign: 'left' }}>
                                        <p style={{ margin: '0.5rem 0' }}><strong>Invite Code:</strong> <code style={{ fontSize: '1.2rem', color: '#d6336c' }}>{manualInviteData.code}</code></p>
                                        <p style={{ margin: '0.5rem 0' }}><strong>Temp Password:</strong> <code style={{ fontSize: '1.2rem', color: '#d6336c' }}>{manualInviteData.password}</code></p>
                                        <p style={{ margin: '0.5rem 0' }}><strong>Link:</strong> <span style={{ fontSize: '0.9rem' }}>{window.location.origin}/register-partner?code={manualInviteData.code}</span></p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => {
                                            navigator.clipboard.writeText(`Hey! Join me on our Valentine's timeline.\n\nLink: ${window.location.origin}/register-partner?code=${manualInviteData.code}\nCode: ${manualInviteData.code}\nPassword: ${manualInviteData.password}`);
                                            alert('Copied to clipboard!');
                                        }} className="primary">
                                            Copy All to Clipboard 📋
                                        </button>
                                        <button onClick={() => { setShowInviteModal(false); setManualInviteData(null); }} className="secondary">
                                            Close
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3>Send Valentine's Invite 💌</h3>
                                    <p>Customize the message for your partner.</p>

                                    <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#555' }}>Partner's Email:</label>
                                        <input
                                            type="email"
                                            value={partnerEmail || ''}
                                            onChange={(e) => setPartnerEmail(e.target.value)}
                                            placeholder="partner@example.com"
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                        />
                                    </div>

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
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        </>
    )
}


function App() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [couple, setCouple] = useState(null)
    const [showDemo, setShowDemo] = useState(false)

    // Data Fetching Logic (Hoisted from Dashboard)
    const fetchCoupleData = async (userId) => {
        try {
            console.log('[App] Fetching couple data for user:', userId);

            // TIMEOUT WRAPPER: Fail DB queries if they take > 8s
            const DB_TIMEOUT_MS = 8000;
            const dbTimeout = () => new Promise((_, reject) => setTimeout(() => reject(new Error('DB_QUERY_TIMEOUT')), DB_TIMEOUT_MS));

            // Check if owner
            const ownerQuery = supabase
                .from('couples')
                .select('*, media(count), entries(count)')
                .eq('owner_user_id', userId)
                .maybeSingle();

            const { data: ownerData, error: ownerError } = await Promise.race([
                ownerQuery,
                dbTimeout()
            ]);

            if (ownerError) console.error('[App] Owner Fetch Error:', ownerError);
            if (ownerData) console.log('[App] Found as Owner:', ownerData.id);

            if (ownerData) {
                // FOUND AS OWNER
                const hasData = (ownerData.media && ownerData.media[0] && ownerData.media[0].count > 0) ||
                    (ownerData.entries && ownerData.entries[0] && ownerData.entries[0].count > 0);

                const isJourneyStarted = ownerData.status === 'active';

                // Always use real data for logged in users
                setCouple(ownerData);
                setShowDemo(false);
                return;
            }

            // Check if partner
            const partnerQuery = supabase
                .from('couples')
                .select('*, media(count), entries(count)')
                .eq('partner_user_id', userId)
                .maybeSingle();

            const { data: partnerData, error: partnerError } = await Promise.race([
                partnerQuery,
                dbTimeout()
            ]);

            if (partnerError) console.error('[App] Partner Fetch Error:', partnerError);
            if (partnerData) console.log('[App] Found as Partner:', partnerData.id);

            if (partnerData) {
                // FOUND AS PARTNER
                setCouple(partnerData);
                setShowDemo(false);
            } else {
                // NEW VISITOR (But logged in? This means they have a User auth but no Couple record)
                console.warn('[App] Logged in but no couple record found.');

                // CRITICAL FIX: Do NOT show demo mode for authenticated users.
                // Leave couple as null (or empty object) so the Dashboard can show the "Setup" state.
                setShowDemo(false);
                setCouple(null);
            }

        } catch (error) {
            console.error('Error in fetchCoupleData:', error);
            // If it was a timeout, ensure we don't leave the app hanging.
            // setCouple(null) will let the "Retry" screen show.
            if (error.message === 'DB_QUERY_TIMEOUT') {
                console.error('[App] Database query timed out. Showing Retry screen.');
                setCouple(null);
            }
        }
    };

    const handleExitDemo = async () => {
        try {
            // Persist the "Start Journey" action
            if (session?.user?.id && couple?.id && couple.is_real_user) {
                await supabase
                    .from('couples')
                    .update({ status: 'active' })
                    .eq('id', couple.id);
            }

            setShowDemo(false);

            if (session?.user?.id) {
                // Re-fetch to get clean data
                await fetchCoupleData(session.user.id);
            }
        } catch (err) {
            console.error('Error exiting demo:', err);
        }
    };

    const authListenerHandling = useRef(false);

    useEffect(() => {
        let mounted = true;
        const LOADING_TIMEOUT_MS = 12000; // Increased to 12s for cold starts

        const initSession = async () => {
            const MIN_LOAD_TIME_MS = 2000; // Force at least 2 seconds
            try {
                logger.group('Auth Initialization');
                logger.info('Starting session check...');

                // Race for session
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Session check timed out')), LOADING_TIMEOUT_MS)
                );
                // Min delay promise
                const minDelayPromise = new Promise(resolve => setTimeout(resolve, MIN_LOAD_TIME_MS));

                // Wait for Race AND Min Delay
                const [raceResult] = await Promise.all([
                    Promise.race([sessionPromise, timeoutPromise]),
                    minDelayPromise
                ]);

                const { data: { session: foundSession } } = raceResult;

                if (mounted) {
                    // If authListener already grabbed the session, we don't need to do anything here
                    // to avoid double-fetching or race conditions.
                    if (authListenerHandling.current) {
                        logger.info('Auth listener took over. InitSession yielding.');
                        return;
                    }

                    logger.info('Session retrieved:', foundSession ? 'User found' : 'No user');
                    setSession(foundSession);

                    // IF user is found, we MUST fetch data BEFORE stopping loading
                    // This prevents the "flash" of a second loading screen
                    if (foundSession?.user?.id) {
                        logger.info('Fetching couple data...');
                        await fetchCoupleData(foundSession.user.id);
                    }

                    setLoading(false);
                }
            } catch (err) {
                logger.error('Auth Init Error:', err);
                if (mounted) {
                    if (err.message === 'Session check timed out') {
                        // CRITICAL FIX: If auth listener is working, DO NOT force stop.
                        // Let the auth listener finish its fetch.
                        if (authListenerHandling.current) {
                            logger.warn('Timeout hit, but Auth Listener is active. Yielding to allow fetch to complete.');
                            return;
                        }

                        logger.warn('Force stopping loading due to timeout.');
                        setLoading(false);
                    } else {
                        setError(err);
                        setLoading(false);
                    }
                }
            } finally {
                logger.groupEnd();
            }
        };

        initSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                // Mark that we are handling this event
                authListenerHandling.current = true;

                logger.info('Auth State Change:', _event);
                setSession(session);

                // If this is a login event, we MUST fetch data BEFORE stopping loading
                if (session?.user?.id) {
                    logger.info('Auth Change: Fetching couple data...');
                    await fetchCoupleData(session.user.id);
                }
                setLoading(false);
            }
        })

        return () => {
            mounted = false;
            subscription.unsubscribe();
        }
    }, [])

    if (loading) {
        return <LoadingHeart message="Loading" />;
    }

    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h3>Something went wrong 😓</h3>
                <p>We couldn't load your session.</p>
                <button className="primary" onClick={() => window.location.reload()}>Retry</button>
            </div>
        )
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
                <Route path="/" element={
                    session ?
                        <Dashboard
                            session={session}
                            couple={couple}
                            showDemo={showDemo}
                            handleExitDemo={handleExitDemo}
                            refreshData={fetchCoupleData}
                        /> :
                        <Navigate to="/login" />
                } />
            </Routes>
        </Router>
    )
}

export default App
