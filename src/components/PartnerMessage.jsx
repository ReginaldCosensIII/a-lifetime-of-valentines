
import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase';
import './ThemeOverrides.css';

export default function PartnerMessage({ coupleId, currentUserId, demoMode, demoData }) {
    const [message, setMessage] = useState('');
    const [senderId, setSenderId] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (demoMode) {
            if (demoData && demoData.length > 0) {
                const msg = demoData[0];
                setMessage(msg.message);
                setSenderId(msg.sender_id);
                setLastUpdated(msg.created_at);
            }
            return;
        }

        fetchMessage();

        // Subscribe to changes on the couples table for real-time updates
        const subscription = supabase
            .channel('couple-updates')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'couples', filter: `id=eq.${coupleId}` }, (payload) => {
                const newData = payload.new;
                setMessage(newData.partner_message);
                setSenderId(newData.partner_message_sender);
                setLastUpdated(newData.partner_message_at);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [coupleId, demoMode, demoData]);

    const fetchMessage = async () => {
        const { data, error } = await supabase
            .from('couples')
            .select('partner_message, partner_message_sender, partner_message_at')
            .eq('id', coupleId)
            .single();

        if (data) {
            setMessage(data.partner_message);
            setSenderId(data.partner_message_sender);
            setLastUpdated(data.partner_message_at);
        }
    };

    const handleUpdate = async () => {
        if (!newMessage.trim()) return;
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('couples')
                .update({
                    partner_message: newMessage,
                    partner_message_sender: currentUserId,
                    partner_message_at: new Date().toISOString()
                })
                .eq('id', coupleId);

            if (error) throw error;

            setMessage(newMessage);
            setSenderId(currentUserId);
            setLastUpdated(new Date().toISOString());
            setIsEditing(false);
            setNewMessage('');
        } catch (error) {
            console.error('Error updating message:', error);
            alert('Failed to update message.');
        } finally {
            setUpdating(false);
        }
    };

    const isMyMessage = senderId === currentUserId;
    const hasMessage = !!message;

    return (
        <div style={{ marginBottom: '2rem' }}>
            {/* Display Area */}
            {/* Display Area */}
            {hasMessage ? (
                <div className={`partner-message-card ${isMyMessage ? 'my-message' : ''}`} style={{
                    animation: !isMyMessage ? 'pulse-border 2s infinite' : 'none'
                }}>
                    <p className="partner-message-text" style={{ color: isMyMessage ? 'var(--text-muted)' : 'var(--primary-color)' }}>
                        "{message}"
                    </p>
                    <small className="partner-message-meta">
                        {isMyMessage ? 'You wrote this' : 'From your Valentine'} • {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>

                    {!isEditing && (
                        <button
                            onClick={() => { setIsEditing(true); setNewMessage(message); }}
                            style={{
                                position: 'absolute', top: '10px', right: '10px',
                                background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5
                            }}
                            title="Edit Note"
                        >
                            ✏️
                        </button>
                    )}
                </div>
            ) : (
                // Empty State Prompt
                <div
                    onClick={() => setIsEditing(true)}
                    className="partner-message-empty"
                >
                    <p style={{ margin: 0 }}>💌 Leave a sweet note for your partner...</p>
                </div>
            )}

            {/* Editing Mode */}
            {isEditing && (
                <div className="partner-message-edit">
                    <textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Write something sweet..."
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px', fontFamily: 'inherit', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                        autoFocus
                        disabled={demoMode}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setIsEditing(false)} className="secondary" style={{ fontSize: '0.9rem' }}>Cancel</button>
                        <button onClick={handleUpdate} className="primary" disabled={updating} style={{ fontSize: '0.9rem' }}>
                            {updating ? 'Posting...' : 'Post Note'}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse-border {
                    0% { box-shadow: 0 0 0 0 rgba(255, 105, 180, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(255, 105, 180, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 105, 180, 0); }
                }
            `}</style>
        </div>
    );
}
