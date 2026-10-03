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
  operator: {
    name: 'Naveen',
    callsign: '0xNAVEEN',
    role: 'AI Security Analyst',
    avatar: 'N',
    baseRank: 247,
    clearance: 'TS/SCI-AI',
  },

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

  // ── Modals & Menus ──
  operatorModalOpen: false,
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
