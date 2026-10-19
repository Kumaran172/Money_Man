import React, { useState } from 'react';
import { X, Landmark, Smartphone, Banknote, Wallet, Zap, Plus, Check } from 'lucide-react';
import { createAccount } from '../api';

const PRESET_BANKS = [
  { name: 'SBI Savings', bankName: 'SBI', type: 'bank', color: '#280071', icon: 'Landmark' },
  { name: 'HDFC Bank', bankName: 'HDFC', type: 'bank', color: '#004c8f', icon: 'Landmark' },
  { name: 'ICICI Bank', bankName: 'ICICI', type: 'bank', color: '#f37021', icon: 'Landmark' },
  { name: 'Axis Bank', bankName: 'Axis', type: 'bank', color: '#97144d', icon: 'Landmark' },
  { name: 'Kotak Bank', bankName: 'Kotak', type: 'bank', color: '#ed1c24', icon: 'Landmark' },
  { name: 'KVB Bank', bankName: 'KVB', type: 'bank', color: '#047857', icon: 'Landmark' },
  { name: 'Canara Bank', bankName: 'Canara', type: 'bank', color: '#0091df', icon: 'Landmark' },
  { name: 'Bank of Baroda', bankName: 'BoB', type: 'bank', color: '#f26522', icon: 'Landmark' },
  { name: 'Cash Wallet', bankName: 'Cash', type: 'cash', color: '#f59e0b', icon: 'Banknote' },
  { name: 'Google Pay (UPI)', bankName: 'GPay', type: 'gpay', color: '#4285f4', icon: 'Smartphone' },
  { name: 'PhonePe', bankName: 'PhonePe', type: 'gpay', color: '#5f259f', icon: 'Smartphone' },
  { name: 'Paytm Wallet', bankName: 'Paytm', type: 'gpay', color: '#00b9f5', icon: 'Smartphone' },
];

export default function AddAccountModal({ isOpen, onClose, onAccountCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#004c8f');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePresetSelect = (preset) => {
    setName(preset.name);
    setType(preset.type);
    setColor(preset.color);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an account name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await createAccount({
        name: name.trim(),
        type,
        balance: parseFloat(balance) || 0,
        color,
        icon: type === 'cash' ? 'Banknote' : (type === 'gpay' ? 'Smartphone' : 'Landmark')
      });

      if (res.success) {
        onAccountCreated(res.data);
        onClose();
      } else {
        setError(res.error || 'Failed to create account');
      }
    } catch (err) {
      setError('Cannot connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: '440px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff' }}>
              Add Bank or Payment Source
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            POPULAR INDIAN BANKS & WALLETS:
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PRESET_BANKS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePresetSelect(p)}
                style={{
                  background: name === p.name ? p.color : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${name === p.name ? '#fff' : 'rgba(255,255,255,0.1)'}`,
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '5px 9px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                {p.bankName}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Account Name
            </label>
            <input
              type="text"
              className="input-text"
              placeholder="e.g. SBI Savings, HDFC Salary, Mom's A/c"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Account Type
              </label>
              <select
                className="input-text"
                value={type}
                onChange={e => setType(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: '#0e1528', color: '#fff' }}
              >
                <option value="bank">🏛️ Bank Account</option>
                <option value="gpay">📱 UPI / Mobile App</option>
                <option value="cash">💵 Cash in Hand</option>
                <option value="other">💳 Card / Wallet</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Initial Balance (₹)
              </label>
              <input
                type="number"
                step="any"
                className="input-text"
                placeholder="0"
                value={balance}
                onChange={e => setBalance(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Card Color Accent
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {['#004c8f', '#280071', '#f37021', '#97144d', '#ed1c24', '#047857', '#0091df', '#f59e0b', '#4285f4', '#8b5cf6'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: color === c ? `0 0 10px ${c}` : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '12px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-glass)', borderRadius: '12px',
                color: '#94a3b8', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-submit-action"
              style={{ flex: 2, padding: '12px', margin: 0, fontSize: '0.9rem' }}
            >
              {isLoading ? 'Saving...' : '✓ Add Payment Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
