import React, { useState, useEffect } from 'react';
import { 
  PieChart, TrendingUp, AlertTriangle, Lightbulb, Zap, 
  Smartphone, Landmark, Banknote, ShieldAlert 
} from 'lucide-react';
import { fetchCharts, fetchInsights } from '../api';

export default function AnalyticsView({ selectedProfile, profileId }) {
  const currentProfile = selectedProfile || profileId || '';
  const [chartData, setChartData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [currentProfile]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [chartsRes, insightsRes] = await Promise.all([
        fetchCharts(currentProfile),
        fetchInsights(currentProfile)
      ]);
      if (chartsRes.success) setChartData(chartsRes.data);
      if (insightsRes.success) setInsights(insightsRes.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type, iconName) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={16} color="#f43f5e" />;
      case 'positive': return <TrendingUp size={16} color="#10b981" />;
      case 'source': return <Zap size={16} color="#a855f7" />;
      default: return <Lightbulb size={16} color="#06b6d4" />;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
        <p>Crunching your financial numbers...</p>
      </div>
    );
  }

  const { categoryBreakdown = [], sourceBreakdown = [], dailyTrend = [], totalExpense = 0 } = chartData || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Smart Automated Financial Suggestions */}
      <div>
        <div className="section-header">
          <h2 className="section-title">
            <Lightbulb size={16} color="#eab308" />
            Smart Insights & Suggestions
          </h2>
        </div>

        <div>
          {insights.map((item, idx) => (
            <div key={idx} className={`insight-card ${item.type}`}>
              <div className="insight-header-line">
                {getInsightIcon(item.type, item.icon)}
                <span className="insight-tag">{item.tag}</span>
              </div>
              <h3 className="insight-title">{item.title}</h3>
              <p className="insight-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spending by Category Progress Visualizer */}
      <div className="glass-card">
        <div className="section-header">
          <h2 className="section-title">
            <PieChart size={16} color="#10b981" />
            Spending by Category
          </h2>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f43f5e' }}>
            Total: ₹{totalExpense.toLocaleString('en-IN')}
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '16px' }}>
            No expense records yet to build breakdown.
          </p>
        ) : (
          categoryBreakdown.map((cat, idx) => (
            <div key={idx} className="category-progress-item">
              <div className="cat-progress-meta">
                <span style={{ color: '#fff' }}>{cat.category}</span>
                <span style={{ color: '#94a3b8' }}>
                  ₹{cat.total_amount.toLocaleString('en-IN')} ({cat.percentage}%)
                </span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${cat.percentage}%`,
                    background: cat.color || '#3b82f6'
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* GPay vs Supermoney vs Bank Breakdown */}
      <div className="glass-card">
        <div className="section-header">
          <h2 className="section-title">
            <Zap size={16} color="#a855f7" />
            Payment Source Volume
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sourceBreakdown.map(src => {
            const isGPay = src.account_type === 'gpay';
            const isSuper = src.account_type === 'supermoney';
            return (
              <div 
                key={src.account_name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div 
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: isGPay ? '#4285F4' : isSuper ? '#9333ea' : '#10b981'
                    }} 
                  />
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
                      {src.account_name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {src.count} total transactions
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f43f5e' }}>
                    -₹{src.total_spent.toLocaleString('en-IN')}
                  </div>
                  {src.total_received > 0 && (
                    <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                      +₹{src.total_received.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="glass-card">
        <div className="section-header">
          <h2 className="section-title">
            <TrendingUp size={16} color="#38bdf8" />
            14-Day Spending Trend
          </h2>
        </div>

        {dailyTrend.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '16px' }}>
            No daily data for the past 14 days.
          </p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', paddingTop: '20px' }}>
            {dailyTrend.map((day, idx) => {
              const maxSpend = Math.max(...dailyTrend.map(d => d.expense), 100);
              const heightPct = Math.max(10, Math.round((day.expense / maxSpend) * 100));
              const dateLabel = day.date ? day.date.slice(5) : '';

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginBottom: '4px' }}>
                    {day.expense > 0 ? `₹${day.expense}` : '0'}
                  </div>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div 
                      style={{
                        width: '70%',
                        height: `${heightPct}%`,
                        background: day.expense > 0 ? 'linear-gradient(180deg, #f43f5e 0%, #be123c 100%)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '6px 6px 2px 2px'
                      }}
                      title={`${day.date}: Spent ₹${day.expense}`}
                    />
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '6px', whiteSpace: 'nowrap' }}>
                    {dateLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
