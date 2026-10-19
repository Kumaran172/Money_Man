import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  accounts, 
  profiles, 
  categories, 
  initialType = 'debit',
  onSubmit 
}) {
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('');
  const [profileId, setProfileId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
    if (profiles.length > 0 && !profileId) {
      const defaultProf = profiles.find(p => p.is_default) || profiles[0];
      setProfileId(defaultProf.id);
    }
  }, [accounts, profiles]);

  // Update default category when type changes
  useEffect(() => {
    const relevantCategories = categories.filter(c => c.type === (type === 'credit' ? 'income' : 'expense'));
    if (relevantCategories.length > 0) {
      setCategory(relevantCategories[0].name);
    }
  }, [type, categories]);

  if (!isOpen) return null;

  const relevantCategories = categories.filter(c => c.type === (type === 'credit' ? 'income' : 'expense'));

  const handleQuickAdd = (addVal) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }
    if (!accountId) {
      setErrorMsg('Please select a payment account');
      return;
    }
    if (!category) {
      setErrorMsg('Please select a category');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        amount: parseFloat(amount),
        account_id: accountId,
        category,
        profile_id: profileId,
        note,
        date
      });

      // Fire celebratory confetti on phone screen for income or savings
      if (type === 'credit') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Reset form
      setAmount('');
      setNote('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>

        <div className="sheet-header">
          <h2>{type === 'credit' ? 'Record Income / Credit' : 'Record Expense / Debit'}</h2>
          <button className="btn-close-sheet" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '12px' }}>
            {errorMsg}
          </div>
        )}

        {/* Type Toggle */}
        <div className="form-type-toggle">
          <button
            type="button"
            className={`toggle-option-btn ${type === 'debit' ? 'active debit' : ''}`}
            onClick={() => setType('debit')}
          >
            Debit (Spent)
          </button>
          <button
            type="button"
            className={`toggle-option-btn ${type === 'credit' ? 'active credit' : ''}`}
            onClick={() => setType('credit')}
          >
            Credit (Received)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div className="form-group">
            <label className="form-label">Amount</label>
            <div className="input-amount-wrapper">
              <span className="prefix">₹</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                className="input-amount"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>

            {/* Fast Quick-add Chips */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              {[100, 500, 1000, 2000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '6px',
                    color: '#94a3b8',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  +₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Account Selector */}
          <div className="form-group">
            <label className="form-label">Payment Source / App</label>
            <div className="chip-grid">
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  type="button"
                  className={`select-chip ${accountId === acc.id ? 'active' : ''}`}
                  onClick={() => setAccountId(acc.id)}
                >
                  {acc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="chip-grid">
              {relevantCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`select-chip ${category === cat.name ? 'active' : ''}`}
                  onClick={() => setCategory(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Person / Profile Tracker */}
          <div className="form-group">
            <label className="form-label">Person / Profile</label>
            <div className="chip-grid">
              {profiles.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`select-chip ${profileId === p.id ? 'active' : ''}`}
                  onClick={() => setProfileId(p.id)}
                >
                  {p.avatar} {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Note & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Note (Optional)</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. Swiggy, Fuel"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                className="input-text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-submit-action"
            disabled={isSubmitting}
            style={{
              background: type === 'credit' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
            }}
          >
            {isSubmitting ? 'Saving...' : `Save ${type === 'credit' ? 'Income' : 'Spend'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
