
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function PlansTimeline({ coupleId }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [title, setTitle] = useState('');
    const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]); // Default today
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (coupleId) fetchPlans();
    }, [coupleId]);

    const fetchPlans = async () => {
        try {
            const { data, error } = await supabase
                .from('entries')
                .select('*')
                .eq('couple_id', coupleId)
                .order('event_date', { ascending: false });

            if (error) throw error;
            setPlans(data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const planData = {
                couple_id: coupleId,
                title,
                event_date: eventDate,
                location,
                notes
            };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase
                    .from('entries')
                    .update(planData)
                    .eq('id', editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('entries')
                    .insert([planData]);
                error = insertError;
            }

            if (error) throw error;

            // Reset Form
            setTitle('');
            setLocation('');
            setNotes('');
            setEventDate(new Date().toISOString().split('T')[0]);
            setEditingId(null);

            fetchPlans(); // Refresh list
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Failed to save plan: ' + error.message);
        }
    };

    const handleEdit = (plan) => {
        setEditingId(plan.id);
        setTitle(plan.title);
        setEventDate(plan.event_date);
        setLocation(plan.location || '');
        setNotes(plan.notes || '');
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        try {
            const { error } = await supabase.from('entries').delete().eq('id', id);
            if (error) throw error;
            fetchPlans();
        } catch (error) {
            console.error('Error deleting plan:', error);
        }
    };

    if (loading) return <div>Loading timeline...</div>;

    return (
        <div className="timeline-container">
            <h3>💌 Valentine's Timeline</h3>

            <form onSubmit={handleSubmit} className="plan-form" style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <h4>{editingId ? 'Edit Plan' : 'Add New Plan'}</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                        <label>Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Dinner at Luigi's" style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label>Date</label>
                        <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                    </div>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                    <label>Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Where is it happening?" style={{ width: '100%' }} />
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                    <label>Notes/Memories</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special details..." style={{ width: '100%', minHeight: '80px' }} />
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="primary">{editingId ? 'Update Plan' : 'Add Plan'}</button>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setTitle(''); setLocation(''); setNotes(''); }} className="secondary">Cancel</button>}
                </div>
            </form>

            <div className="plans-list">
                {plans.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>No plans recorded yet. Start your timeline!</p>
                ) : (
                    plans.map(plan => (
                        <div key={plan.id} className="plan-card" style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #ff69b4', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: '#d6336c' }}>{plan.title}</h4>
                                    <small style={{ color: '#888' }}>{new Date(plan.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(plan)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✏️</button>
                                    <button onClick={() => handleDelete(plan.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                                </div>
                            </div>
                            {plan.location && <p style={{ margin: '0.5rem 0 0', fontStyle: 'italic' }}>📍 {plan.location}</p>}
                            {plan.notes && <p style={{ margin: '0.5rem 0 0' }}>{plan.notes}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
