import React from 'react';

export default function DemoBanner({ onExit }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', backgroundColor: '#fff', borderBottom: '1px solid #eee', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', color: '#d6336c', fontSize: '1rem' }}>Viewing Demo Mode</strong>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>This is sample data. Ready to start?</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={onExit}
                    className="primary"
                    style={{
                        whiteSpace: 'nowrap',
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 15px rgba(214, 51, 108, 0.3)',
                        borderRadius: '25px'
                    }}
                >
                    Start My Journey 🚀
                </button>
            </div>
        </div >
    );
}
