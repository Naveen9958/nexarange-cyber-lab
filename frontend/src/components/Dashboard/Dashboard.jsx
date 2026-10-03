// src/components/Dashboard/Dashboard.jsx — Polished Command Center HQ
import React from 'react';
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import {
  IconZap,
  IconTarget,
  IconAward,
  IconGlobe,
  IconArrowRight,
  IconShield,
  IconFlask,
} from '../Common/Icons';
import s from './Dashboard.module.css';

export default function Dashboard() {
  const {
    totalXP,
    sessionXP,
    badges,
    completedMissions,
    openMission,
    setView,
    setLab,
    getRank,
  } = useStore();

  const allLabs = [LAB_DATA[1], LAB_DATA[2], LAB_DATA[3], LAB_DATA[4], LAB_DATA[5]].filter(Boolean);
  const totalMissionsCount = allLabs.reduce((sum, l) => sum + l.missions.length, 0);
  const completedCount = Object.keys(completedMissions).length;
  const completionPct = Math.round((completedCount / totalMissionsCount) * 100);
  const currentRank = getRank();

  function handleContinue() {
    for (const lab of allLabs) {
      const idx = lab.missions.findIndex((m) => !completedMissions[m.id]);
      if (idx !== -1) {
        openMission(lab.id, idx);
        return;
      }
    }
    openMission(1, 0);
  }

  function handleLaunchLab(labId) {
    const lab = LAB_DATA[labId];
    if (!lab) return;
    const idx = lab.missions.findIndex((m) => !completedMissions[m.id]);
    openMission(labId, idx === -1 ? 0 : idx);
  }

  return (
    <div className={s.dashboard}>
      {/* ── Command Center Hero ── */}
      <section className={s.hero}>
        <div className={s.heroGlow} />
        <div className={s.heroContent}>
          <div className={s.heroTag}>
            <span className={s.tagDot} />
            <span>ENTERPRISE CYBER DEFENSE INITIATIVE</span>
          </div>

          <h1 className={s.heroTitle}>
            NEXARANGE <span className={s.heroAccent}>COMMAND CENTER</span>
          </h1>

          <p className={s.heroSubtitle}>
            Build offensive and defensive security skills through realistic AI-powered mission simulations, real-world CVE telemetry, and live agent mitigation protocols.
          </p>

          <div className={s.heroActions}>
            <button className={s.primaryBtn} onClick={handleContinue}>
              <IconZap size={16} />
              <span>CONTINUE MISSION</span>
            </button>
            <button className={s.secondaryBtn} onClick={() => setView('labs')}>
              <IconFlask size={16} />
              <span>VIEW ALL LABS</span>
            </button>
          </div>
        </div>

        {/* Hero Telemetry Status Strip */}
        <div className={s.heroTelemetry}>
          <div className={s.telemetryItem}>
            <span className={s.telemLabel}>ACTIVE OPERATORS</span>
            <span className={s.telemVal}>1,248 GLOBAL</span>
          </div>
          <div className={s.telemetryDivider} />
          <div className={s.telemetryItem}>
            <span className={s.telemLabel}>ACTIVE THREAT CHAIN</span>
            <span className={s.telemVal}>AGENT IDENTITY TAMPER</span>
          </div>
          <div className={s.telemetryDivider} />
          <div className={s.telemetryItem}>
            <span className={s.telemLabel}>SECURITY POSTURE</span>
            <span className={s.telemValSec}>DEFCON 4 · GUARDED</span>
          </div>
        </div>
      </section>

      {/* ── 4 Refined Stat Cards (Zero Text Clipping) ── */}
      <div className={s.statsGrid}>
        {/* TOTAL XP */}
        <div className={s.statCard}>
          <div className={s.statHeader}>
            <span className={s.statLabel}>TOTAL XP</span>
            <div className={`${s.statIconWrap} ${s.iconCyan}`}>
              <IconZap size={18} />
            </div>
          </div>
          <div className={s.statValue}>{totalXP.toLocaleString()} <span className={s.statUnit}>XP</span></div>
          <div className={s.statFooter}>
            <div className={s.statProgressBar}>
              <div
                className={s.statProgressFill}
                style={{ width: `${Math.min((totalXP / 2000) * 100, 100)}%`, background: 'var(--cyan-primary)' }}
              />
            </div>
            <span className={s.statFootnote}>+{sessionXP} earned this session</span>
          </div>
        </div>

        {/* MISSIONS COMPLETE */}
        <div className={s.statCard}>
          <div className={s.statHeader}>
            <span className={s.statLabel}>MISSIONS COMPLETED</span>
            <div className={`${s.statIconWrap} ${s.iconGreen}`}>
              <IconTarget size={18} />
            </div>
          </div>
          <div className={s.statValue}>{completedCount} <span className={s.statUnit}>/ {totalMissionsCount}</span></div>
          <div className={s.statFooter}>
            <div className={s.statProgressBar}>
              <div
                className={s.statProgressFill}
                style={{ width: `${(completedCount / totalMissionsCount) * 100}%`, background: 'var(--status-success)' }}
              />
            </div>
            <span className={s.statFootnote}>{totalMissionsCount - completedCount} operational targets pending</span>
          </div>
        </div>

        {/* CURRENT RANK */}
        <div className={s.statCard}>
          <div className={s.statHeader}>
            <span className={s.statLabel}>CURRENT RANK</span>
            <div className={`${s.statIconWrap} ${s.iconPurple}`}>
              <IconGlobe size={18} />
            </div>
          </div>
          <div className={s.statValue}>#{currentRank}</div>
          <div className={s.statFooter}>
            <div className={s.statProgressBar}>
              <div className={s.statProgressFill} style={{ width: '68%', background: 'var(--accent-purple)' }} />
            </div>
            <span className={s.statFootnote}>Next Milestone: #180 at 500 XP</span>
          </div>
        </div>

        {/* COMPLETION RATE */}
        <div className={s.statCard}>
          <div className={s.statHeader}>
            <span className={s.statLabel}>TOTAL COMPLETION</span>
            <div className={`${s.statIconWrap} ${s.iconWarning}`}>
              <IconAward size={18} />
            </div>
          </div>
          <div className={s.statValue}>{completionPct}<span className={s.statUnit}>%</span></div>
          <div className={s.statFooter}>
            <div className={s.statProgressBar}>
              <div
                className={s.statProgressFill}
                style={{ width: `${completionPct}%`, background: 'var(--status-warning)' }}
              />
            </div>
            <span className={s.statFootnote}>
              {completionPct === 0 ? 'Start your first mission' : `${badges.length} badges in vault`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Active Operations Lab Cards ── */}
      <div className={s.sectionHeader}>
        <div className={s.sectionHeaderLeft}>
          <h2 className={s.sectionTitle}>ACTIVE SIMULATION LABS</h2>
          <span className={s.sectionDesc}>Select an enterprise scenario to deploy investigation tools</span>
        </div>
        <button className={s.sectionLink} onClick={() => setView('labs')}>
          <span>All {allLabs.length} Operations</span>
          <IconArrowRight size={14} />
        </button>
      </div>

      <div className={s.labsGrid}>
        {allLabs.map((lab) => {
          const done = lab.missions.filter((m) => completedMissions[m.id]).length;
          return (
            <LabCard
              key={lab.id}
              lab={lab}
              completedMissionsCount={done}
              onLaunch={() => handleLaunchLab(lab.id)}
              onDetails={() => { setLab(lab.id); setView('labs'); }}
            />
          );
        })}
      </div>

      {/* ── Intelligence Feed & Accolades Row ── */}
      <div className={s.bottomRow}>
        {/* Recent Intelligence Telemetry */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <div className={s.panelTitleGroup}>
              <span className={s.panelTag}>LIVE SOC FEED</span>
              <h3 className={s.panelTitle}>RECENT INTELLIGENCE</h3>
            </div>
            <span className={s.panelDot} />
          </div>

          <div className={s.intelList}>
            {[
              { time: '14:07:31', tag: 'ADVISORY', color: 'cyan', msg: 'Zero-day token bypass pattern observed in auth-validator v2.1.3' },
              { time: '13:55:12', tag: 'SYNC', color: 'green', msg: 'Global leaderboard synced — 1,248 operators evaluated' },
              { time: '13:42:05', tag: 'INTEL', color: 'purple', msg: 'Forensic memory dump extracted from compromised renderer pod' },
              { time: '13:30:00', tag: 'ALERT', color: 'warning', msg: 'Unauthorized MCP connector invocation registered: conn_012' },
            ].map((item, idx) => (
              <div key={idx} className={s.intelItem}>
                <span className={s.intelTime}>{item.time}</span>
                <span className={`${s.intelTag} ${s['tag_' + item.color]}`}>{item.tag}</span>
                <span className={s.intelMsg}>{item.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges / Accolades Preview */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <div className={s.panelTitleGroup}>
              <span className={s.panelTag}>OPERATOR ACCOLADES</span>
              <h3 className={s.panelTitle}>EARNED BADGES</h3>
            </div>
            <button className={s.panelAction} onClick={() => setView('certificates')}>
              Vault ({badges.length})
            </button>
          </div>

          {badges.length === 0 ? (
            <div className={s.emptyBadges}>
              <div className={s.emptyIcon}><IconShield size={32} /></div>
              <div className={s.emptyTitle}>NO BADGES UNLOCKED YET</div>
              <p className={s.emptyText}>Complete individual mission challenges to earn cryptographic qualification badges and credentials.</p>
              <button className={s.emptyBtn} onClick={handleContinue}>Start Lab 01</button>
            </div>
          ) : (
            <div className={s.badgeGrid}>
              {badges.map((b, i) => (
                <div key={i} className={s.badgeCard} title={b.name}>
                  <div className={s.badgeEmoji}>{b.emoji}</div>
                  <div className={s.badgeName}>{b.name}</div>
                  <span className={s.badgeSecured}>SECURED</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LabCard({ lab, completedMissionsCount, onLaunch, onDetails }) {
  const isComplete = completedMissionsCount === lab.missions.length;
  const progressPct = Math.round((completedMissionsCount / lab.missions.length) * 100);

  return (
    <div className={s.labCard} onClick={onDetails}>
      <div className={s.labCardInner}>
        {/* Top Tag Row */}
        <div className={s.labTopRow}>
          <div className={s.labTags}>
            <span className={s.labTrackTag}>{lab.subtitle.toUpperCase()}</span>
            <span className={s.labCaseId}>{lab.caseId}</span>
          </div>
          <span className={s.labStatusTag}>
            <span className={s.statusPulse} />
            {isComplete ? 'COMPLETED' : 'OPERATIONAL'}
          </span>
        </div>

        {/* Lab Identification */}
        <div className={s.labIdentity}>
          <span className={s.labNumber}>OPERATION 0{lab.id}</span>
          <h3 className={s.labTitle}>{lab.title}</h3>
          <div className={s.labTarget}>
            <span>Target: <strong>{lab.company}</strong></span>
            <span className={s.targetDot}>•</span>
            <span>Role: <strong>{lab.role}</strong></span>
          </div>
        </div>

        {/* Narrative Description */}
        <p className={s.labSummary}>
          {lab.id === 1
            ? 'An advanced persistent agent threat has infiltrated autonomous infrastructure. Investigate auth bypasses, MCP connectors, and prompt injections.'
            : 'A deepfake executive audio call initiated a $47M unauthorized transaction. Trace supply chain poisonings, rogue k8s pods, and quantum-vulnerable cryptography.'
          }
        </p>

        {/* Footer Metrics */}
        <div className={s.labFooter}>
          <div className={s.labProgWrap}>
            <div className={s.labProgLabelRow}>
              <span>PROGRESS</span>
              <span className={s.labProgCount}>{completedMissionsCount} of {lab.missions.length} Missions ({progressPct}%)</span>
            </div>
            <div className={s.labProgressBar}>
              <div className={s.labProgressFill} style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className={s.labXPBadge}>
            <IconZap size={14} />
            <span>+{lab.totalXP} XP</span>
          </div>
        </div>

        {/* Action Button */}
        <div className={s.labActions}>
          <button
            className={s.labLaunchBtn}
            onClick={(e) => {
              e.stopPropagation();
              onLaunch();
            }}
          >
            {isComplete ? 'REVIEW OPERATION' : completedMissionsCount > 0 ? 'CONTINUE MISSION' : 'LAUNCH OPERATION'}
            <IconArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
