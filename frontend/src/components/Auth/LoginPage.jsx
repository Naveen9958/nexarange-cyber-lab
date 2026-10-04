// src/components/Auth/LoginPage.jsx — Cyber Command Enclave Authentication & Registration
import React, { useState } from 'react';
import useStore from '../../store/useStore';
import {
  IconLock,
  IconShield,
  IconArrowRight,
  IconUser,
  IconZap,
  IconEye,
  IconEyeOff,
  IconUserPlus,
  IconKey,
  IconSun,
  IconMoon,
} from '../Common/Icons';
import s from './LoginPage.module.css';

const ENCLAVE_ROLES = [
  'AI Security Analyst',
  'SOC Operations Lead',
  'Red Team Specialist',
  'Cloud Defense Engineer',
  'Threat Intelligence Hunter',
];

export default function LoginPage() {
  const { login, registerOperator, operator, theme, toggleTheme } = useStore();
  
  // Auth Mode: 'signin' | 'register'
  const [authMode, setAuthMode] = useState('signin');

  // Sign In State
  const [callsign, setCallsign] = useState(() => {
    return operator?.callsign || '0xNAVEEN';
  });
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regCallsign, setRegCallsign] = useState('');
  const [regPassphrase, setRegPassphrase] = useState('');
  const [regRole, setRegRole] = useState('AI Security Analyst');
  const [showRegPassphrase, setShowRegPassphrase] = useState(false);

  const [loading, setLoading] = useState(false);

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const targetCallsign = callsign.trim() || '0xNAVEEN';
    await login({
      callsign: targetCallsign,
      name: targetCallsign.replace(/^0x/i, ''),
      passphrase: passphrase || 'CyberAccess2026!',
      role: operator?.role || 'AI Security Analyst',
    });
    setLoading(false);
  };

  // Handle Registration Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const name = regName.trim() || 'Cyber Operator';
    const cleanCallsign = regCallsign.trim() 
      ? (regCallsign.trim().toUpperCase().startsWith('0X') ? regCallsign.trim().toUpperCase() : `0x${regCallsign.trim().toUpperCase()}`)
      : `0x${name.toUpperCase().replace(/\s+/g, '')}`;

    await registerOperator({
      name,
      callsign: cleanCallsign,
      role: regRole,
      passphrase: regPassphrase || 'CyberAccess2026!',
      clearance: 'TS/SCI-AI',
    });
    setLoading(false);
  };

  return (
    <div className={s.loginPage}>
      <div className={s.cyberGrid} />
      <div className={s.glowOrb} />

      {/* Top Floating Theme Switcher */}
      <div className={s.themeToggleWrap}>
        <button
          type="button"
          className={s.themeToggleBtn}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          aria-label="Toggle Theme"
        >
          <span className={s.themeToggleIcon}>
            {theme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
          </span>
          <span>{theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}</span>
        </button>
      </div>

      <div className={s.loginCard}>
        {/* Official NexaRange Logo Badge */}
        <div className={s.logoWrap}>
          <div className={s.brandLogoBox}>
            <img
              src="/nexarange-logo.png"
              alt="NexaRange Official Emblem"
              className={s.brandLogoImg}
            />
          </div>
          <span className={s.logoPulse} />
        </div>

        {/* Security Enclave Tag */}
        <div className={s.statusBadge}>
          <span className={s.statusDot} />
          <span className={s.statusLabel}>SECURE ACCESS GATEWAY</span>
        </div>

        <h1 className={s.title}>
          {authMode === 'signin' ? 'COMMAND CENTER LOGIN' : 'OPERATOR REGISTRATION'}
        </h1>

        {/* Mode Switch Tabs */}
        <div className={s.tabGroup}>
          <button
            type="button"
            className={`${s.tabBtn} ${authMode === 'signin' ? s.tabActive : ''}`}
            onClick={() => setAuthMode('signin')}
          >
            <IconKey size={13} />
            <span>SIGN IN</span>
          </button>
          <button
            type="button"
            className={`${s.tabBtn} ${authMode === 'register' ? s.tabActive : ''}`}
            onClick={() => setAuthMode('register')}
          >
            <IconUserPlus size={13} />
            <span>REGISTER OPERATOR</span>
          </button>
        </div>

        {/* ── SIGN IN FORM ── */}
        {authMode === 'signin' ? (
          <form onSubmit={handleLoginSubmit} className={s.form}>
            <div className={s.inputGroup}>
              <label className={s.label}>OPERATOR CALLSIGN / USERNAME</label>
              <div className={s.inputWrap}>
                <IconUser size={15} className={s.inputIcon} />
                <input
                  type="text"
                  className={s.input}
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  placeholder="Enter callsign or name (e.g. 0xALEX, SHIVA)..."
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className={s.inputGroup}>
              <div className={s.labelRow}>
                <label className={s.label}>SECURITY PASSPHRASE</label>
                <span className={s.passStatusText}>
                  {showPassphrase ? 'PLAINTEXT' : 'PROTECTED'}
                </span>
              </div>
              <div className={s.inputWrap}>
                <IconLock size={15} className={s.inputIcon} />
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  className={s.input}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter any password (e.g. Cyber@2026)..."
                  required
                />
                <button
                  type="button"
                  className={`${s.eyeToggleBtn} ${showPassphrase ? s.eyeActive : ''}`}
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  title={showPassphrase ? 'Hide password' : 'Show password'}
                  aria-label={showPassphrase ? 'Hide password' : 'Show password'}
                >
                  {showPassphrase ? (
                    <IconEyeOff size={16} />
                  ) : (
                    <IconEye size={16} />
                  )}
                  <span className={s.eyeText}>{showPassphrase ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>

            <div className={s.clearancePill}>
              <IconShield size={12} className={s.clearanceIcon} />
              <span>ROLE: {operator?.role?.toUpperCase() || 'AI SECURITY ANALYST'} · CLEARANCE: TS/SCI-AI</span>
            </div>

            <button
              type="submit"
              className={s.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span>VERIFYING CREDENTIALS...</span>
              ) : (
                <>
                  <span>INITIATE SECURE SESSION</span>
                  <IconArrowRight size={15} />
                </>
              )}
            </button>

            {/* Quick Demo Access Options */}
            <div className={s.demoSection}>
              <button
                type="button"
                className={s.demoBtn}
                onClick={() => {
                  login({
                    name: 'Guest Operator',
                    callsign: '0xGUEST',
                    role: 'Security Analyst',
                    passphrase: 'demo-password',
                  });
                }}
              >
                <IconZap size={13} />
                <span>FAST ACCESS: GUEST OPERATOR (INSTANT DEMO)</span>
              </button>
            </div>
          </form>
        ) : (
          /* ── REGISTRATION FORM ── */
          <form onSubmit={handleRegisterSubmit} className={s.form}>
            <div className={s.inputGroup}>
              <label className={s.label}>OPERATOR FULL NAME</label>
              <div className={s.inputWrap}>
                <IconUser size={15} className={s.inputIcon} />
                <input
                  type="text"
                  className={s.input}
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (!regCallsign || regCallsign.startsWith('0x')) {
                      setRegCallsign(e.target.value ? `0x${e.target.value.replace(/\s+/g, '').toUpperCase()}` : '');
                    }
                  }}
                  placeholder="e.g. Shiva Kumar, Alex Vance..."
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className={s.inputGroup}>
              <label className={s.label}>OPERATOR CALLSIGN / ID</label>
              <div className={s.inputWrap}>
                <IconShield size={15} className={s.inputIcon} />
                <input
                  type="text"
                  className={s.input}
                  value={regCallsign}
                  onChange={(e) => setRegCallsign(e.target.value)}
                  placeholder="e.g. 0xSHIVA, 0xAGENT..."
                  required
                />
              </div>
            </div>

            <div className={s.inputGroup}>
              <div className={s.labelRow}>
                <label className={s.label}>SET SECURITY PASSPHRASE</label>
                <span className={s.passStatusText}>
                  {showRegPassphrase ? 'PLAINTEXT' : 'PROTECTED'}
                </span>
              </div>
              <div className={s.inputWrap}>
                <IconLock size={15} className={s.inputIcon} />
                <input
                  type={showRegPassphrase ? 'text' : 'password'}
                  className={s.input}
                  value={regPassphrase}
                  onChange={(e) => setRegPassphrase(e.target.value)}
                  placeholder="Set any password of your choice..."
                  required
                />
                <button
                  type="button"
                  className={`${s.eyeToggleBtn} ${showRegPassphrase ? s.eyeActive : ''}`}
                  onClick={() => setShowRegPassphrase(!showRegPassphrase)}
                  title={showRegPassphrase ? 'Hide password' : 'Show password'}
                  aria-label={showRegPassphrase ? 'Hide password' : 'Show password'}
                >
                  {showRegPassphrase ? (
                    <IconEyeOff size={16} />
                  ) : (
                    <IconEye size={16} />
                  )}
                  <span className={s.eyeText}>{showRegPassphrase ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>

            <div className={s.inputGroup}>
              <label className={s.label}>ASSIGNED OPERATIONAL ROLE</label>
              <select
                className={s.selectInput}
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                {ENCLAVE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className={s.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span>REGISTERING OPERATOR...</span>
              ) : (
                <>
                  <span>REGISTER & ENTER LABS</span>
                  <IconArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
