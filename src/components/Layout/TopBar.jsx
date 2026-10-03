// src/components/Layout/TopBar.jsx — Streamlined Cyber Operations Header
import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import {
  IconShield,
  IconZap,
} from '../Common/Icons';
import s from './TopBar.module.css';

const SECTION_MAP = {
  dashboard:    { code: 'HQ', title: 'Telemetry & Operations Overview' },
  labs:         { code: 'LABS', title: 'Active Operations & Incident Response' },
  terminal:     { code: 'TERM', title: 'Simulated Security Shell v2.6' },
  leaderboard:  { code: 'RANK', title: 'Global Operator Rankings' },
  friends:      { code: 'SQUAD', title: 'Peer Intelligence & Cooperative Squad' },
  analytics:    { code: 'STATS', title: 'Skill Matrix & Progression Metrics' },
  certificates: { code: 'CERTS', title: 'Credentials & Security Accreditations' },
  mission:      { code: 'OPS', title: 'Incident Triage & Threat Mitigation' },
  debrief:      { code: 'DEBRIEF', title: 'Case Analysis & Retrospective' },
};

export default function TopBar() {
  const {
    view,
    totalXP,
    getLevel,
    threatLevel,
    operator,
    toggleProfileDropdown,
    profileDropdownOpen,
  } = useStore();

  const [time, setTime] = useState('');
  const level = getLevel();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const section = SECTION_MAP[view] || { code: view.toUpperCase(), title: 'Security Enclave' };
  const isElevated = threatLevel === 'ELEVATED' || threatLevel === 'CRITICAL';

  return (
    <header className={s.topbar}>
      {/* Left: Compact Context Indicator (No duplicate branding, clean hierarchy) */}
      <div className={s.left}>
        <div className={s.contextIndicator}>
          <span className={s.contextCode}>{section.code}</span>
          <span className={s.contextDot}>·</span>
          <span className={s.contextTitle}>{section.title}</span>
        </div>
      </div>

      {/* Right: Telemetry Status Pills, XP, Level, Clock, Profile */}
      <div className={s.right}>
        {/* System Operational Status */}
        <div className={s.statusPill}>
          <span className={s.statusDot} />
          <span className={s.statusText}>SYSTEM SECURE</span>
        </div>

        {/* Threat Condition */}
        <div className={`${s.threatPill} ${isElevated ? s.threatActive : ''}`}>
          <span className={s.threatLabel}>DEFCON:</span>
          <span className={s.threatVal}>{threatLevel}</span>
        </div>

        {/* Level Tag */}
        <div className={s.levelPill}>
          <IconShield size={14} className={s.levelIcon} />
          <span>LVL 0{level}</span>
        </div>

        {/* XP Counter */}
        <div className={s.xpBox}>
          <IconZap size={14} className={s.xpIcon} />
          <span className={s.xpLabel}>XP</span>
          <span className={s.xpValue}>{totalXP.toLocaleString()}</span>
        </div>

        {/* Live Clock */}
        <div className={s.clockBox} title="Enclave UTC Time">
          <span className={s.clockTime}>{time}</span>
        </div>

        {/* Profile Avatar Button (Toggles Profile & Appearance Menu) */}
        <button
          className={s.profileBtn}
          onClick={() => toggleProfileDropdown('header')}
          data-profile-trigger="true"
          title="Open Operator Profile & Settings"
          aria-label="Operator Profile and Appearance Settings"
          aria-expanded={profileDropdownOpen}
          aria-haspopup="dialog"
        >
          <div className={s.profileAvatar}>{operator.avatar}</div>
        </button>
      </div>
    </header>
  );
}
