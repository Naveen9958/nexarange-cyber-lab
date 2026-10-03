// src/components/Layout/TopBar.jsx — Refined NexaRange Command Bar with Official Logo
import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import s from './TopBar.module.css';

export default function TopBar() {
  const {
    threatLevel,
    operator,
    toggleProfileDropdown,
    profileDropdownOpen,
    setView,
  } = useStore();

  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const isElevated = threatLevel === 'ELEVATED' || threatLevel === 'CRITICAL';

  return (
    <header className={s.topbar}>
      {/* Left: Official NexaRange Logo & Branding */}
      <div className={s.left}>
        <div
          className={s.brand}
          onClick={() => setView('dashboard')}
          role="button"
          tabIndex={0}
          title="NexaRange Command Center"
        >
          <div className={s.brandLogoWrap}>
            <img
              src="/nexarange-logo.png"
              alt="NexaRange Emblem"
              className={s.brandLogoImg}
            />
          </div>
          <div className={s.brandTitle}>
            <span className={s.brandNexa}>Nexa</span>
            <span className={s.brandRange}>Range</span>
          </div>
        </div>
      </div>

      {/* Right: System Status, DEFCON, Time, Profile Avatar */}
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
