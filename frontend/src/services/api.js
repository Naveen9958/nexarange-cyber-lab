// src/services/api.js — Centralized Production API Client for NexaRange Command Center

const API_BASE = '/api';

/**
 * Base fetch client handling token injection, JSON serialization, and error wrapping
 */
async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexarange-token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);

    // Parse JSON safely
    let data = null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = { success: res.ok, message: await res.text() };
    }

    if (!res.ok) {
      // Handle 401 Unauthorized globally: invalidate local token
      if (res.status === 401 && typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/logout') {
          // Token expired or revoked
          localStorage.setItem('nexarange-auth', 'false');
          localStorage.removeItem('nexarange-token');
        }
      }

      const error = new Error(data?.error?.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.code = data?.error?.code || 'API_ERROR';
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // ── Authentication ──
  auth: {
    login: (identifier, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    logout: () =>
      request('/auth/logout', {
        method: 'POST',
      }),
    getMe: () => request('/auth/me'),
    refresh: () => request('/auth/refresh', { method: 'POST' }),
  },

  // ── User Profile & Settings ──
  user: {
    getProfile: () => request('/user/profile'),
    updateProfile: (profileData) =>
      request('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      }),
    getSettings: () => request('/user/settings'),
    updateSettings: (themePreference) =>
      request('/user/settings', {
        method: 'PATCH',
        body: JSON.stringify({ themePreference }),
      }),
  },

  // ── Dashboard ──
  dashboard: {
    getDashboard: () => request('/dashboard'),
  },

  // ── Missions ──
  missions: {
    getAll: () => request('/missions'),
    getById: (id) => request(`/missions/${id}`),
    start: (id) => request(`/missions/${id}/start`, { method: 'POST' }),
    complete: (id, tasks = []) =>
      request(`/missions/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ tasks }),
      }),
    getProgress: (id) => request(`/missions/${id}/progress`),
  },

  // ── Labs ──
  labs: {
    getAll: () => request('/labs'),
    getById: (id) => request(`/labs/${id}`),
    start: (id) => request(`/labs/${id}/start`, { method: 'POST' }),
    complete: (id) => request(`/labs/${id}/complete`, { method: 'POST' }),
    getProgress: (id) => request(`/labs/${id}/progress`),
  },

  // ── Simulated Terminal ──
  terminal: {
    createSession: (labId = 1) =>
      request('/terminal/session', {
        method: 'POST',
        body: JSON.stringify({ labId }),
      }),
    executeCommand: (sessionId, command) =>
      request('/terminal/command', {
        method: 'POST',
        body: JSON.stringify({ sessionId, command }),
      }),
    getSession: (id) => request(`/terminal/session/${id}`),
    closeSession: (id) => request(`/terminal/session/${id}/close`, { method: 'POST' }),
  },

  // ── Progress ──
  progress: {
    get: () => request('/progress'),
    reset: () => request('/progress/reset', { method: 'POST' }),
  },

  // ── Stats ──
  stats: {
    getOverview: () => request('/stats/overview'),
    getSkills: () => request('/stats/skills'),
    getXpHistory: () => request('/stats/xp-history'),
    getSession: () => request('/stats/session'),
  },

  // ── Rank ──
  rank: {
    getMe: () => request('/rank/me'),
    getLeaderboard: () => request('/rank/leaderboard'),
  },

  // ── Certificates ──
  certificates: {
    getAll: () => request('/certificates'),
    getById: (id) => request(`/certificates/${id}`),
  },

  // ── Squad ──
  squad: {
    getSquad: () => request('/squad'),
  },

  // ── Notifications ──
  notifications: {
    getAll: () => request('/notifications'),
    markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  },

  // ── Health ──
  health: () => request('/health'),
};

export default api;
