import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { register, login } from '../api';

export default function LoginPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = mode === 'register'
        ? await register(name.trim(), email.trim(), password)
        : await login(email.trim(), password);

      if (res.success) {
        onAuthSuccess(res.user, res.profile);
      } else {
        setError(res.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure Money Man backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #151d36 0%, #070a13 60%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Ambient top glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '300px', height: '180px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(139,92,246,0.14) 60%, transparent 100%)',
        filter: 'blur(40px)', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px', zIndex: 1 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 800, color: '#fff',
            fontFamily: 'var(--font-display)',
            boxShadow: '0 8px 24px rgba(16,185,129,0.35)'
          }}>M</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', margin: 0 }}>
            Money Man
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>
            Your personal finance tracker
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(14, 21, 40, 0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '28px 24px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  background: mode === m ? (m === 'login' ? '#10b981' : '#8b5cf6') : 'none',
                  color: '#fff', border: 'none', padding: '10px',
                  borderRadius: '9px', fontSize: '0.88rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: 'var(--font-display)'
                }}
              >
                {m === 'login' ? '🔑 Sign In' : '✨ Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Your Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#64748b" style={{ position: 'absolute', left: '13px', top: '13px' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Kumaran"
                    required={mode === 'register'}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                      padding: '12px 12px 12px 38px', color: '#fff', fontSize: '0.9rem',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '13px', top: '13px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    padding: '12px 12px 12px 38px', color: '#fff', fontSize: '0.9rem',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '13px', top: '13px' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Min 4 characters' : 'Enter your password'}
                  required
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    padding: '12px 40px 12px 38px', color: '#fff', fontSize: '0.9rem',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.35)', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '16px', lineHeight: 1.4 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '14px',
                background: mode === 'login'
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#fff', border: 'none', borderRadius: '14px',
                fontSize: '1rem', fontWeight: 700,
                fontFamily: 'var(--font-display)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: mode === 'login' ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(139,92,246,0.3)',
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          {mode === 'register' && (
            <div style={{ marginTop: '16px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '12px', padding: '10px 12px', display: 'flex', gap: '8px' }}>
              <Sparkles size={16} color="#a78bfa" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '0.74rem', color: '#c4b5fd', margin: 0, lineHeight: 1.4 }}>
                Your account will come pre-loaded with <strong>KVB A/c 1516</strong>, GPay, Supermoney, and Cash accounts ready for SMS sync.
              </p>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#475569', marginTop: '16px' }}>
          Your data is stored privately on your local server.
        </p>
      </div>
    </div>
  );
}
