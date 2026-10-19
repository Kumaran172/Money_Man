import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function BalanceCard({ summary, selectedProfileName }) {
  const { totalBalance = 0, totalIncome = 0, totalExpense = 0, savingsRate = 0 } = summary || {};

  return (
    <div className="balance-hero-card">
      <div className="hero-label-row">
        <span className="hero-label">Net Available Balance</span>
        <span className="active-profile-tag">
          {selectedProfileName ? selectedProfileName : 'All Combined'}
        </span>
      </div>

      <div className="hero-amount">
        <span className="currency-symbol">₹</span>
        <span>{totalBalance.toLocaleString('en-IN')}</span>
      </div>

      <div className="hero-stats-grid">
        <div className="hero-stat-pill">
          <div className="pill-icon-wrap income">
            <ArrowDownLeft size={16} />
          </div>
          <div className="stat-pill-info">
            <span className="label">Total Credited</span>
            <span className="value income">+₹{totalIncome.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="hero-stat-pill">
          <div className="pill-icon-wrap expense">
            <ArrowUpRight size={16} />
          </div>
          <div className="stat-pill-info">
            <span className="label">Total Debited</span>
            <span className="value expense">-₹{totalExpense.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
