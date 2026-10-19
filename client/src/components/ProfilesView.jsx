import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ArrowDownLeft, ArrowUpRight, Database, ShieldCheck, Mail, Calendar, CreditCard } from 'lucide-react';
import { createProfile, fetchAllUsers } from '../api';

export default function ProfilesView({ 
  profiles = [], 
  onRefresh, 
  onRefreshProfiles, 
  selectedProfile, 
  onProfileSelect, 
  onSelectProfile, 
  onSwitchToHome 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [color, setColor] = useState('#10b981');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MongoDB Atlas directory states
  const [atlasUsers, setAtlasUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const emojiOptions = ['👤', '👨‍👩‍👧', '🌴', '💼', '🍕', '🏠', '🚗', '🎓', '🐶'];

  const refreshAction = onRefresh || onRefreshProfiles || (() => {});
  const selectAction = onProfileSelect || onSelectProfile || (() => {});
  const homeAction = onSwitchToHome || (() => {});

  useEffect(() => {
    loadAtlasUsers();
  }, []);

  const loadAtlasUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetchAllUsers();
      if (res.success && res.data) {
        setAtlasUsers(res.data);
      }
    } catch (err) {
      console.error('Error fetching Atlas users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createProfile({ name: name.trim(), avatar, color });
      if (res.success) {
        setName('');
        setShowAddForm(false);
        refreshAction();
      }
    } catch (err) {
      console.error('Failed to create profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── SECTION 1: Personal Profiles ─────────────────────────── */}
      <div>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Users size={16} color="#10b981" />
              Person & Group Trackers
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              Separate spending & income for you, family, or friends
            </p>
          </div>

          <button 
            className="btn-quick-action credit"
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '10px' }}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <UserPlus size={14} />
            <span>+ Add Person</span>
          </button>
        </div>

        {/* Add New Profile Form Modal */}
        {showAddForm && (
          <div className="glass-card" style={{ borderColor: 'var(--emerald)', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#fff' }}>
              Create New Person / Tracker
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="e.g. Dad, Mom, Goa Trip, Roommate"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Icon</label>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {emojiOptions.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setAvatar(em)}
                      style={{
                        fontSize: '1.2rem',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: avatar === em ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                        border: avatar === em ? '1px solid #10b981' : '1px solid var(--border-glass)',
                        cursor: 'pointer'
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-submit-action"
                disabled={isSubmitting}
                style={{ padding: '10px', fontSize: '0.88rem' }}
              >
                {isSubmitting ? 'Adding...' : 'Save Person'}
              </button>
            </form>
          </div>
        )}

        {/* Profiles List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {profiles.map(p => {
            const isSelected = selectedProfile === p.id;
            const net = (p.total_income || 0) - (p.total_spent || 0);

            return (
              <div 
                key={p.id} 
                className="glass-card"
                style={{
                  borderColor: isSelected ? 'var(--emerald)' : 'var(--border-glass)',
                  background: isSelected ? 'rgba(20, 35, 60, 0.85)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="profile-avatar-bubble">
                      {p.avatar || '👤'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>
                        {p.name}
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {p.transaction_count || 0} logged transactions
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      selectAction(isSelected ? '' : p.id);
                      homeAction();
                    }}
                    style={{
                      background: isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? '✓ Viewing' : 'View Feed'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(0, 0, 0, 0.2)', padding: '10px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="pill-icon-wrap income" style={{ width: '28px', height: '28px' }}>
                      <ArrowDownLeft size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Total Credited</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#10b981' }}>
                        +₹{(p.total_income || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="pill-icon-wrap expense" style={{ width: '28px', height: '28px' }}>
                      <ArrowUpRight size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Total Debited</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f43f5e' }}>
                        -₹{(p.total_spent || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>Net Position</span>
                  <span style={{ fontWeight: 700, color: net >= 0 ? '#10b981' : '#f43f5e' }}>
                    {net >= 0 ? '+₹' : '-₹'}{Math.abs(net).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: MongoDB Atlas Accounts Directory ──────────── */}
      <div>
        <div className="section-header" style={{ marginBottom: '8px' }}>
          <div>
            <h2 className="section-title">
              <Database size={16} color="#00ED64" />
              MongoDB Atlas Accounts Directory
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              All registered users & live cloud balances in Cluster0
            </p>
          </div>

          <span style={{
            background: 'rgba(0, 237, 100, 0.12)',
            color: '#00ED64',
            border: '1px solid rgba(0, 237, 100, 0.25)',
            padding: '3px 8px',
            borderRadius: '8px',
            fontSize: '0.68rem',
            fontWeight: 700
          }}>
            {atlasUsers.length} Users Total
          </span>
        </div>

        {loadingUsers ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.78rem' }}>
            Fetching accounts from MongoDB Atlas...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {atlasUsers.map((u) => (
              <div 
                key={u.id}
                className="glass-card"
                style={{
                  border: '1px solid rgba(0, 237, 100, 0.2)',
                  background: 'rgba(9, 24, 18, 0.45)',
                  padding: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>{u.name}</span>
                      <ShieldCheck size={14} color="#00ED64" />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Mail size={11} /> {u.email}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-display)' }}>
                      ₹{u.totalBalance.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
                      Total Balance
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CreditCard size={12} color="#38bdf8" />
                    <span>{u.transactionCount} transactions</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    <span>Joined {new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
