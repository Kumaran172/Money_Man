import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import BalanceCard from './components/BalanceCard';
import AccountRail from './components/AccountRail';
import QuickActions from './components/QuickActions';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import AnalyticsView from './components/AnalyticsView';
import ProfilesView from './components/ProfilesView';
import SmsSmartSync from './components/SmsSmartSync';
import BottomNav from './components/BottomNav';
import LoginPage from './components/LoginPage';
import { LogOut, Sparkles } from 'lucide-react';
import {
  fetchHealth,
  fetchSummary,
  fetchAccounts,
  fetchProfiles,
  fetchCategories,
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  fetchMe,
  logout,
  getSavedUser
} from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isOnline, setIsOnline] = useState(false);

  // Data states
  const [summary, setSummary] = useState({ totalBalance: 0, totalIncome: 0, totalExpense: 0, savingsRate: 0 });
  const [accounts, setAccounts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Toast states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('debit');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // ── Auth gate: check saved session on mount ──────────────────
  useEffect(() => {
    const savedUser = getSavedUser();
    if (savedUser) {
      // Verify token is still valid with the server
      fetchMe().then(res => {
        if (res.success) {
          setUser(res.user);
        } else {
          setUser(null);
        }
        setAuthChecked(true);
      }).catch(() => {
        // Server is offline but we have a saved user — let them in
        setUser(savedUser);
        setAuthChecked(true);
      });
    } else {
      setAuthChecked(true);
    }
  }, []);

  const handleAuthSuccess = (userData, profileData) => {
    setUser(userData);
    showToast(`Welcome, ${userData.name}! 🎉`);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setAccounts([]);
    setTransactions([]);
    setSummary({ totalBalance: 0, totalIncome: 0, totalExpense: 0, savingsRate: 0 });
  };

  // ── Backend health check ──────────────────────────────────────
  const checkHealth = useCallback(async () => {
    try {
      const data = await fetchHealth();
      if (data.status === 'online') setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }, []);

  // ── Fetch all dashboard data (user-scoped) ───────────────────
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [healthData, summaryData, accountsData, profilesData, catsData, txData] = await Promise.all([
        fetchHealth(),
        fetchSummary(selectedProfile),
        fetchAccounts(),
        fetchProfiles(),
        fetchCategories(),
        fetchTransactions({ profile_id: selectedProfile, account_id: selectedAccount }),
      ]);

      if (healthData?.status === 'online') setIsOnline(true);
      if (summaryData?.success) setSummary(summaryData.data);
      if (accountsData?.success) setAccounts(accountsData.data || []);
      if (profilesData?.success) setProfiles(profilesData.data || []);
      if (catsData?.success) setCategories(catsData.data || []);
      if (txData?.success) setTransactions(txData.data || []);
    } catch (err) {
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [user, selectedProfile, selectedAccount]);

  useEffect(() => {
    if (user) {
      loadData();
      checkHealth();
    }
  }, [user, loadData]);

  // ── Add transaction ───────────────────────────────────────────
  const handleAddTransaction = async (txData) => {
    const profile = profiles.find(p => p.is_default) || profiles[0];
    const account = accounts[0];
    const res = await createTransaction({
      ...txData,
      profile_id: txData.profile_id || profile?.id,
      account_id: txData.account_id || account?.id,
    });
    if (res.success) {
      showToast(res.message || 'Transaction added!');
      setIsModalOpen(false);
      loadData();
    } else {
      showToast(res.error || 'Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    const res = await deleteTransaction(id);
    if (res.success) {
      showToast('Transaction deleted');
      loadData();
    }
  };

  const handleSMSSync = (msg) => {
    showToast(msg || 'SMS synced!');
    loadData();
  };

  // ── Render: Loading ───────────────────────────────────────────
  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 auto 12px', fontFamily: 'var(--font-display)' }}>M</div>
          <p style={{ color: '#475569', fontSize: '0.8rem' }}>Loading Money Man...</p>
        </div>
      </div>
    );
  }

  // ── Render: Login ─────────────────────────────────────────────
  if (!user) {
    return <LoginPage onAuthSuccess={handleAuthSuccess} />;
  }

  // ── Render: Main App ──────────────────────────────────────────
  return (
    <div className="app-wrapper">
      <div className="ambient-glow" />
      <div className="app-container">

        {/* Header */}
        <Header
          isOnline={isOnline}
          profiles={profiles}
          selectedProfile={selectedProfile}
          onProfileChange={setSelectedProfile}
          userName={user.name}
          onLogout={handleLogout}
        />

        {/* Content */}
        <main className="main-content">

          {/* HOME Tab */}
          {activeTab === 'home' && (
            <>
              <BalanceCard summary={summary} loading={loading} />
              <AccountRail accounts={accounts} selectedAccount={selectedAccount} onSelect={setSelectedAccount} />
              <QuickActions
                onCredit={() => { setModalType('credit'); setIsModalOpen(true); }}
                onDebit={() => { setModalType('debit'); setIsModalOpen(true); }}
                onOpenAddModal={(type) => { setModalType(type || 'debit'); setIsModalOpen(true); }}
              />
              {transactions.length === 0 && !loading ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
                  <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>No transactions yet</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5 }}>
                    Go to the <strong style={{ color: '#10b981' }}>SMS Sync tab</strong> to import your<br />Axis, HDFC, SBI or KVB messages, or tap <strong>+</strong> to add manually.
                  </div>
                </div>
              ) : (
                <TransactionList
                  transactions={transactions}
                  onDelete={handleDeleteTransaction}
                  loading={loading}
                />
              )}
            </>
          )}

          {/* ANALYTICS Tab */}
          {activeTab === 'analytics' && (
            <AnalyticsView profileId={selectedProfile} />
          )}

          {/* PEOPLE Tab */}
          {activeTab === 'people' && (
            <ProfilesView
              profiles={profiles}
              onRefresh={loadData}
              onProfileSelect={(id) => {
                setSelectedProfile(id);
                setActiveTab('home');
              }}
            />
          )}

          {/* SMS SYNC Tab */}
          {activeTab === 'sms' && (
            <SmsSmartSync onTransactionAdded={handleSMSSync} />
          )}

        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onTabChange={setActiveTab}
          onOpenAddModal={(type) => { setModalType(type || 'debit'); setIsModalOpen(true); }}
        />
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <AddTransactionModal
          isOpen={isModalOpen}
          type={modalType}
          accounts={accounts}
          categories={categories}
          profiles={profiles}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddTransaction}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <Sparkles size={14} />
          {toast}
        </div>
      )}
    </div>
  );
}
