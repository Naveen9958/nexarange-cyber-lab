// src/components/Layout/TopBar.jsx — Refined Command Center Status Bar
import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import {
  IconShield,
  IconZap,
  IconSun,
  IconMoon,
} from '../Common/Icons';
import s from './TopBar.module.css';

const SECTION_TITLES = {
  dashboard:    { title: 'COMMAND CENTER', subtitle: 'HQ Telemetry & Operations Overview' },
  labs:         { title: 'SECURITY LABS', subtitle: 'Active Operations & Incident Response' },
  terminal:     { title: 'ENCLAVE TERMINAL', subtitle: 'Simulated Security Shell v2.6' },
  leaderboard:  { title: 'GLOBAL LEADERBOARD', subtitle: 'Global Operator Rankings' },
  friends:      { title: 'SQUAD NETWORK', subtitle: 'Peer Intelligence & Cooperative Squad' },
  analytics:    { title: 'PERFORMANCE ANALYTICS', subtitle: 'Skill Matrix & Progression Metrics' },
  certificates: { title: 'CREDENTIALS VAULT', subtitle: 'Official Case Accreditations' },
  mission:      { title: 'ACTIVE MISSION', subtitle: 'Incident Triage & Threat Mitigation' },
  debrief:      { title: 'OPERATION DEBRIEF', subtitle: 'Case Analysis & Retrospective' },
};

export default function TopBar() {
  const {
    view,
    totalXP,
    getLevel,
    threatLevel,
    setOperatorModalOpen,
    operator,
    theme,
    toggleTheme,
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

  const section = SECTION_TITLES[view] || { title: view.toUpperCase(), subtitle: 'Cyber Enclave' };
  const isElevated = threatLevel === 'ELEVATED' || threatLevel === 'CRITICAL';

  return (
    <header className={s.topbar}>
      {/* Left: Operational Section Title */}
      <div className={s.left}>
        <div className={s.sectionBadge}>
          <span className={s.sectionPrefix}>NEXARANGE //</span>
          <span className={s.sectionTitle}>{section.title}</span>
        </div>
        <span className={s.sectionSubtitle}>{section.subtitle}</span>
      </div>

      {/* Center/Right: Status Badges, XP, Level, Theme, Clock */}
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

        {/* Light / Dark Mode Toggle Button */}
        <button
          className={s.themeToggleBtn}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle light and dark mode"
        >
          {theme === 'dark' ? (
            <>
              <IconSun size={15} className={s.sunIcon} />
              <span className={s.themeLabel}>LIGHT</span>
            </>
          ) : (
            <>
              <IconMoon size={15} className={s.moonIcon} />
              <span className={s.themeLabel}>DARK</span>
            </>
          )}
        </button>

        {/* Live Clock */}
        <div className={s.clockBox} title="Enclave UTC Time">
          <span className={s.clockTime}>{time}</span>
        </div>

        {/* Profile Avatar Button */}
        <button
          className={s.profileBtn}
          onClick={() => setOperatorModalOpen(true)}
          title="Open Operator Profile"
        >
          <div className={s.profileAvatar}>{operator.avatar}</div>
        </button>
      </div>
    </header>
  );
}
