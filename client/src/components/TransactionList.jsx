import React, { useState } from 'react';
import { 
  Utensils, ShoppingBag, Car, FileText, Film, ShoppingCart, 
  HeartPulse, Briefcase, Laptop, Gift, ArrowDownLeft, 
  MoreHorizontal, Trash2, Search, Filter 
} from 'lucide-react';

export default function TransactionList({ transactions, onDeleteTransaction, currentFilterAccountName }) {
  const [searchTerm, setSearchTerm] = useState('');

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food & Dining': return <Utensils size={18} color="#f43f5e" />;
      case 'Shopping': return <ShoppingBag size={18} color="#ec4899" />;
      case 'Travel & Fuel': return <Car size={18} color="#06b6d4" />;
      case 'Bills & Recharge': return <FileText size={18} color="#eab308" />;
      case 'Entertainment': return <Film size={18} color="#8b5cf6" />;
      case 'Groceries': return <ShoppingCart size={18} color="#10b981" />;
      case 'Health & Medical': return <HeartPulse size={18} color="#ef4444" />;
      case 'Salary': return <Briefcase size={18} color="#10b981" />;
      case 'Freelance / Projects': return <Laptop size={18} color="#3b82f6" />;
      case 'Cashback & Rewards': return <Gift size={18} color="#f59e0b" />;
      default: return <ArrowDownLeft size={18} color="#64748b" />;
    }
  };

  const getSourceStyle = (accountType) => {
    switch (accountType) {
      case 'gpay': return { background: 'rgba(66, 133, 244, 0.2)', color: '#60a5fa' };
      case 'supermoney': return { background: 'rgba(147, 51, 234, 0.2)', color: '#c084fc' };
      case 'bank': return { background: 'rgba(15, 118, 110, 0.25)', color: '#2dd4bf' };
      case 'cash': return { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' };
      default: return { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' };
    }
  };

  const filtered = transactions.filter(t => {
    const matchesSearch = !searchTerm || 
      (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.profile_name && t.profile_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <span>Recent Activity</span>
          {currentFilterAccountName && (
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
              ({currentFilterAccountName})
            </span>
          )}
        </h2>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {filtered.length} entries
        </span>
      </div>

      {/* Mini Search Bar */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
        <input 
          type="text"
          className="input-text"
          placeholder="Search by note, category, or person..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '36px', height: '38px', fontSize: '0.82rem' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8' }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No transactions found</p>
          <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Tap the + button below to log your first spend or income!</p>
        </div>
      ) : (
        <div className="transaction-group">
          {filtered.map(tx => {
            const isCredit = tx.type === 'credit';
            return (
              <div key={tx.id} className="transaction-card">
                <div className="tx-left">
                  <div 
                    className="tx-cat-icon"
                    style={{ background: isCredit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)' }}
                  >
                    {getCategoryIcon(tx.category)}
                  </div>

                  <div className="tx-details">
                    <span className="tx-category-name">{tx.category}</span>
                    <div className="tx-meta-sub">
                      <span className="tx-source-tag" style={getSourceStyle(tx.account_type)}>
                        {tx.account_name || 'Wallet'}
                      </span>
                      <span>•</span>
                      <span>{tx.date}</span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tx.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="tx-right">
                  <span className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>
                    {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {tx.profile_name && (
                      <span className="tx-person-badge">
                        👤 {tx.profile_name}
                      </span>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete ${tx.category} (₹${tx.amount})?`)) {
                          onDeleteTransaction(tx.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '2px' }}
                      title="Delete transaction"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
