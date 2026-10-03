// src/components/Layout/OperatorModal.jsx — Operator Profile & Settings Modal
import React, { useEffect, useState } from 'react';
import useStore from '../../store/useStore';
import {
  IconShield,
  IconAward,
  IconZap,
  IconTarget,
  IconSun,
  IconMoon,
  IconMonitor,
  IconSettings,
  IconUser,
  IconKey,
  IconLock,
} from '../Common/Icons';
import s from './OperatorModal.module.css';

export default function OperatorModal() {
  const {
    operator,
    totalXP,
    badges,
    completedMissions,
    getRank,
    getLevel,
    operatorModalOpen,
    setOperatorModalOpen,
    operatorModalTab,
    setOperatorModalTab,
    themeMode,
    setTheme,
    resetProgress,
    showToast,
    authToken,
    sessionId,
  } = useStore();

  const [confirmReset, setConfirmReset] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && operatorModalOpen) {
        setOperatorModalOpen(false);
        setConfirmReset(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [operatorModalOpen, setOperatorModalOpen]);

  if (!operatorModalOpen) return null;

  const rank = getRank();
  const level = getLevel();
  const missionsCount = Object.keys(completedMissions).length;

  const THEME_OPTIONS = [
    { id: 'dark', label: 'Dark', icon: IconMoon },
    { id: 'light', label: 'Light', icon: IconSun },
    { id: 'system', label: 'System', icon: IconMonitor },
  ];

  return (
    <div
      className={s.backdrop}
      onClick={() => {
        setOperatorModalOpen(false);
        setConfirmReset(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="operator-modal-title"
    >
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Pinned Modal Header */}
        <div className={s.header}>
          <div className={s.headerLeft}>
            <div className={s.avatar}>{operator.avatar || 'O'}</div>
            <div>
              <div className={s.name} id="operator-modal-title">
                {operator.name || 'Operator'}
              </div>
              <div className={s.callsign}>
                {operator.callsign || '0xOPERATOR'} · <span className={s.clearance}>{operator.clearance || 'TS/SCI-AI'}</span>
              </div>
            </div>
          </div>
          <button
            className={s.closeBtn}
            onClick={() => {
              setOperatorModalOpen(false);
              setConfirmReset(false);
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Pinned Tab Bar: Profile vs Settings */}
        <div className={s.tabBar}>
          <button
            type="button"
            className={`${s.tabBtn} ${operatorModalTab === 'profile' ? s.tabBtnActive : ''}`}
            onClick={() => setOperatorModalTab('profile')}
          >
            <IconUser size={14} />
            <span>OPERATOR PROFILE</span>
          </button>
          <button
            type="button"
            className={`${s.tabBtn} ${operatorModalTab === 'settings' ? s.tabBtnActive : ''}`}
            onClick={() => setOperatorModalTab('settings')}
          >
            <IconSettings size={14} />
            <span>ENCLAVE SETTINGS</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className={s.body}>
          {operatorModalTab === 'profile' ? (
            /* ════════ PROFILE TAB ════════ */
            <>
              {/* Quick Metrics */}
              <div className={s.statsGrid}>
                <div className={s.statBox}>
                  <div className={s.statLabel}><IconShield size={13} /> LEVEL</div>
                  <div className={s.statVal}>LVL 0{level}</div>
                </div>
                <div className={s.statBox}>
                  <div className={s.statLabel}><IconTarget size={13} /> GLOBAL RANK</div>
                  <div className={s.statVal}>#{rank}</div>
                </div>
                <div className={s.statBox}>
                  <div className={s.statLabel}><IconZap size={13} /> TOTAL XP</div>
                  <div className={s.statVal}>{totalXP.toLocaleString()} XP</div>
                </div>
                <div className={s.statBox}>
                  <div className={s.statLabel}><IconAward size={13} /> MISSIONS</div>
                  <div className={s.statVal}>{missionsCount} / 10</div>
                </div>
              </div>

              {/* Clearance Tracks */}
              <div className={s.section}>
                <div className={s.sectionTitle}>// ACTIVE CLEARANCE & TRACKS</div>
                <div className={s.badgePills}>
                  <span className={s.pill}>AI Threat Intelligence</span>
                  <span className={s.pill}>Autonomous Agent Auditing</span>
                  <span className={s.pill}>Zero-Trust Architecture</span>
                  <span className={s.pill}>Cloud Penetration</span>
                </div>
              </div>

              {/* Accreditations */}
              <div className={s.section}>
                <div className={s.sectionTitle}>// UNLOCKED CREDENTIALS ({badges.length})</div>
                {badges.length === 0 ? (
                  <div className={s.emptyBadges}>
                    No badges earned yet. Complete simulation labs to unlock security accolades.
                  </div>
                ) : (
                  <div className={s.badgesGrid}>
                    {badges.map((b, i) => (
                      <div key={i} className={s.badgeCard}>
                        <span className={s.badgeEmoji}>{b.emoji}</span>
                        <span className={s.badgeName}>{b.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ════════ SETTINGS TAB ════════ */
            <>
              {/* Appearance / Theme */}
              <div className={s.section}>
                <div className={s.sectionTitle}>// APPEARANCE & THEME</div>
                <div className={s.themeRow} role="radiogroup" aria-label="Appearance Theme">
                  {THEME_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = themeMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`${s.themePill} ${isSelected ? s.themePillActive : ''}`}
                        onClick={() => setTheme(opt.id)}
                      >
                        <Icon size={14} />
                        <span>{opt.label}</span>
                        <span className={s.radioDot}>{isSelected ? '●' : '○'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audio & Feedback */}
              <div className={s.section}>
                <div className={s.sectionTitle}>// AUDIO & FEEDBACK DIRECTIVE</div>
                <div className={s.settingRow}>
                  <div className={s.settingMeta}>
                    <div className={s.settingLabel}>Cyber Telemetry Audio & Sound FX</div>
                    <div className={s.settingDesc}>Terminal keystrokes, mission completions, and threat alert audio</div>
                  </div>
                  <button
                    type="button"
                    className={`${s.toggleSwitch} ${audioEnabled ? s.toggleOn : ''}`}
                    onClick={() => {
                      const next = !audioEnabled;
                      setAudioEnabled(next);
                      showToast(`Audio FX ${next ? 'enabled' : 'muted'}.`, 'info');
                    }}
                  >
                    <span>{audioEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Session Diagnostics */}
              <div className={s.section}>
                <div className={s.sectionTitle}>// CRYPTOGRAPHIC CREDENTIALS</div>
                <div className={s.diagCard}>
                  <div className={s.diagLine}>
                    <span className={s.diagKey}><IconKey size={12} /> AUTH TOKEN</span>
                    <span className={s.diagValMono}>{authToken ? `${authToken.slice(0, 16)}...` : 'SECURE_ACTIVE'}</span>
                  </div>
                  <div className={s.diagLine}>
                    <span className={s.diagKey}><IconLock size={12} /> SESSION ID</span>
                    <span className={s.diagValMono}>{sessionId || 'NR-SES-882194'}</span>
                  </div>
                  <div className={s.diagLine}>
                    <span className={s.diagKey}><IconShield size={12} /> DIRECTIVE</span>
                    <span className={s.diagValGreen}>ZERO-TRUST ENFORCED</span>
                  </div>
                </div>
              </div>

              {/* Actions & Session Reset */}
              <div className={s.section}>
                <div className={s.sectionTitle}>// TELEMETRY & DATA CONTROL</div>
                <div className={s.actions}>
                  {confirmReset ? (
                    <div className={s.confirmBox}>
                      <span className={s.confirmText}>Reset all simulation metrics?</span>
                      <button
                        type="button"
                        className={s.confirmYes}
                        onClick={() => {
                          resetProgress();
                          setConfirmReset(false);
                          setOperatorModalOpen(false);
                        }}
                      >
                        Confirm Reset
                      </button>
                      <button
                        type="button"
                        className={s.confirmNo}
                        onClick={() => setConfirmReset(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className={s.btnGroup}>
                      <button
                        type="button"
                        className={s.actionBtn}
                        onClick={() => {
                          showToast('Telemetry diagnostics exported to clipboard.', 'info');
                        }}
                      >
                        Export Telemetry
                      </button>
                      <button
                        type="button"
                        className={s.resetBtn}
                        onClick={() => setConfirmReset(true)}
                      >
                        Reset Progress
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
