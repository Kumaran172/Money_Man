import React, { useState } from 'react';
import { Copy, Check, Zap, Sparkles, Upload, RotateCcw, Landmark, ShieldCheck } from 'lucide-react';
import { parseSMS, syncSMSWebhook, bulkImportSMS } from '../api';

export default function SmsSmartSync({ onTransactionAdded }) {
  const [activeSubTab, setActiveSubTab] = useState('bulk'); // 'bulk' | 'single' | 'automation'
  const [singleText, setSingleText] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/sms/webhook`;

  const sampleMessages = [
    {
      label: 'Axis Debit ₹2000 (Roshan Trad)',
      badge: 'Axis',
      text: 'INR 2000.00 debited from A/c no. XX001664 on ROSHAN TRAD 17-10-2026 22:12:28 IST. Avl bal: INR 5097.94. Not you? SMS BLOCKCARD XX7563 to +919951860002 - Axis Bank'
    },
    {
      label: 'HDFC Credit ₹10 (UPI Alert)',
      badge: 'HDFC',
      text: 'Credit Alert!\nRs.10.00 credited to HDFC Bank A/c XX5981 on 19-10-26 from VPA *asen@okhdfcbank (UPI 131518795093)'
    },
    {
      label: 'HDFC Debit ₹450 (Swiggy)',
      badge: 'HDFC',
      text: 'Rs. 450.00 debited from HDFC Bank A/c XX5981 on 15-10-26 to SWIGGY. Avl Bal: Rs. 14,250.00. UPI Ref: 42891823910'
    },
    {
      label: 'SBI Debit ₹500 (Swiggy)',
      badge: 'SBI',
      text: 'Dear SBI User, A/c 1234 debited by 500.00 on 12Oct26 trf to SWIGGY Ref No 2341234. Avl Bal Rs: 23,450.00'
    },
    {
      label: 'KVB Debit ₹350 (Swiggy)',
      badge: 'KVB',
      text: 'Your a/c XXXXXXXXXXXX1516 is debited for Rs.350.00 on 18-Oct-26 by UPI to SWIGGY. Avl Bal Rs.24,630.00 - KVB'
    },
  ];

  // ── Single SMS ────────────────────────────────────────────────
  const triggerSingleParse = async (text) => {
    const t = text || singleText;
    if (!t.trim()) { setErrorMsg('Please enter or paste a bank SMS first'); return; }
    setErrorMsg(''); setIsParsing(true); setParsedData(null);
    try {
      const res = await parseSMS(t);
      if (res.success) setParsedData(res.data);
      else setErrorMsg(res.error || 'Could not parse this message');
    } catch (err) { setErrorMsg('Parse failed: ' + err.message); }
    finally { setIsParsing(false); }
  };

  const handleSaveSingle = async () => {
    if (!parsedData) return;
    setIsSaving(true);
    try {
      const res = await syncSMSWebhook({ text: parsedData.raw_sms, sender: parsedData.bank_name || 'Bank' });
      if (res.success) {
        setParsedData(null); setSingleText('');
        onTransactionAdded(res.message || 'Transaction recorded!');
      } else setErrorMsg(res.error || 'Failed to save');
    } catch (err) { setErrorMsg('Error: ' + err.message); }
    finally { setIsSaving(false); }
  };

  // ── Bulk SMS ──────────────────────────────────────────────────
  const handleBulkImport = async () => {
    if (!bulkText.trim()) { setErrorMsg('Please paste your bank messages first'); return; }
    setErrorMsg(''); setIsBulkImporting(true); setBulkResult(null);
    try {
      const res = await bulkImportSMS(bulkText);
      if (res.success) {
        setBulkResult(res);
        onTransactionAdded(`${res.summary.inserted} transactions imported across your bank accounts!`);
      } else setErrorMsg(res.error || 'Bulk import failed');
    } catch (err) { setErrorMsg('Import error: ' + err.message); }
    finally { setIsBulkImporting(false); }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const tabs = [
    { id: 'bulk', label: '📦 Bulk Multi-Bank', color: '#10b981' },
    { id: 'single', label: '📋 Single SMS', color: '#38bdf8' },
    { id: 'automation', label: '⚡ Auto Sync', color: '#8b5cf6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '14px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveSubTab(t.id); setErrorMsg(''); setBulkResult(null); }}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: '10px', border: 'none',
              background: activeSubTab === t.id ? t.color : 'none',
              color: '#fff', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Supported Banks Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14,27,50,0.8) 0%, rgba(10,18,36,0.9) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Landmark size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
          <strong style={{ color: '#fff' }}>All Indian Banks Supported:</strong> Axis Bank, HDFC Bank, SBI, ICICI, KVB, Kotak, Canara, PNB, BoB & more.
        </div>
      </div>

      {/* ── BULK IMPORT ─────────────────────────────────────────── */}
      {activeSubTab === 'bulk' && (
        <div className="glass-card">
          <div className="section-header" style={{ marginBottom: '6px' }}>
            <h2 className="section-title">
              <Upload size={16} color="#10b981" />
              Universal Bank History Import
            </h2>
          </div>
          <p style={{ fontSize: '0.73rem', color: '#94a3b8', marginBottom: '10px', lineHeight: 1.4 }}>
            Open Google Messages or your SMS app, select messages from <strong>Axis, HDFC, SBI, ICICI, KVB</strong> or any Indian bank, copy and paste them below. Money Man automatically detects the bank, accounts, real dates, and updates balances without duplicates.
          </p>

          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', alignSelf: 'center', marginRight: '4px' }}>Try Samples:</span>
            {sampleMessages.slice(0, 3).map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBulkText(prev => prev ? `${prev}\n\n${s.text}` : s.text)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '6px',
                  color: '#cbd5e1',
                  padding: '3px 7px',
                  fontSize: '0.66rem',
                  cursor: 'pointer'
                }}
              >
                + {s.label}
              </button>
            ))}
          </div>

          <textarea
            id="sms-bulk-textarea"
            className="input-text"
            rows="7"
            placeholder={`Paste your bank SMS messages here (Axis, HDFC, SBI, KVB, ICICI, etc.)...\n\nExample 1 (Axis Bank):\nINR 2000.00 debited from A/c no. XX001664 on ROSHAN TRAD 17-10-2026 22:12:28 IST. Avl bal: INR 5097.94.\n\nExample 2 (HDFC Bank):\nCredit Alert! Rs.10.00 credited to HDFC Bank A/c XX5981 on 19-10-26 from VPA *asen@okhdfcbank`}
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            style={{ width: '100%', resize: 'vertical', fontSize: '0.78rem', marginBottom: '10px', lineHeight: 1.45, boxSizing: 'border-box' }}
          />

          {errorMsg && (
            <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '10px' }}>
              {errorMsg}
            </div>
          )}

          {/* Result summary */}
          {bulkResult && (
            <div id="bulk-result-card" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> MULTI-BANK IMPORT COMPLETE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { label: 'Detected', value: bulkResult.summary.detected, color: '#94a3b8' },
                  { label: 'Imported', value: bulkResult.summary.inserted, color: '#10b981' },
                  { label: 'Duplicates Skipped', value: bulkResult.summary.duplicates, color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setBulkText(''); setBulkResult(null); }}
                style={{ marginTop: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '6px 12px', borderRadius: '8px', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RotateCcw size={12} /> Import More Messages
              </button>
            </div>
          )}

          {!bulkResult && (
            <button id="btn-bulk-import" onClick={handleBulkImport} disabled={isBulkImporting || !bulkText.trim()}
              className="btn-submit-action" style={{ padding: '12px', fontSize: '0.9rem', margin: 0 }}>
              {isBulkImporting ? 'Processing All Bank Messages...' : '📥 Import All Bank Messages'}
            </button>
          )}
        </div>
      )}

      {/* ── SINGLE SMS ─────────────────────────────────────────── */}
      {activeSubTab === 'single' && (
        <div className="glass-card">
          <div className="section-header" style={{ marginBottom: '8px' }}>
            <h2 className="section-title"><Sparkles size={16} color="#38bdf8" /> Quick Single SMS Reader</h2>
          </div>
          <p style={{ fontSize: '0.73rem', color: '#94a3b8', marginBottom: '10px' }}>
            Paste a single SMS from Axis, HDFC, SBI, ICICI, KVB or any bank to preview and log it.
          </p>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {sampleMessages.map((s, i) => (
              <button key={i} onClick={() => { setSingleText(s.text); triggerSingleParse(s.text); }}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#cbd5e1', padding: '4px 8px', fontSize: '0.66rem', cursor: 'pointer' }}>
                {s.label}
              </button>
            ))}
          </div>

          <textarea
            className="input-text"
            rows="3"
            placeholder="Paste a single bank SMS here..."
            value={singleText}
            onChange={e => setSingleText(e.target.value)}
            style={{ width: '100%', resize: 'none', fontSize: '0.82rem', marginBottom: '8px', boxSizing: 'border-box' }}
          />

          <button onClick={() => triggerSingleParse()} disabled={isParsing || !singleText.trim()}
            className="btn-submit-action" style={{ padding: '10px', fontSize: '0.88rem', margin: 0, marginBottom: '10px' }}>
            {isParsing ? 'Analyzing...' : '⚡ Auto-Detect & Preview'}
          </button>

          {errorMsg && (
            <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', marginTop: '8px' }}>
              {errorMsg}
            </div>
          )}

          {parsedData && (
            <div style={{ marginTop: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> EXTRACTED ({parsedData.bank_name})
                </span>
                <span className={`tx-amount ${parsedData.type}`} style={{ fontSize: '1.1rem' }}>
                  {parsedData.type === 'credit' ? '+' : '-'}₹{parsedData.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem', marginBottom: '12px' }}>
                <div><span style={{ color: '#64748b' }}>Date:</span> <strong style={{ color: '#fff' }}>{parsedData.date}</strong></div>
                <div><span style={{ color: '#64748b' }}>Account:</span> <strong style={{ color: parsedData.bank_color || '#fff' }}>{parsedData.account_name}</strong></div>
                <div><span style={{ color: '#64748b' }}>Category:</span> <strong style={{ color: '#fff' }}>{parsedData.category}</strong></div>
                <div><span style={{ color: '#64748b' }}>Merchant:</span> <strong style={{ color: '#fff' }}>{parsedData.note}</strong></div>
                {parsedData.available_balance !== null && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b' }}>Available Balance:</span> <strong style={{ color: '#10b981' }}>₹{parsedData.available_balance.toLocaleString('en-IN')}</strong>
                  </div>
                )}
              </div>
              <button onClick={handleSaveSingle} disabled={isSaving}
                className="btn-submit-action"
                style={{ background: parsedData.type === 'credit' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f43f5e, #e11d48)', padding: '10px', fontSize: '0.88rem' }}>
                {isSaving ? 'Saving...' : `✓ Confirm & Save to ${parsedData.account_name}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── AUTOMATION ─────────────────────────────────────────── */}
      {activeSubTab === 'automation' && (
        <div className="glass-card" style={{ borderColor: 'rgba(139,92,246,0.4)' }}>
          <div className="section-header" style={{ marginBottom: '8px' }}>
            <h2 className="section-title"><Zap size={16} color="#8b5cf6" />100% Hands-Free Auto Sync</h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '14px' }}>
            Every time a bank SMS arrives from <strong>Axis, HDFC, SBI, ICICI, KVB</strong> or any bank, <strong>MacroDroid</strong> silently forwards it to Money Man in the cloud.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '10px', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>YOUR CLOUD WEBHOOK URL:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <code style={{ fontSize: '0.72rem', color: '#a855f7', wordBreak: 'break-all' }}>{webhookUrl}</code>
              <button onClick={handleCopyWebhook}
                style={{ background: copiedUrl ? '#10b981' : 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {copiedUrl ? <Check size={12} /> : <Copy size={12} />} {copiedUrl ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {[
            { n: 1, text: 'Install MacroDroid (free from Google Play Store).' },
            { n: 2, text: 'Add Macro → Trigger: SMS Received → Sender matches: *BANK*, *HDFC*, *AXIS*, *SBI*, *ICICI*, *KVB*, *UPI*' },
            { n: 3, text: 'Action: HTTP Request → POST → Paste Webhook URL above → Body: {"text": "[sms_message]", "sender": "[sms_number]"}' },
            { n: '✓', text: 'Done! Every transaction SMS across all banks is automatically logged in real time!', color: '#10b981' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', marginBottom: '8px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step.color || '#8b5cf6', color: '#fff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step.n}</span>
              <div style={{ fontSize: '0.76rem', color: step.color || '#cbd5e1' }}>{step.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
