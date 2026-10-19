import React from 'react';
import { Home, PieChart, Plus, Users, MessageSquareCode } from 'lucide-react';

export default function BottomNav({ activeTab, onSelectTab, onTabChange, onOpenAddModal }) {
  const handleTab = onSelectTab || onTabChange || (() => {});
  const handleAdd = onOpenAddModal || (() => {});

  return (
    <nav className="bottom-nav-bar">
      <button 
        id="nav-tab-home"
        className={`nav-tab-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => handleTab('home')}
      >
        <Home size={19} />
        <span>Home</span>
      </button>

      <button 
        id="nav-tab-analytics"
        className={`nav-tab-item ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => handleTab('analytics')}
      >
        <PieChart size={19} />
        <span>Analytics</span>
      </button>

      {/* Floating Center Action Button */}
      <button 
        id="nav-tab-add"
        className="nav-fab-center"
        onClick={() => handleAdd('debit')}
        title="Add Spend or Income"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <button 
        id="nav-tab-sms"
        className={`nav-tab-item ${activeTab === 'sms' ? 'active' : ''}`}
        onClick={() => handleTab('sms')}
      >
        <MessageSquareCode size={19} />
        <span>SMS Sync</span>
      </button>

      <button 
        id="nav-tab-people"
        className={`nav-tab-item ${activeTab === 'people' || activeTab === 'profiles' ? 'active' : ''}`}
        onClick={() => handleTab('people')}
      >
        <Users size={19} />
        <span>People</span>
      </button>
    </nav>
  );
}
