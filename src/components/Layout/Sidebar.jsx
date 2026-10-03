// src/components/Layout/Sidebar.jsx — Streamlined Navigation Rail
import React from 'react';
import useStore from '../../store/useStore';
import {
  IconHQ,
  IconFlask,
  IconTerminal,
  IconTrophy,
  IconUsers,
  IconBarChart,
  IconAward,
} from '../Common/Icons';
import s from './Sidebar.module.css';

const NAV = [
  { id: 'dashboard',   label: 'HQ',    desc: 'Command Center', icon: IconHQ },
  { id: 'labs',        label: 'LABS',  desc: 'Operations',     icon: IconFlask },
  { id: 'terminal',    label: 'TERM',  desc: 'Enclave Shell',  icon: IconTerminal },
  { id: 'leaderboard', label: 'RANK',  desc: 'Leaderboard',    icon: IconTrophy },
  { id: 'friends',     label: 'SQUAD', desc: 'Squad Network',  icon: IconUsers },
  { id: 'analytics',   label: 'STATS', desc: 'Telemetry',      icon: IconBarChart },
  { id: 'certificates',label: 'CERTS', desc: 'Credentials',    icon: IconAward },
];

export default function Sidebar() {
  const { view, setView } = useStore();

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className={s.sidebar} aria-label="Main Navigation">
        {/* Navigation Items */}
        <nav className={s.navItems}>
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = view === n.id || (n.id === 'labs' && (view === 'mission' || view === 'debrief'));
            return (
              <button
                key={n.id}
                className={`${s.navBtn} ${isActive ? s.active : ''}`}
                onClick={() => setView(n.id)}
                title={`${n.label} — ${n.desc}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={s.indicator} />
                <span className={s.navIcon}>
                  <Icon size={20} />
                </span>
                <span className={s.navLabel}>{n.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className={s.mobileBar} aria-label="Mobile Navigation">
        {NAV.map((n) => {
          const Icon = n.icon;
          const isActive = view === n.id || (n.id === 'labs' && (view === 'mission' || view === 'debrief'));
          return (
            <button
              key={n.id}
              className={`${s.mobileBtn} ${isActive ? s.mobileActive : ''}`}
              onClick={() => setView(n.id)}
            >
              <Icon size={18} />
              <span className={s.mobileLabel}>{n.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
