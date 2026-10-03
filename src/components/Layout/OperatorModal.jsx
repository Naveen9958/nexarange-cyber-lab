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
    themeMode,
    setTheme,
    resetProgress,
    showToast,
  } = useStore();

  const [confirmReset, setConfirmReset] = useState(false);

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
        <div className={s.header}>
          <div className={s.headerLeft}>
            <div className={s.avatar}>{operator.avatar}</div>
            <div>
              <div className={s.name} id="operator-modal-title">{operator.name}</div>
              <div className={s.callsign}>{operator.callsign} · <span className={s.clearance}>{operator.clearance}</span></div>
            </div>
          </div>
          <button
            className={s.closeBtn}
            onClick={() => {
              setOperatorModalOpen(false);
              setConfirmReset(false);
            }}
            aria-label="Close operator profile"
          >
            ✕
          </button>
        </div>

        <div className={s.body}>
          {/* Quick Metrics */}
          <div className={s.statsGrid}>
            <div className={s.statBox}>
              <div className={s.statLabel}><IconShield size={14} /> LEVEL</div>
              <div className={s.statVal}>LVL 0{level}</div>
            </div>
            <div className={s.statBox}>
              <div className={s.statLabel}><IconTarget size={14} /> GLOBAL RANK</div>
              <div className={s.statVal}>#{rank}</div>
            </div>
            <div className={s.statBox}>
              <div className={s.statLabel}><IconZap size={14} /> TOTAL XP</div>
              <div className={s.statVal}>{totalXP.toLocaleString()} XP</div>
            </div>
            <div className={s.statBox}>
              <div className={s.statLabel}><IconAward size={14} /> MISSIONS</div>
              <div className={s.statVal}>{missionsCount} / 10</div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className={s.section}>
            <div className={s.sectionTitle}>// APPEARANCE & THEME</div>
            <div
              className={s.themeRow}
              role="radiogroup"
              aria-label="Appearance Theme"
            >
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = themeMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Select ${opt.label} theme`}
                    className={`${s.themePill} ${isSelected ? s.themePillActive : ''}`}
                    onClick={() => setTheme(opt.id)}
                    tabIndex={0}
                  >
                    <Icon size={14} />
                    <span>{opt.label}</span>
                    <span className={s.radioDot}>{isSelected ? '●' : '○'}</span>
                  </button>
                );
              })}
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
              <div className={s.emptyBadges}>No badges earned yet. Complete lab operations to unlock security accolades.</div>
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

          {/* Actions & Session Reset */}
          <div className={s.actions}>
            {confirmReset ? (
              <div className={s.confirmBox}>
                <span className={s.confirmText}>Reset all simulation progress?</span>
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
              <>
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
                  Reset Session
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
