// src/store/useStore.js — Zustand global state: Single Source of Truth & Real Backend Integration
import { create } from 'zustand';
import api from '../services/api';

// Theme helper utilities
const getStoredThemeMode = () => {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem('nexarange-theme') || localStorage.getItem('nr-theme') || 'dark';
};

const resolveTheme = (mode) => {
  if (typeof window === 'undefined') return 'dark';
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode === 'light' ? 'light' : 'dark';
};

const applyThemeToDOM = (mode) => {
  if (typeof window === 'undefined') return 'dark';
  const resolved = resolveTheme(mode);
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.setAttribute('data-theme-mode', mode);
  document.documentElement.style.colorScheme = resolved;
  return resolved;
};

const getStoredOperator = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('nexarange-operator');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.name || parsed.username || parsed.callsign)) return parsed;
    }
  } catch (e) {}
  return null;
};

const getStoredLabQuizzes = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('nexarange-lab-quizzes');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const useStore = create((set, get) => ({
  // ── View Navigation ──
  view: 'dashboard',         // 'dashboard' | 'labs' | 'terminal' | 'leaderboard' | 'friends' | 'analytics' | 'certificates' | 'mission' | 'debrief' | 'quiz'
  currentLab: null,          // 1 | 2 | 3 | 4 | 5
  currentMission: null,      // 0-4 index
  
  // ── Theme State (Single Source of Truth) ──
  themeMode: getStoredThemeMode(), // 'dark' | 'light' | 'system'
  theme: resolveTheme(getStoredThemeMode()), // 'dark' | 'light'

  setTheme: (mode) => {
    if (!['dark', 'light', 'system'].includes(mode)) return;
    const resolved = applyThemeToDOM(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexarange-theme', mode);
    }
    set({ themeMode: mode, theme: resolved });

    // Synchronize theme preference with backend database for authenticated operator
    if (get().isAuthenticated) {
      api.user.updateSettings(mode).catch(() => {});
    }

    get().addToast({
      title: 'APPEARANCE UPDATED',
      text: `Theme set to ${mode.toUpperCase()}${mode === 'system' ? ` (${resolved.toUpperCase()})` : ''}.`,
      type: 'info',
    });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  // ── Operator Profile (Consistent Source of Truth) ──
  operator: getStoredOperator(),

  // ── Metrics & Progression ──
  totalXP: 0,
  sessionXP: 0,
  threatLevel: 'GUARDED',    // 'SECURE' | 'GUARDED' | 'ELEVATED' | 'CRITICAL'
  badges: [],
  completedMissions: {},     // { missionId: true }
  missionTasks: {},          // { missionId: [bool] }
  hintPenalties: {},         // { missionId: totalPenalty }
  labQuizzes: getStoredLabQuizzes(), // { [labId]: { completed: bool, score: num, answers: {}, xpEarned: num } }

  // ── Toasts ──
  toasts: [],
  xpToast: null,
  badgeToast: null,

  // ── Authentication & Session State (Single Source of Truth) ──
  isVerifyingSession: false,
  isAuthenticated: typeof window !== 'undefined' 
    ? Boolean(localStorage.getItem('nexarange-auth') === 'true' && (localStorage.getItem('nexarange-token') || localStorage.getItem('nexarange-operator')))
    : false,
  authToken: typeof window !== 'undefined' ? localStorage.getItem('nexarange-token') : null,
  sessionState: typeof window !== 'undefined' && localStorage.getItem('nexarange-auth') === 'false' ? 'TERMINATED' : 'ACTIVE',
  sessionId: 'NR-SES-882194',
  route: typeof window !== 'undefined' ? window.location.pathname : '/',
  logoutModalOpen: false,

  setRoute: (route) => {
    if (typeof window !== 'undefined' && window.location.pathname !== route) {
      window.history.pushState(null, '', route);
    }
    set({ route });
  },

  setLogoutModalOpen: (open) => set({ logoutModalOpen: open }),

  initiateLogout: () => {
    set({ logoutModalOpen: true, profileDropdownOpen: false });
  },

  confirmLogout: async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Clean up local state regardless of network status
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexarange-auth', 'false');
      localStorage.removeItem('nexarange-token');
      localStorage.removeItem('nexarange-operator');
      window.history.pushState(null, '', '/login');
    }
    set({
      isAuthenticated: false,
      authToken: null,
      operator: null,
      sessionState: 'TERMINATED',
      logoutModalOpen: false,
      profileDropdownOpen: false,
      operatorModalOpen: false,
      route: '/login',
      view: 'dashboard',
    });
    get().addToast({
      title: 'SESSION TERMINATED',
      text: 'Command Center session closed securely.',
      type: 'warning',
    });
  },

  login: async (credentials) => {
    try {
      let identifier = '';
      let password = '';

      if (typeof credentials === 'string') {
        identifier = credentials.trim();
      } else if (typeof credentials === 'object' && credentials !== null) {
        identifier = (credentials.identifier || credentials.username || credentials.email || credentials.callsign || '').trim();
        password = credentials.password || credentials.passphrase || '';
      }

      if (!identifier || !password) {
        throw new Error('Please enter your username/email and password.');
      }

      const res = await api.auth.login(identifier, password);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Authentication failed. Please verify credentials.');
      }

      const { user, token, sessionId } = res.data;

      const newOp = {
        id: user.id || user._id,
        fullName: user.fullName || user.name,
        name: user.name,
        username: user.username,
        callsign: user.callsign,
        email: user.email,
        role: user.role || 'Fresher / Trainee',
        avatar: user.avatar,
        baseRank: 247,
        clearance: user.clearance || null,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('nexarange-auth', 'true');
        localStorage.setItem('nexarange-token', token);
        localStorage.setItem('nexarange-operator', JSON.stringify(newOp));
        window.history.pushState(null, '', '/');
      }

      set({
        operator: newOp,
        isAuthenticated: true,
        authToken: token,
        sessionId: sessionId || 'NR-SES-882194',
        sessionState: 'ACTIVE',
        totalXP: user.xp || 0,
        route: '/',
        view: 'dashboard',
        logoutModalOpen: false,
        profileDropdownOpen: false,
      });

      // Synchronize theme preference from server
      if (user.themePreference) {
        get().setTheme(user.themePreference);
      }

      // Fetch user progress and completed missions from backend
      try {
        const progRes = await api.progress.get();
        if (progRes.success && progRes.data) {
          const p = progRes.data.progress;
          const completedMap = p?.missionsCompleted
            ? (p.missionsCompleted instanceof Map ? Object.fromEntries(p.missionsCompleted) : p.missionsCompleted)
            : {};
          set({
            completedMissions: completedMap,
            totalXP: p?.totalXp || user.xp || 0,
            badges: p?.badges || [],
          });
        }
      } catch (pErr) {}

      get().addToast({
        title: 'ACCESS GRANTED',
        text: `Secure session established for ${newOp.callsign} (${newOp.name}).`,
        type: 'success',
      });
      return { success: true, user: newOp };
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      get().addToast({
        title: 'ACCESS DENIED',
        text: msg,
        type: 'warning',
      });
      return { success: false, error: msg };
    }
  },

  loginAsGuest: async () => {
    try {
      let guestUser = null;
      let token = null;
      let sessionId = null;

      try {
        const res = await api.auth.guest();
        if (res && res.success && res.data) {
          guestUser = res.data.user;
          token = res.data.token;
          sessionId = res.data.sessionId;
        }
      } catch (backendErr) {
        // Fallback to local guest session if backend guest endpoint is unavailable
      }

      if (!guestUser) {
        const guestRand = Math.random().toString(36).slice(2, 7);
        const guestId = `guest_${guestRand}`;
        guestUser = {
          id: guestId,
          fullName: 'Guest Operator',
          name: 'Guest Operator',
          username: guestId,
          callsign: `0xGUEST_${guestRand.toUpperCase()}`,
          email: `${guestId}@nexarange.internal`,
          role: 'Fresher / Trainee',
          avatar: 'GO',
          level: 1,
          xp: 0,
          themePreference: 'dark',
          isGuest: true,
        };
        token = `guest_token_${Date.now()}`;
        sessionId = `NR-SES-GUEST-${guestRand.toUpperCase()}`;
      }

      const newOp = {
        id: guestUser.id || guestUser._id,
        fullName: guestUser.fullName || guestUser.name || 'Guest Operator',
        name: guestUser.name || 'Guest Operator',
        username: guestUser.username,
        callsign: guestUser.callsign || '0xGUEST',
        email: guestUser.email,
        role: guestUser.role || 'Fresher / Trainee',
        avatar: guestUser.avatar || 'GO',
        baseRank: 999,
        clearance: 'GUEST-SANDBOX',
        isGuest: true,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('nexarange-auth', 'true');
        localStorage.setItem('nexarange-token', token);
        localStorage.setItem('nexarange-operator', JSON.stringify(newOp));
        localStorage.setItem('nexarange-is-guest', 'true');
        window.history.pushState(null, '', '/');
      }

      set({
        operator: newOp,
        isAuthenticated: true,
        authToken: token,
        sessionId: sessionId || 'NR-SES-GUEST',
        sessionState: 'ACTIVE',
        totalXP: guestUser.xp || 0,
        completedMissions: {},
        badges: [],
        route: '/',
        view: 'dashboard',
        logoutModalOpen: false,
        profileDropdownOpen: false,
      });

      get().addToast({
        title: 'GUEST SANDBOX ACTIVATED',
        text: 'Temporary guest session established. Welcome to NexaRange!',
        type: 'info',
      });

      return { success: true, user: newOp };
    } catch (err) {
      const msg = err.message || 'Could not start guest session.';
      get().addToast({
        title: 'GUEST ACCESS FAILED',
        text: msg,
        type: 'warning',
      });
      return { success: false, error: msg };
    }
  },

  registerOperator: async (userData) => {
    try {
      const fullName = (userData.fullName || userData.name || '').trim();
      const username = (userData.username || userData.callsign || '').trim();
      const email = (userData.email || '').trim();
      const password = userData.password || userData.passphrase || '';
      const role = userData.role || 'Fresher / Trainee';

      const res = await api.auth.register({
        fullName,
        username,
        email,
        password,
        role,
      });

      if (!res.success) {
        throw new Error(res.message || 'Could not register operator account.');
      }

      get().addToast({
        title: 'ACCOUNT CREATED',
        text: 'Operator account created successfully. You can now sign in.',
        type: 'success',
      });

      return { success: true, message: 'Operator account created successfully. You can now sign in.' };
    } catch (err) {
      const msg = err.message || 'Could not register operator account.';
      get().addToast({
        title: 'REGISTRATION FAILED',
        text: msg,
        type: 'warning',
      });
      return { success: false, error: msg };
    }
  },

  // ── Sync session on initial load ──
  syncSession: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nexarange-token') : null;
    const isAuthStored = typeof window !== 'undefined' ? localStorage.getItem('nexarange-auth') === 'true' : false;
    const isGuest = typeof window !== 'undefined' ? localStorage.getItem('nexarange-is-guest') === 'true' : false;
    const storedOp = getStoredOperator();

    if (!isAuthStored || (!token && !storedOp)) {
      set({ isAuthenticated: false, authToken: null, operator: null, isVerifyingSession: false });
      return;
    }

    // Immediately restore authenticated state so F5 reloads never bounce to login screen
    set({
      operator: storedOp,
      isAuthenticated: true,
      authToken: token,
      isVerifyingSession: false,
    });

    // If running in guest sandbox or offline mock, do not query backend /auth/me
    if (isGuest || (token && token.startsWith('guest_'))) {
      return;
    }

    try {
      const meRes = await api.auth.getMe();
      if (meRes.success && meRes.data?.user) {
        const u = meRes.data.user;
        const op = {
          id: u.id || u._id,
          fullName: u.fullName || u.name,
          name: u.name,
          username: u.username,
          callsign: u.callsign,
          email: u.email,
          role: u.role || 'Fresher / Trainee',
          avatar: u.avatar,
          baseRank: 247,
          clearance: u.clearance || null,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('nexarange-operator', JSON.stringify(op));
        }

        set({
          operator: op,
          isAuthenticated: true,
          authToken: token,
          totalXP: u.xp || 0,
        });

        // Load progress
        try {
          const progRes = await api.progress.get();
          if (progRes.success && progRes.data) {
            const p = progRes.data.progress;
            const completedMap = p?.missionsCompleted
              ? (p.missionsCompleted instanceof Map ? Object.fromEntries(p.missionsCompleted) : p.missionsCompleted)
              : {};
            set({
              completedMissions: completedMap,
              totalXP: p?.totalXp || u.xp || 0,
              badges: p?.badges || [],
            });
          }
        } catch (pErr) {}
      }
    } catch (err) {
      // ONLY logout if live backend explicitly responded with 401 Unauthorized (expired/revoked token)
      // Never wipe login on network disconnection, proxy reset, or server restarting!
      if (err?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nexarange-token');
          localStorage.setItem('nexarange-auth', 'false');
          localStorage.removeItem('nexarange-operator');
        }
        set({ isAuthenticated: false, authToken: null, operator: null });
      }
    }
  },

  // ── Modals & Menus ──
  operatorModalOpen: false,
  operatorModalTab: 'profile', // 'profile' | 'settings'
  setOperatorModalOpen: (open, tab = 'profile') => set({ operatorModalOpen: open, operatorModalTab: tab }),
  setOperatorModalTab: (tab) => set({ operatorModalTab: tab }),
  profileDropdownOpen: false,
  profileDropdownAnchor: 'sidebar', // 'sidebar' | 'header'

  // ── Squad (Friends) ──
  friends: [],
  friendRequests: [],

  // ── Computed Helpers ──
  getRank: () => {
    const s = get();
    const calculatedRank = Math.max(12, s.operator.baseRank - Math.floor(s.totalXP / 10));
    return calculatedRank;
  },

  getLevel: () => {
    const s = get();
    return 1 + Math.floor(s.totalXP / 350);
  },

  // ── Route & Deep URL Synchronization ──
  syncRouteFromURL: (pathname = typeof window !== 'undefined' ? window.location.pathname : '/') => {
    const path = pathname || '/';
    const isAuth = get().isAuthenticated;
    if (!isAuth && path !== '/login' && path !== '/logout') {
      return;
    }

    // If authenticated user navigates to /login, route to dashboard automatically
    if (isAuth && path === '/login') {
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/');
      }
      set({ view: 'dashboard', route: '/', profileDropdownOpen: false });
      return;
    }

    // Helper to resolve labId safely
    const resolveLabId = (val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) ? num : val;
    };

    // Pattern: /labs/:labId/mission/:num
    const missionMatch = path.match(/^\/labs\/([^/]+)\/mission\/(\d+)/i);
    if (missionMatch) {
      const labId = resolveLabId(missionMatch[1]);
      const missionNum = parseInt(missionMatch[2], 10);
      set({
        view: 'mission',
        currentLab: labId,
        currentMission: Math.max(0, missionNum - 1),
        threatLevel: 'ELEVATED',
        route: path,
        profileDropdownOpen: false,
      });
      return;
    }

    // Pattern: /labs/:labId/quiz
    const quizMatch = path.match(/^\/labs\/([^/]+)\/quiz/i);
    if (quizMatch) {
      const labId = resolveLabId(quizMatch[1]);
      set({
        view: 'quiz',
        currentLab: labId,
        route: path,
        profileDropdownOpen: false,
      });
      return;
    }

    // Pattern: /labs/:labId/debrief
    const debriefMatch = path.match(/^\/labs\/([^/]+)\/debrief/i);
    if (debriefMatch) {
      const labId = resolveLabId(debriefMatch[1]);
      set({
        view: 'debrief',
        currentLab: labId,
        route: path,
        profileDropdownOpen: false,
      });
      return;
    }

    // Pattern: /labs/:labId
    const labMatch = path.match(/^\/labs\/([^/]+)/i);
    if (labMatch) {
      const labId = resolveLabId(labMatch[1]);
      set({
        view: 'labs',
        currentLab: labId,
        route: path,
        profileDropdownOpen: false,
      });
      return;
    }

    // Static View Routes
    const directViews = {
      '/labs': 'labs',
      '/terminal': 'terminal',
      '/leaderboard': 'leaderboard',
      '/analytics': 'analytics',
      '/certificates': 'certificates',
      '/friends': 'friends',
      '/dashboard': 'dashboard',
      '/': 'dashboard',
    };

    if (directViews[path]) {
      set({
        view: directViews[path],
        route: path,
        profileDropdownOpen: false,
      });
    }
  },

  // ── Actions ──
  setView: (view) => {
    const s = get();
    const routeMap = {
      dashboard: '/',
      labs: s.currentLab ? `/labs/${s.currentLab}` : '/labs',
      terminal: '/terminal',
      leaderboard: '/leaderboard',
      friends: '/friends',
      analytics: '/analytics',
      certificates: '/certificates',
      mission: s.currentLab ? `/labs/${s.currentLab}/mission/${(s.currentMission || 0) + 1}` : '/labs',
      quiz: s.currentLab ? `/labs/${s.currentLab}/quiz` : '/labs',
      debrief: s.currentLab ? `/labs/${s.currentLab}/debrief` : '/labs',
    };
    const targetRoute = routeMap[view] || '/';
    if (typeof window !== 'undefined' && window.location.pathname !== targetRoute) {
      window.history.pushState(null, '', targetRoute);
    }
    set({ view, route: targetRoute, profileDropdownOpen: false });
  },

  setLab: (labId) => {
    const targetRoute = `/labs/${labId}`;
    if (typeof window !== 'undefined' && window.location.pathname !== targetRoute) {
      window.history.pushState(null, '', targetRoute);
    }
    set({ currentLab: labId, route: targetRoute });
  },

  setMission: (idx) => set({ currentMission: idx }),
  setProfileDropdownOpen: (open, anchor = 'sidebar') =>
    set({ profileDropdownOpen: open, profileDropdownAnchor: anchor }),
  toggleProfileDropdown: (anchor = 'sidebar') =>
    set((s) => ({
      profileDropdownOpen: !s.profileDropdownOpen,
      profileDropdownAnchor: anchor,
    })),
  setThreatLevel: (threatLevel) => set({ threatLevel }),
  missionReplayMode: false,
  setMissionReplayMode: (missionReplayMode) => set({ missionReplayMode }),

  openMission: (labId, missionIdx, replay = false) => {
    const targetRoute = `/labs/${labId}/mission/${missionIdx + 1}`;
    if (typeof window !== 'undefined' && window.location.pathname !== targetRoute) {
      window.history.pushState(null, '', targetRoute);
    }
    set({
      currentLab: labId,
      currentMission: missionIdx,
      view: 'mission',
      route: targetRoute,
      threatLevel: 'ELEVATED',
      missionReplayMode: Boolean(replay),
      profileDropdownOpen: false,
    });
  },

  initMissionTasks: (missionId, count) =>
    set((s) => ({
      missionTasks: s.missionTasks[missionId]
        ? s.missionTasks
        : { ...s.missionTasks, [missionId]: Array(count).fill(false) },
    })),

  toggleTask: (missionId, idx) =>
    set((s) => {
      const tasks = [...(s.missionTasks[missionId] || [])];
      tasks[idx] = !tasks[idx];
      return { missionTasks: { ...s.missionTasks, [missionId]: tasks } };
    }),

  resetMissionTasks: (missionId, count) =>
    set((s) => ({
      missionTasks: { ...s.missionTasks, [missionId]: Array(count).fill(false) },
    })),

  completeMission: async (missionId, xp, badge, submittedFlag = null) => {
    const s = get();
    if (s.completedMissions[missionId]) return;

    // Call backend API for atomic, verified completion & XP calculation with flag attestation
    try {
      const res = await api.missions.complete(missionId, [], submittedFlag);
      if (res.success && res.data) {
        const { totalXp, xpAwarded, alreadyCompleted, certificateUnlocked, certificate } = res.data;
        const newTotalXP = totalXp !== undefined ? totalXp : s.totalXP + xp;
        const newSessionXP = s.sessionXP + (xpAwarded || xp);
        const updatedBadges = badge && !s.badges.some((b) => b.name === badge.name) ? [...s.badges, badge] : s.badges;

        set({
          completedMissions: { ...s.completedMissions, [missionId]: true },
          totalXP: newTotalXP,
          sessionXP: newSessionXP,
          badges: updatedBadges,
          threatLevel: 'SECURE',
        });

        get().addToast({
          title: 'MISSION OBJECTIVE SECURED',
          text: `+${xpAwarded || xp} XP Awarded to your profile`,
          type: 'success',
        });

        if (badge) {
          setTimeout(() => {
            get().addToast({
              title: `BADGE UNLOCKED: ${badge.name}`,
              text: `Specialization credential archived`,
              type: 'badge',
              emoji: badge.emoji,
            });
          }, 700);
        }

        if (certificateUnlocked && certificate) {
          setTimeout(() => {
            get().addToast({
              title: `CERTIFICATE ISSUED: ${certificate.title}`,
              text: `Accreditation code: ${certificate.code}`,
              type: 'success',
              emoji: '🎓',
            });
          }, 1400);
        }
        return;
      }
    } catch (apiErr) {
      console.warn('Backend mission completion warning:', apiErr.message);
    }

    // Graceful fallback for offline UI responsiveness
    const newTotalXP = s.totalXP + xp;
    const newSessionXP = s.sessionXP + xp;
    const updatedBadges = badge ? [...s.badges, badge] : s.badges;

    set({
      completedMissions: { ...s.completedMissions, [missionId]: true },
      totalXP: newTotalXP,
      sessionXP: newSessionXP,
      badges: updatedBadges,
      threatLevel: 'SECURE',
    });

    get().addToast({
      title: 'MISSION OBJECTIVE SECURED',
      text: `+${xp} XP Awarded to your profile`,
      type: 'success',
    });
  },

  applyHintPenalty: (missionId, penalty) =>
    set((s) => ({
      totalXP: Math.max(0, s.totalXP - penalty),
      hintPenalties: {
        ...s.hintPenalties,
        [missionId]: (s.hintPenalties[missionId] || 0) + penalty,
      },
    })),

  // Unified Toast System
  addToast: (toast) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    const newToast = { id, type: 'info', ...toast };
    set((s) => ({ toasts: [...s.toasts, newToast] }));

    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  showToast: (text, type = 'success') => {
    get().addToast({ text, type, title: type.toUpperCase() });
  },

  // Friends Actions
  addFriend: (friend) =>
    set((s) => ({ friends: [...s.friends, friend] })),

  acceptRequest: (name) => {
    const s = get();
    const req = s.friendRequests.find((r) => r.name === name);
    set({
      friendRequests: s.friendRequests.filter((r) => r.name !== name),
      friends: [
        ...s.friends,
        {
          name,
          xp: req ? req.xp : 0,
          status: 'Active in Operations',
          online: true,
          avatar: name[0],
          track: 'AI Security',
        },
      ],
    });
    get().addToast({
      title: 'SQUAD REQUEST ACCEPTED',
      text: `${name} has joined your operator squad.`,
      type: 'success',
    });
  },

  declineRequest: (name) => {
    set((s) => ({ friendRequests: s.friendRequests.filter((r) => r.name !== name) }));
    get().addToast({
      title: 'REQUEST DECLINED',
      text: `Squad invite from ${name} dismissed.`,
      type: 'info',
    });
  },

  initFriends: (friends, requests) => set({ friends, friendRequests: requests }),

  showDebrief: (labId) => {
    const targetRoute = `/labs/${labId}/debrief`;
    if (typeof window !== 'undefined' && window.location.pathname !== targetRoute) {
      window.history.pushState(null, '', targetRoute);
    }
    set({ view: 'debrief', currentLab: labId, route: targetRoute });
  },

  openLabQuiz: (labId) => {
    const targetRoute = `/labs/${labId}/quiz`;
    if (typeof window !== 'undefined' && window.location.pathname !== targetRoute) {
      window.history.pushState(null, '', targetRoute);
    }
    set({ view: 'quiz', currentLab: labId, route: targetRoute, profileDropdownOpen: false });
  },

  submitLabQuiz: (labId, answers, score, xpEarned = 0, operatorBrief = '') => {
    const s = get();
    const existing = s.labQuizzes[labId];
    const isNewBonus = !existing?.completed && xpEarned > 0;
    const updatedQuizzes = {
      ...s.labQuizzes,
      [labId]: {
        completed: true,
        score,
        answers,
        operatorBrief: operatorBrief || existing?.operatorBrief || '',
        xpEarned: (existing?.xpEarned || 0) + (isNewBonus ? xpEarned : 0),
        lastAttempt: new Date().toISOString(),
      },
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nexarange-lab-quizzes', JSON.stringify(updatedQuizzes));
      } catch {}
    }

    set((state) => ({
      labQuizzes: updatedQuizzes,
      totalXP: isNewBonus ? state.totalXP + xpEarned : state.totalXP,
      sessionXP: isNewBonus ? state.sessionXP + xpEarned : state.sessionXP,
    }));

    if (isNewBonus) {
      get().addToast({
        title: 'ASSESSMENT BONUS CREDITED',
        text: `+${xpEarned} XP Awarded for Post-Lab MCQ Evaluation! (Score: ${score}/5)`,
        type: 'success',
      });
    } else {
      get().addToast({
        title: 'EVALUATION RECORDED',
        text: `Post-Lab assessment saved with score: ${score}/5.`,
        type: 'info',
      });
    }
  },

  resetProgress: async () => {
    try {
      await api.progress.reset();
    } catch (e) {}
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('nexarange-lab-quizzes');
      } catch {}
    }
    set({
      totalXP: 0,
      sessionXP: 0,
      badges: [],
      completedMissions: {},
      missionTasks: {},
      labQuizzes: {},
      threatLevel: 'GUARDED',
    });
    get().addToast({
      title: 'PROGRESS RESET',
      text: 'Simulation workspace restored to initial benchmark.',
      type: 'warning',
    });
  },
}));

// Listen for dynamic system theme changes when themeMode is 'system'
if (typeof window !== 'undefined') {
  try {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const state = useStore.getState();
      if (state.themeMode === 'system') {
        const resolved = applyThemeToDOM('system');
        useStore.setState({ theme: resolved });
      }
    };
    if (mql.addEventListener) {
      mql.addEventListener('change', handleMediaChange);
    } else if (mql.addListener) {
      mql.addListener(handleMediaChange);
    }
  } catch (e) {
    // Unsupported or headless environment
  }
}

export default useStore;
