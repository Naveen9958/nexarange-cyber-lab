// src/store/useStore.js — Zustand global state: Single Source of Truth
import { create } from 'zustand';

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
  currentLab: null,          // 1 | 2
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
  isAuthenticated: typeof window !== 'undefined' ? localStorage.getItem('nexarange-auth') !== 'false' : true,
  authToken: typeof window !== 'undefined' ? localStorage.getItem('nexarange-token') || 'nr_auth_tok_0x9921b7' : 'nr_auth_tok_0x9921b7',
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

  confirmLogout: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexarange-auth', 'false');
      localStorage.removeItem('nexarange-token');
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

  login: (operatorInput = 'Naveen', extraData = {}) => {
    let newOp = { ...get().operator };
    if (typeof operatorInput === 'string') {
      const trimmed = operatorInput.trim() || 'Operator';
      const cleanCallsign = trimmed.toUpperCase().startsWith('0X') ? trimmed.toUpperCase() : `0x${trimmed.toUpperCase()}`;
      newOp = {
        name: trimmed.replace(/^0x/i, '') || trimmed,
        callsign: cleanCallsign,
        role: extraData.role || 'AI Security Analyst',
        avatar: (trimmed.replace(/^0x/i, '') || trimmed).charAt(0).toUpperCase() || 'O',
        baseRank: 247,
        clearance: extraData.clearance || 'TS/SCI-AI',
      };
    } else if (typeof operatorInput === 'object' && operatorInput !== null) {
      const rawName = operatorInput.name?.trim() || operatorInput.callsign?.replace(/^0x/i, '').trim() || 'Operator';
      const rawCallsign = operatorInput.callsign?.trim() || rawName;
      const cleanCallsign = rawCallsign.toUpperCase().startsWith('0X') ? rawCallsign.toUpperCase() : `0x${rawCallsign.toUpperCase()}`;
      newOp = {
        name: rawName,
        callsign: cleanCallsign,
        role: operatorInput.role || 'AI Security Analyst',
        avatar: rawName.charAt(0).toUpperCase() || 'O',
        baseRank: 247,
        clearance: operatorInput.clearance || 'TS/SCI-AI',
      };
    }

    const token = 'nr_auth_tok_' + Math.random().toString(36).substring(2, 10);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexarange-auth', 'true');
      localStorage.setItem('nexarange-token', token);
      localStorage.setItem('nexarange-operator', JSON.stringify(newOp));
      if (extraData.passphrase || (typeof operatorInput === 'object' && operatorInput?.passphrase)) {
        localStorage.setItem('nexarange-passphrase', extraData.passphrase || operatorInput.passphrase);
      }
      window.history.pushState(null, '', '/');
    }
    set({
      operator: newOp,
      isAuthenticated: true,
      authToken: token,
      sessionState: 'ACTIVE',
      route: '/',
      view: 'dashboard',
      logoutModalOpen: false,
      profileDropdownOpen: false,
    });
    get().addToast({
      title: 'ACCESS GRANTED',
      text: `Secure session established for ${newOp.callsign} (${newOp.name}).`,
      type: 'success',
    });
  },

  registerOperator: (userData) => {
    get().login(userData);
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
    // Dynamically calculate rank from XP
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
  setOperatorModalOpen: (open) => set({ operatorModalOpen: open, profileDropdownOpen: false }),
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

  completeMission: (missionId, xp, badge) => {
    const s = get();
    if (s.completedMissions[missionId]) return;

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

    // Fire unified toast
    get().addToast({
      title: 'MISSION OBJECTIVE SECURED',
      text: `+${xp} XP Awarded to your profile`,
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

  resetProgress: () => {
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
