import React, { useState } from 'react';
import { Smartphone, Zap, Landmark, Banknote, Wallet, Check, Plus } from 'lucide-react';
import AddAccountModal from './AddAccountModal';

export default function AccountRail({ accounts, selectedAccount, onSelectAccount, onAccountCreated }) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'gpay': return <Smartphone size={16} />;
      case 'supermoney': return <Zap size={16} />;
      case 'bank': return <Landmark size={16} />;
      case 'cash': return <Banknote size={16} />;
      default: return <Wallet size={16} />;
    }
  };

  const handleAccountAdded = (newAccount) => {
    if (onAccountCreated) onAccountCreated(newAccount);
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <Wallet size={16} color="#10b981" />
          Payment Sources
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedAccount && (
            <button 
              className="section-link-action"
              onClick={() => onSelectAccount('')}
            >
              Clear Filter
            </button>
          )}
          <button
            onClick={() => setIsAddOpen(true)}
            style={{
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              color: '#34d399',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={13} />
            <span>Add Bank</span>
          </button>
        </div>
      </div>

      <div className="accounts-horizontal-scroll">
        {accounts.map(acc => {
          const isSelected = selectedAccount === acc.id;
          return (
            <div
              key={acc.id}
              className={`account-chip-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectAccount(isSelected ? '' : acc.id)}
              style={acc.color ? { borderLeftColor: acc.color, borderLeftWidth: '3px' } : {}}
            >
              <div className="acc-card-top">
                <div className={`acc-badge-icon ${acc.type}`} style={acc.color ? { background: acc.color } : {}}>
                  {getIcon(acc.type)}
                </div>
                {isSelected && (
                  <div style={{ background: '#10b981', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                    <Check size={12} color="#fff" />
                  </div>
                )}
              </div>
              
              <div>
                <div className="acc-name" title={acc.name}>{acc.name}</div>
                <div className="acc-balance">₹{acc.balance.toLocaleString('en-IN')}</div>
              </div>
            </div>
          );
        })}

        {/* Add Bank Card Shortcut */}
        <div
          className="account-chip-card"
          onClick={() => setIsAddOpen(true)}
          style={{
            borderStyle: 'dashed',
            borderColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.02)',
            minWidth: '130px'
          }}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={18} />
          </div>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8' }}>+ Add Bank</span>
        </div>
      </div>

      {isAddOpen && (
        <AddAccountModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAccountCreated={handleAccountAdded}
        />
      )}
    </div>
  );
}
