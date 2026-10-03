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
  if (typeof window === 'undefined') {
    return {
      name: 'Naveen',
      callsign: '0xNAVEEN',
      role: 'AI Security Analyst',
      avatar: 'N',
      baseRank: 247,
      clearance: 'TS/SCI-AI',
    };
  }
  try {
    const raw = localStorage.getItem('nexarange-operator');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name) return parsed;
    }
  } catch (e) {}
  return {
    name: 'Naveen',
    callsign: '0xNAVEEN',
    role: 'AI Security Analyst',
    avatar: 'N',
    baseRank: 247,
    clearance: 'TS/SCI-AI',
  };
};

const useStore = create((set, get) => ({
  // ── View Navigation ──
  view: 'dashboard',         // 'dashboard' | 'labs' | 'terminal' | 'leaderboard' | 'friends' | 'analytics' | 'certificates' | 'mission' | 'debrief'
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

  // ── Toasts ──
  toasts: [],
  xpToast: null,
  badgeToast: null,

  // ── Authentication & Session State (Single Source of Truth) ──
  isAuthenticated: typeof window !== 'undefined' 
    ? Boolean(localStorage.getItem('nexarange-token') && localStorage.getItem('nexarange-auth') !== 'false')
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
      window.history.pushState(null, '', '/logout');
    }
    set({
      isAuthenticated: false,
      authToken: null,
      sessionState: 'TERMINATED',
      logoutModalOpen: false,
      profileDropdownOpen: false,
      operatorModalOpen: false,
      route: '/logout',
      view: 'dashboard',
    });
    get().addToast({
      title: 'SESSION TERMINATED',
      text: 'Command Center session closed securely.',
      type: 'warning',
    });
  },

  login: async (operatorInput = 'Naveen', extraData = {}) => {
    try {
      let identifier = 'naveen@nexarange.internal';
      let passphrase = 'CyberAccess2026!';
      let role = 'AI Security Analyst';
      let name = 'Naveen';

      if (typeof operatorInput === 'string') {
        const trimmed = operatorInput.trim();
        identifier = trimmed || 'naveen@nexarange.internal';
        passphrase = extraData.passphrase || 'CyberAccess2026!';
        name = trimmed.replace(/^0x/i, '') || 'Operator';
        role = extraData.role || 'AI Security Analyst';
      } else if (typeof operatorInput === 'object' && operatorInput !== null) {
        identifier = operatorInput.email || operatorInput.callsign || operatorInput.name || 'naveen@nexarange.internal';
        passphrase = operatorInput.passphrase || operatorInput.password || extraData.passphrase || 'CyberAccess2026!';
        name = operatorInput.name || identifier.replace(/^0x/i, '') || 'Operator';
        role = operatorInput.role || 'AI Security Analyst';
      }

      // 1. Call Backend API
      let res;
      try {
        res = await api.auth.login(identifier, passphrase);
      } catch (loginErr) {
        // If login failed because user doesn't exist, auto-register for seamless onboarding
        if (loginErr.status === 401 || loginErr.status === 404) {
          const autoEmail = identifier.includes('@') ? identifier : `${name.toLowerCase().replace(/\s+/g, '')}@nexarange.internal`;
          const autoCallsign = identifier.toUpperCase().startsWith('0X') ? identifier.toUpperCase() : `0x${name.toUpperCase().replace(/\s+/g, '')}`;
          res = await api.auth.register({
            name,
            email: autoEmail,
            callsign: autoCallsign,
            password: passphrase,
            role,
          });
        } else {
          throw loginErr;
        }
      }

      const { user, token, sessionId } = res.data;
      const cleanCallsign = user.callsign || (name.toUpperCase().startsWith('0X') ? name.toUpperCase() : `0x${name.toUpperCase()}`);

      const newOp = {
        id: user.id || user._id,
        name: user.name || name,
        callsign: cleanCallsign,
        email: user.email,
        role: user.role || role,
        avatar: user.avatar || (user.name || name).charAt(0).toUpperCase(),
        baseRank: 247,
        clearance: extraData.clearance || 'TS/SCI-AI',
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
      return true;
    } catch (err) {
      get().addToast({
        title: 'ACCESS DENIED',
        text: err.message || 'Authentication failed. Please verify credentials.',
        type: 'warning',
      });
      return false;
    }
  },

  registerOperator: async (userData) => {
    try {
      const name = userData.name?.trim() || 'Operator';
      const cleanCallsign = userData.callsign?.trim()
        ? (userData.callsign.trim().toUpperCase().startsWith('0X') ? userData.callsign.trim().toUpperCase() : `0x${userData.callsign.trim().toUpperCase()}`)
        : `0x${name.toUpperCase().replace(/\s+/g, '')}`;
      const email = userData.email?.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@nexarange.internal`;
      const password = userData.passphrase || userData.password || 'CyberAccess2026!';
      const role = userData.role || 'AI Security Analyst';

      const res = await api.auth.register({
        name,
        email,
        callsign: cleanCallsign,
        password,
        role,
      });

      const { user, token, sessionId } = res.data;
      const newOp = {
        id: user.id || user._id,
        name: user.name,
        callsign: user.callsign,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        baseRank: 247,
        clearance: 'TS/SCI-AI',
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
        totalXP: 0,
        route: '/',
        view: 'dashboard',
        logoutModalOpen: false,
        profileDropdownOpen: false,
      });

      get().addToast({
        title: 'ENCLAVE REGISTRATION COMPLETE',
        text: `Account initialized for ${newOp.callsign}. Welcome to NexaRange.`,
        type: 'success',
      });
      return true;
    } catch (err) {
      get().addToast({
        title: 'REGISTRATION FAILED',
        text: err.message || 'Could not register operator account.',
        type: 'warning',
      });
      return false;
    }
  },

  // ── Sync session on initial load ──
  syncSession: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nexarange-token') : null;
    if (!token) {
      set({ isAuthenticated: false, authToken: null });
      return;
    }
    try {
      const meRes = await api.auth.getMe();
      if (meRes.success && meRes.data?.user) {
        const u = meRes.data.user;
        const op = {
          id: u.id || u._id,
          name: u.name,
          callsign: u.callsign,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          baseRank: 247,
          clearance: 'TS/SCI-AI',
        };
        set({
          operator: op,
          isAuthenticated: true,
          authToken: token,
          totalXP: u.xp || 0,
        });

        // Load progress
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
      }
    } catch (err) {
      if (err.status === 401) {
        set({ isAuthenticated: false, authToken: null });
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
    return 3 + Math.floor(s.totalXP / 350);
  },

  // ── Actions ──
  setView: (view) => set({ view, profileDropdownOpen: false }),
  setLab: (labId) => set({ currentLab: labId }),
  setMission: (idx) => set({ currentMission: idx }),
  setProfileDropdownOpen: (open, anchor = 'sidebar') =>
    set({ profileDropdownOpen: open, profileDropdownAnchor: anchor }),
  toggleProfileDropdown: (anchor = 'sidebar') =>
    set((s) => ({
      profileDropdownOpen: !s.profileDropdownOpen,
      profileDropdownAnchor: anchor,
    })),
  setThreatLevel: (threatLevel) => set({ threatLevel }),

  openMission: (labId, missionIdx) =>
    set({ currentLab: labId, currentMission: missionIdx, view: 'mission', threatLevel: 'ELEVATED' }),

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

  completeMission: async (missionId, xp, badge) => {
    const s = get();
    if (s.completedMissions[missionId]) return;

    // Call backend API for atomic, verified completion & XP calculation
    try {
      const res = await api.missions.complete(missionId, []);
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

  showDebrief: (labId) => set({ view: 'debrief', currentLab: labId }),

  resetProgress: async () => {
    try {
      await api.progress.reset();
    } catch (e) {}
    set({
      totalXP: 0,
      sessionXP: 0,
      badges: [],
      completedMissions: {},
      missionTasks: {},
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
