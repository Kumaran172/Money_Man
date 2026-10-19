import React, { useState, useEffect } from 'react';
import { LogOut, Download, Smartphone } from 'lucide-react';

export default function Header({ profiles = [], selectedProfile, onProfileChange, isOnline, userName, onLogout }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(isPWA);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      // iOS / Fallback instruction
      alert('📱 To install on phone:\n\n• iPhone (Safari): Tap the Share button (⎋) at the bottom, then tap "Add to Home Screen".\n• Android: Tap the 3 dots (⋮) in Chrome, then tap "Install App" or "Add to Home screen".');
    }
  };

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo-badge">M</div>
        <div className="brand-info">
          <h1>Money Man</h1>
          <div className="live-badge">
            <span className="live-dot" style={{ background: isOnline ? '#10b981' : '#f43f5e' }} />
            {isOnline ? 'Live' : 'Offline'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Install Mobile App Button (if not already running inside standalone app) */}
        {!isStandalone && (
          <button
            onClick={handleInstallClick}
            title="Install Mobile App"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(56, 189, 248, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              padding: '6px 7px',
              borderRadius: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '0.68rem',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            <Download size={12} />
            <span>App</span>
          </button>
        )}

        {/* Profile switcher */}
        <select
          className="profile-pill-trigger"
          value={selectedProfile}
          onChange={(e) => onProfileChange(e.target.value)}
          style={{ 
            background: 'rgba(255,255,255,0.08)', 
            color: '#fff', 
            border: '1px solid rgba(255,255,255,0.15)', 
            maxWidth: '100px',
            fontSize: '0.74rem',
            padding: '5px 8px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          <option value="" style={{ background: '#0e1322' }}>👤 {userName || 'All'}</option>
          {profiles.map(p => (
            <option key={p.id} value={p.id} style={{ background: '#0e1322' }}>
              {p.avatar} {p.name}
            </option>
          ))}
        </select>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Logout"
          style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)',
            color: '#f87171', padding: '5px 7px', borderRadius: '9px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
