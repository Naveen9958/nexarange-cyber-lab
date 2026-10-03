// src/components/Layout/OperatorModal.jsx
import React from 'react';
import useStore from '../../store/useStore';
import { IconShield, IconAward, IconZap, IconTarget, IconSettings } from '../Common/Icons';
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
    resetProgress,
    showToast,
  } = useStore();

  if (!operatorModalOpen) return null;

  const rank = getRank();
  const level = getLevel();
  const missionsCount = Object.keys(completedMissions).length;

  return (
    <div className={s.backdrop} onClick={() => setOperatorModalOpen(false)}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <div className={s.headerLeft}>
            <div className={s.avatar}>{operator.avatar}</div>
            <div>
              <div className={s.name}>{operator.name}</div>
              <div className={s.callsign}>{operator.callsign} · <span className={s.clearance}>{operator.clearance}</span></div>
            </div>
          </div>
          <button className={s.closeBtn} onClick={() => setOperatorModalOpen(false)} aria-label="Close profile">✕</button>
        </div>

        <div className={s.body}>
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

          <div className={s.section}>
            <div className={s.sectionTitle}>// ACTIVE CLEARANCE & TRACKS</div>
            <div className={s.badgePills}>
              <span className={s.pill}>AI Threat Intelligence</span>
              <span className={s.pill}>Autonomous Agent Auditing</span>
              <span className={s.pill}>Zero-Trust Architecture</span>
              <span className={s.pill}>Cloud Penetration</span>
            </div>
          </div>

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

          <div className={s.actions}>
            <button
              className={s.actionBtn}
              onClick={() => {
                showToast('Telemetry diagnostics exported to console.', 'info');
              }}
            >
              Export Telemetry
            </button>
            <button
              className={s.resetBtn}
              onClick={() => {
                if (window.confirm('Reset all lab simulation progress?')) {
                  resetProgress();
                }
              }}
            >
              Reset Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
