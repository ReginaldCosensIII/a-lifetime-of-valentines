import React from 'react';

export default function DemoBanner({ onExit }) {
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '1rem 2rem',
            borderRadius: '50px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            border: '2px solid #ff69b4',
            width: '90%',
            maxWidth: '600px',
            justifyContent: 'space-between'
        }}>
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
