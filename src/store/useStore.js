// src/store/useStore.js — Zustand global state
import { create } from 'zustand';

const useStore = create((set, get) => ({
  // ── Core state ──
  view: 'dashboard',         // current view
  currentLab: null,          // 1 | 2
  currentMission: null,      // 0-4 index
  totalXP: 0,
  badges: [],
  completedMissions: {},     // { missionId: true }
  missionTasks: {},          // { missionId: [bool] }
  hintPenalties: {},         // { missionId: totalPenalty }

  // ── Toast ──
  xpToast: null,             // { text, type }
  badgeToast: null,          // { emoji, name }

  // ── Friends (mutable list) ──
  friends: [],
  friendRequests: [],

  // ── Actions ──
  setView: (view) => set({ view }),
  setLab: (labId) => set({ currentLab: labId }),
  setMission: (idx) => set({ currentMission: idx }),

  openMission: (labId, missionIdx) =>
    set({ currentLab: labId, currentMission: missionIdx, view: 'mission' }),

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
    set({
      completedMissions: { ...s.completedMissions, [missionId]: true },
      totalXP: s.totalXP + xp,
      badges: [...s.badges, badge],
      xpToast: { text: `+${xp} XP`, type: 'green' },
    });
    setTimeout(() => {
      set({ xpToast: null });
      setTimeout(() => {
        set({ badgeToast: badge });
        setTimeout(() => set({ badgeToast: null }), 4000);
      }, 400);
    }, 3000);
  },

  applyHintPenalty: (missionId, penalty) =>
    set((s) => ({
      totalXP: Math.max(0, s.totalXP - penalty),
      hintPenalties: {
        ...s.hintPenalties,
        [missionId]: (s.hintPenalties[missionId] || 0) + penalty,
      },
    })),

  showToast: (text, type = 'green') => {
    set({ xpToast: { text, type } });
    setTimeout(() => set({ xpToast: null }), 3000);
  },

  addFriend: (friend) =>
    set((s) => ({ friends: [...s.friends, friend] })),

  acceptRequest: (name) =>
    set((s) => ({
      friendRequests: s.friendRequests.filter((r) => r.name !== name),
      friends: [...s.friends, { name, xp: 0, status: 'Joined recently', online: true, avatar: name[0] }],
    })),

  declineRequest: (name) =>
    set((s) => ({ friendRequests: s.friendRequests.filter((r) => r.name !== name) })),

  initFriends: (friends, requests) => set({ friends, friendRequests: requests }),

  showDebrief: (labId) => set({ view: 'debrief', currentLab: labId }),
}));

export default useStore;
