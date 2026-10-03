// src/components/Auth/LogoutPage.jsx — Dedicated Session Terminated Page
import React from 'react';
import useStore from '../../store/useStore';
import {
  IconLock,
  IconShield,
  IconArrowRight,
  IconZap,
} from '../Common/Icons';
import s from './LogoutPage.module.css';

export default function LogoutPage() {
  const { setRoute, login, sessionId } = useStore();

  return (
    <div className={s.logoutPage}>
      {/* Background Cyber Grid & Glow */}
      <div className={s.cyberGrid} />
      <div className={s.glowOrb} />

      {/* Centered Security Card */}
      <div className={s.securityCard}>
        {/* Official NexaRange Logo */}
        <div className={s.logoWrap}>
          <div className={s.brandLogoBox}>
            <img
              src="/nexarange-logo.png"
              alt="NexaRange Emblem"
              className={s.brandLogoImg}
            />
          </div>
          <span className={s.logoPulse} />
        </div>

        {/* Security Status Badge */}
        <div className={s.statusBadge}>
          <span className={s.statusDot} />
          <span className={s.statusLabel}>SESSION OFFLINE</span>
        </div>

        {/* Title & Description */}
        <h1 className={s.title}>SESSION TERMINATED</h1>
        <p className={s.subtitle}>
          Your Nexarange command-center session has been securely closed.
        </p>

        {/* Security Diagnostics Strip */}
        <div className={s.diagnosticsBox}>
          <div className={s.diagRow}>
            <span className={s.diagKey}>AUTH TOKEN</span>
            <span className={s.diagValCleared}>CLEARED</span>
          </div>
          <div className={s.diagRow}>
            <span className={s.diagKey}>SESSION STATE</span>
            <span className={s.diagVal}>TERMINATED</span>
          </div>
          <div className={s.diagRow}>
            <span className={s.diagKey}>ACCESS CHANNEL</span>
            <span className={s.diagVal}>CLOSED</span>
          </div>
          <div className={s.diagRow}>
            <span className={s.diagKey}>SESSION TRACE</span>
            <span className={s.diagValMono}>{sessionId || 'NR-SES-882194'}</span>
          </div>
        </div>

        <p className={s.notice}>
          All authentication credentials associated with this session have been purged from browser memory.
        </p>

        {/* Primary & Secondary Actions */}
        <div className={s.actions}>
          <button
            type="button"
            className={s.primaryBtn}
            onClick={() => setRoute('/login')}
          >
            <span>RETURN TO LOGIN</span>
            <IconArrowRight size={16} />
          </button>

          <button
            type="button"
            className={s.secondaryBtn}
            onClick={() => login('Naveen')}
          >
            <IconZap size={14} />
            <span>QUICK RE-AUTHENTICATE</span>
          </button>
        </div>

        {/* Security Footer Notice */}
        <div className={s.cardFooter}>
          <IconShield size={12} className={s.footerIcon} />
          <span>ZERO-TRUST ENCLAVE PROTOCOL // DISCONNECT VERIFIED</span>
        </div>
      </div>
    </div>
  );
}
