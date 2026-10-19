import React from 'react';
import { Smartphone, Zap, Landmark, Banknote, Wallet, Check } from 'lucide-react';

export default function AccountRail({ accounts, selectedAccount, onSelectAccount }) {
  const getIcon = (type) => {
    switch (type) {
      case 'gpay': return <Smartphone size={16} />;
      case 'supermoney': return <Zap size={16} />;
      case 'bank': return <Landmark size={16} />;
      case 'cash': return <Banknote size={16} />;
      default: return <Wallet size={16} />;
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <Wallet size={16} color="#10b981" />
          Payment Sources
        </h2>
        {selectedAccount && (
          <button 
            className="section-link-action"
            onClick={() => onSelectAccount('')}
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="accounts-horizontal-scroll">
        {accounts.map(acc => {
          const isSelected = selectedAccount === acc.id;
          return (
            <div
              key={acc.id}
              className={`account-chip-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectAccount(isSelected ? '' : acc.id)}
            >
              <div className="acc-card-top">
                <div className={`acc-badge-icon ${acc.type}`}>
                  {getIcon(acc.type)}
                </div>
                {isSelected && (
                  <div style={{ background: '#10b981', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                    <Check size={12} color="#fff" />
                  </div>
                )}
              </div>
              
              <div>
                <div className="acc-name">{acc.name}</div>
                <div className="acc-balance">₹{acc.balance.toLocaleString('en-IN')}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
