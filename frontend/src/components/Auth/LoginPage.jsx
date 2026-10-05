// src/components/Auth/LoginPage.jsx — Cyber Command Enclave Authentication & Registration
import React, { useState } from 'react';
import useStore from '../../store/useStore';
import {
  IconLock,
  IconShield,
  IconArrowRight,
  IconUser,
  IconEye,
  IconEyeOff,
  IconUserPlus,
  IconKey,
  IconSun,
  IconMoon,
  IconCheckCircle,
  IconZap,
} from '../Common/Icons';
import s from './LoginPage.module.css';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const OPERATOR_ROLES = [
  {
    role: 'Fresher / Trainee',
    description: 'Entry-level operator learning the NexaRange security environment.',
  },
  {
    role: 'Junior Security Analyst',
    description: 'Entry-level analyst responsible for basic security monitoring and investigation.',
  },
  {
    role: 'Security Analyst',
    description: 'Operator responsible for security monitoring, analysis and incident response.',
  },
];

export default function LoginPage() {
  const { login, registerOperator, loginAsGuest, theme, toggleTheme } = useStore();
  
  // Auth Mode: 'signin' | 'register' | 'guest'
  const [authMode, setAuthMode] = useState('signin');

  // Sign In State — Strictly empty by default (No hardcoded NAVEEN or 0xNAVEEN)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State — Fully isolated per user
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('Fresher / Trainee');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI State & Validation
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [regError, setRegError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Active role description
  const activeRoleObj = OPERATOR_ROLES.find((r) => r.role === regRole) || OPERATOR_ROLES[0];

  // Handle Guest Login
  const handleGuestLogin = async () => {
    setLoading(true);
    setLoginError('');
    setRegError('');
    setSuccessMessage('');
    const result = await loginAsGuest();
    if (!result.success) {
      setLoginError(result.error || 'Failed to start guest session.');
      setLoading(false);
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setSuccessMessage('');

    const cleanIdent = identifier.trim();
    if (!cleanIdent) {
      setLoginError('Operator username or email is required.');
      return;
    }
    if (!password) {
      setLoginError('Password is required.');
      return;
    }

    setLoading(true);
    const result = await login({
      identifier: cleanIdent,
      password,
    });

    if (!result.success) {
      setLoginError(result.error || 'Authentication failed. Please verify credentials.');
    }
    setLoading(false);
  };

  // Handle Registration Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setSuccessMessage('');

    const errors = {};
    const cleanName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      errors.fullName = 'This field is required.';
    }
    if (!cleanUsername) {
      errors.username = 'This field is required.';
    }
    if (!cleanEmail) {
      errors.email = 'This field is required.';
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!regPassword) {
      errors.regPassword = 'This field is required.';
    } else if (regPassword.length < 6) {
      errors.regPassword = 'Password must be at least 6 characters long.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'This field is required.';
    } else if (regPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setLoading(true);
    const result = await registerOperator({
      fullName: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: regPassword,
      role: regRole,
    });

    if (result.success) {
      setSuccessMessage('Operator account created successfully. You can now sign in.');
      setIdentifier(cleanUsername); // Pre-fill login with newly registered username
      setPassword('');
      setRegPassword('');
      setConfirmPassword('');
      setFullName('');
      setUsername('');
      setEmail('');
      setRegRole('Fresher / Trainee');
      setAuthMode('signin');
    } else {
      setRegError(result.error || 'Could not register operator account.');
    }
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
          {authMode === 'signin'
            ? 'COMMAND CENTER LOGIN'
            : authMode === 'register'
            ? 'OPERATOR REGISTRATION'
            : 'GUEST SANDBOX ACCESS'}
        </h1>

        {/* Mode Switch Tabs */}
        <div className={s.tabGroup}>
          <button
            type="button"
            className={`${s.tabBtn} ${authMode === 'signin' ? s.tabActive : ''}`}
            onClick={() => {
              setAuthMode('signin');
              setRegError('');
              setFormErrors({});
            }}
          >
            <IconKey size={13} />
            <span>SIGN IN</span>
          </button>
          <button
            type="button"
            className={`${s.tabBtn} ${authMode === 'register' ? s.tabActive : ''}`}
            onClick={() => {
              setAuthMode('register');
              setLoginError('');
              setSuccessMessage('');
            }}
          >
            <IconUserPlus size={13} />
            <span>REGISTER</span>
          </button>
          <button
            type="button"
            className={`${s.tabBtn} ${authMode === 'guest' ? s.tabActive : ''}`}
            onClick={() => {
              setAuthMode('guest');
              setLoginError('');
              setRegError('');
              setSuccessMessage('');
            }}
          >
            <IconZap size={13} />
            <span>GUEST</span>
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className={s.successBanner} role="status">
            <IconCheckCircle size={15} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ── SIGN IN FORM ── */}
        {authMode === 'signin' ? (
          <form onSubmit={handleLoginSubmit} className={s.form} noValidate>
            {loginError && (
              <div className={s.errorBanner} role="alert">
                <span>{loginError}</span>
              </div>
            )}

            <div className={s.inputGroup}>
              <label htmlFor="login-identifier" className={s.label}>OPERATOR USERNAME / EMAIL</label>
              <div className={s.inputWrap}>
                <IconUser size={15} className={s.inputIcon} />
                <input
                  id="login-identifier"
                  type="text"
                  className={s.input}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="Enter username or email"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div className={s.inputGroup}>
              <div className={s.labelRow}>
                <label htmlFor="login-password" className={s.label}>PASSWORD</label>
                <span className={s.passStatusText}>
                  {showPassword ? 'SHOW' : 'HIDE'}
                </span>
              </div>
              <div className={s.inputWrap}>
                <IconLock size={15} className={s.inputIcon} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={s.input}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={`${s.eyeToggleBtn} ${showPassword ? s.eyeActive : ''}`}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <IconEyeOff size={16} />
                  ) : (
                    <IconEye size={16} />
                  )}
                  <span className={s.eyeText}>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={s.submitBtn}
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <span>INITIATE SECURE SESSION →</span>
                </>
              )}
            </button>

            {/* Quick Guest Access Divider & Button */}
            <div className={s.orDivider}>
              <span className={s.dividerLine} />
              <span className={s.dividerText}>OR EXPLORE DIRECTLY</span>
              <span className={s.dividerLine} />
            </div>

            <button
              type="button"
              className={s.guestQuickBtn}
              onClick={handleGuestLogin}
              disabled={loading}
              id="guest-login-quick-btn"
              title="Instant access without username or password"
            >
              <div className={s.guestQuickLeft}>
                <IconZap size={14} className={s.guestZapIcon} />
                <span>CONTINUE AS GUEST OPERATOR</span>
              </div>
              <span className={s.guestInstantTag}>INSTANT</span>
            </button>
          </form>
        ) : authMode === 'register' ? (
          /* ── REGISTRATION FORM ── */
          <form onSubmit={handleRegisterSubmit} className={s.form} noValidate>
            {regError && (
              <div className={s.errorBanner} role="alert">
                <span>{regError}</span>
              </div>
            )}

            {/* FULL NAME */}
            <div className={s.inputGroup}>
              <label htmlFor="reg-fullname" className={s.label}>FULL NAME</label>
              <div className={`${s.inputWrap} ${formErrors.fullName ? s.inputError : ''}`}>
                <IconUser size={15} className={s.inputIcon} />
                <input
                  id="reg-fullname"
                  type="text"
                  className={s.input}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: '' });
                  }}
                  placeholder="e.g. Naveen Kumar"
                  required
                  autoFocus
                  autoComplete="name"
                />
              </div>
              {formErrors.fullName && <span className={s.fieldError}>{formErrors.fullName}</span>}
            </div>

            {/* USERNAME / CALLSIGN */}
            <div className={s.inputGroup}>
              <label htmlFor="reg-username" className={s.label}>USERNAME / CALLSIGN</label>
              <div className={`${s.inputWrap} ${formErrors.username ? s.inputError : ''}`}>
                <IconShield size={15} className={s.inputIcon} />
                <input
                  id="reg-username"
                  type="text"
                  className={s.input}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (formErrors.username) setFormErrors({ ...formErrors, username: '' });
                  }}
                  placeholder="e.g. naveen"
                  required
                  autoComplete="username"
                />
              </div>
              {formErrors.username && <span className={s.fieldError}>{formErrors.username}</span>}
            </div>

            {/* EMAIL */}
            <div className={s.inputGroup}>
              <label htmlFor="reg-email" className={s.label}>EMAIL</label>
              <div className={`${s.inputWrap} ${formErrors.email ? s.inputError : ''}`}>
                <IconUser size={15} className={s.inputIcon} />
                <input
                  id="reg-email"
                  type="email"
                  className={s.input}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                  }}
                  placeholder="e.g. naveen@gmail.com"
                  required
                  autoComplete="email"
                />
              </div>
              {formErrors.email && <span className={s.fieldError}>{formErrors.email}</span>}
            </div>

            {/* PASSWORD */}
            <div className={s.inputGroup}>
              <div className={s.labelRow}>
                <label htmlFor="reg-password" className={s.label}>PASSWORD</label>
                <span className={s.passStatusText}>
                  {showRegPassword ? 'SHOW' : 'HIDE'}
                </span>
              </div>
              <div className={`${s.inputWrap} ${formErrors.regPassword ? s.inputError : ''}`}>
                <IconLock size={15} className={s.inputIcon} />
                <input
                  id="reg-password"
                  type={showRegPassword ? 'text' : 'password'}
                  className={s.input}
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    if (formErrors.regPassword) setFormErrors({ ...formErrors, regPassword: '' });
                  }}
                  placeholder="Enter password (min 6 characters)"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={`${s.eyeToggleBtn} ${showRegPassword ? s.eyeActive : ''}`}
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  title={showRegPassword ? 'Hide password' : 'Show password'}
                  aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? (
                    <IconEyeOff size={16} />
                  ) : (
                    <IconEye size={16} />
                  )}
                  <span className={s.eyeText}>{showRegPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              {formErrors.regPassword && <span className={s.fieldError}>{formErrors.regPassword}</span>}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className={s.inputGroup}>
              <div className={s.labelRow}>
                <label htmlFor="reg-confirm-password" className={s.label}>CONFIRM PASSWORD</label>
                <span className={s.passStatusText}>
                  {showConfirmPassword ? 'SHOW' : 'HIDE'}
                </span>
              </div>
              <div className={`${s.inputWrap} ${formErrors.confirmPassword ? s.inputError : ''}`}>
                <IconLock size={15} className={s.inputIcon} />
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={s.input}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: '' });
                  }}
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={`${s.eyeToggleBtn} ${showConfirmPassword ? s.eyeActive : ''}`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <IconEyeOff size={16} />
                  ) : (
                    <IconEye size={16} />
                  )}
                  <span className={s.eyeText}>{showConfirmPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              {formErrors.confirmPassword && <span className={s.fieldError}>{formErrors.confirmPassword}</span>}
            </div>

            {/* ASSIGNED OPERATOR ROLE */}
            <div className={s.inputGroup}>
              <label htmlFor="reg-role" className={s.label}>ASSIGNED OPERATOR ROLE</label>
              <select
                id="reg-role"
                className={s.selectInput}
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                {OPERATOR_ROLES.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.role}
                  </option>
                ))}
              </select>
              <div className={s.roleDescBox}>
                {activeRoleObj.description}
              </div>
            </div>

            <button
              type="submit"
              className={s.submitBtn}
              disabled={loading}
              id="register-submit-btn"
            >
              {loading ? (
                <span>CREATING OPERATOR ACCOUNT...</span>
              ) : (
                <>
                  <span>CREATE OPERATOR ACCOUNT</span>
                  <IconArrowRight size={15} />
                </>
              )}
            </button>

            {/* Quick Guest Access Divider & Button on Register Tab */}
            <div className={s.orDivider}>
              <span className={s.dividerLine} />
              <span className={s.dividerText}>OR EXPLORE DIRECTLY</span>
              <span className={s.dividerLine} />
            </div>

            <button
              type="button"
              className={s.guestQuickBtn}
              onClick={handleGuestLogin}
              disabled={loading}
              id="guest-register-quick-btn"
              title="Instant access without username or password"
            >
              <div className={s.guestQuickLeft}>
                <IconZap size={14} className={s.guestZapIcon} />
                <span>CONTINUE AS GUEST OPERATOR</span>
              </div>
              <span className={s.guestInstantTag}>INSTANT</span>
            </button>
          </form>
        ) : (
          /* ── GUEST SANDBOX SCREEN ── */
          <div className={s.guestCard}>
            {loginError && (
              <div className={s.errorBanner} role="alert">
                <span>{loginError}</span>
              </div>
            )}

            <div className={s.guestBriefing}>
              <div className={s.guestPill}>
                <span className={s.guestDot} />
                <span>SANDBOX RECONNAISSANCE</span>
              </div>
              <h3 className={s.guestHeading}>INSTANT GUEST ACCESS</h3>
              <p className={s.guestSubtext}>
                Explore the complete cyber range simulation enclave without registration or permanent credentials.
              </p>
            </div>

            <div className={s.guestPillGrid}>
              <div className={s.guestPillItem}>
                <span className={s.guestPillEmoji}>🛡️</span>
                <div className={s.guestPillText}>
                  <strong>5 Scenario Labs</strong>
                  <span>Interactive threat vectors</span>
                </div>
              </div>
              <div className={s.guestPillItem}>
                <span className={s.guestPillEmoji}>⚡</span>
                <div className={s.guestPillText}>
                  <strong>Zero Setup</strong>
                  <span>1-click instant session</span>
                </div>
              </div>
              <div className={s.guestPillItem}>
                <span className={s.guestPillEmoji}>💻</span>
                <div className={s.guestPillText}>
                  <strong>CLI Terminal</strong>
                  <span>Live forensics & logs</span>
                </div>
              </div>
              <div className={s.guestPillItem}>
                <span className={s.guestPillEmoji}>🎖️</span>
                <div className={s.guestPillText}>
                  <strong>Dossier 0xGUEST</strong>
                  <span>Sandbox trainee clearance</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={s.guestLaunchBtn}
              onClick={handleGuestLogin}
              disabled={loading}
              id="launch-guest-btn"
            >
              {loading ? (
                <span>INITIALIZING GUEST SESSION...</span>
              ) : (
                <>
                  <IconZap size={16} />
                  <span>LAUNCH GUEST SESSION →</span>
                </>
              )}
            </button>

            <p className={s.guestNote}>
              * Guest sessions are temporary sandbox sessions. You can register an official operator callsign anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
