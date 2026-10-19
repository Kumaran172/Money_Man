// Centralized API client for Money Man
// Automatically attaches JWT token to all requests

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('mm_token');
}

function setToken(token) {
  localStorage.setItem('mm_token', token);
}

function clearToken() {
  localStorage.removeItem('mm_token');
  localStorage.removeItem('mm_user');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) }
  });
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────
export async function register(name, email, password) {
  const res = await apiFetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  if (res.success && res.token) {
    setToken(res.token);
    localStorage.setItem('mm_user', JSON.stringify(res.user));
  }
  return res;
}

export async function login(email, password) {
  const res = await apiFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (res.success && res.token) {
    setToken(res.token);
    localStorage.setItem('mm_user', JSON.stringify(res.user));
  }
  return res;
}

export async function fetchMe() {
  return apiFetch(`${API_BASE}/auth/me`);
}

export function logout() {
  clearToken();
}

export function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('mm_user') || 'null');
  } catch { return null; }
}

// ── App Data ──────────────────────────────────────────────────────
export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchSummary(profileId = '') {
  const url = profileId ? `${API_BASE}/analytics/summary?profile_id=${profileId}` : `${API_BASE}/analytics/summary`;
  return apiFetch(url);
}

export async function fetchAccounts() {
  return apiFetch(`${API_BASE}/accounts`);
}

export async function fetchProfiles() {
  return apiFetch(`${API_BASE}/profiles`);
}

export async function createProfile(data) {
  return apiFetch(`${API_BASE}/profiles`, { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchCategories(type = '') {
  const url = type ? `${API_BASE}/categories?type=${type}` : `${API_BASE}/categories`;
  return apiFetch(url);
}

export async function fetchTransactions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.profile_id) params.append('profile_id', filters.profile_id);
  if (filters.type) params.append('type', filters.type);
  if (filters.account_id) params.append('account_id', filters.account_id);
  if (filters.search) params.append('search', filters.search);
  return apiFetch(`${API_BASE}/transactions?${params.toString()}`);
}

export async function createTransaction(txData) {
  return apiFetch(`${API_BASE}/transactions`, { method: 'POST', body: JSON.stringify(txData) });
}

export async function deleteTransaction(id) {
  return apiFetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
}

export async function fetchCharts(profileId = '') {
  const url = profileId ? `${API_BASE}/analytics/charts?profile_id=${profileId}` : `${API_BASE}/analytics/charts`;
  return apiFetch(url);
}

export async function fetchInsights(profileId = '') {
  const url = profileId ? `${API_BASE}/analytics/insights?profile_id=${profileId}` : `${API_BASE}/analytics/insights`;
  return apiFetch(url);
}

// ── SMS ──────────────────────────────────────────────────────────
export async function parseSMS(text) {
  return apiFetch(`${API_BASE}/sms/parse`, { method: 'POST', body: JSON.stringify({ text }) });
}

export async function syncSMSWebhook(smsData) {
  return apiFetch(`${API_BASE}/sms/webhook`, { method: 'POST', body: JSON.stringify(smsData) });
}

export async function bulkImportSMS(text) {
  return apiFetch(`${API_BASE}/sms/bulk`, { method: 'POST', body: JSON.stringify({ text }) });
}

// ── Users Directory (MongoDB Atlas) ──────────────────────────────
export async function fetchAllUsers() {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}

