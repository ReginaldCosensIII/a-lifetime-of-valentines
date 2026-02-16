import React from 'react';
import './SettingsDrawer.css';

const SettingsDrawer = ({ isOpen, onClose, children }) => {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`settings-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`settings-drawer ${isOpen ? 'open' : ''}`}>
                <div className="settings-header">
                    <h2 className="text-xl font-bold font-display" style={{ margin: 0 }}>
                        Settings ⚙️
                    </h2>
                    <button
                        onClick={onClose}
                        className="secondary"
                        style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label="Close settings"
                    >
                        ✕
                    </button>
                </div>

                <div className="settings-content">
                    {children}
                </div>
            </div>
        </>
    );
};

export const SettingsSection = ({ title, children }) => (
    <div className="space-y-3">
        <h3 className="settings-section-title">
            {title}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {children}
        </div>
    </div>
);

export const SettingsItem = ({ icon, title, description, action }) => (
    <div className="settings-item">
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="settings-icon">{icon}</span>
            <div className="settings-info">
                <h4>{title}</h4>
                {description && <p>{description}</p>}
            </div>
        </div>
        <div>
            {action}
        </div>
    </div>
);

export default SettingsDrawer;
