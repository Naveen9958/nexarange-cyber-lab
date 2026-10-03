// src/components/Analytics/AnalyticsView.jsx — Performance & Telemetry Analytics
import React, { useMemo } from 'react';
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import {
  IconBarChart,
  IconShield,
  IconZap,
  IconTarget,
  IconAward,
  IconCheckCircle,
} from '../Common/Icons';
import s from './AnalyticsView.module.css';

const SKILL_CATEGORIES = [
  { name: 'AI Security', key: 'ai', missionIds: ['m1_1', 'm1_2', 'm1_3', 'm3_1', 'm3_2', 'm3_4'] },
  { name: 'Cloud Infra', key: 'cloud', missionIds: ['m2_1', 'm2_2', 'm4_3', 'm5_4'] },
  { name: 'Forensics', key: 'forensics', missionIds: ['m1_1', 'm2_4', 'm4_1', 'm4_4'] },
  { name: 'Cryptography', key: 'crypto', missionIds: ['m2_5', 'm4_5', 'm5_2'] },
  { name: 'AppSec & APIs', key: 'network', missionIds: ['m1_2', 'm1_4', 'm3_3', 'm5_1', 'm5_3'] },
  { name: 'Kubernetes', key: 'k8s', missionIds: ['m2_3', 'm4_3'] },
];

export default function AnalyticsView() {
  const { completedMissions, totalXP, badges, getRank } = useStore();
  const completedCount = Object.keys(completedMissions).length;
  const rank = getRank();

  // ── Calculate Skill Radar Values ──
  const skillValues = useMemo(() => {
    return SKILL_CATEGORIES.map((cat) => {
      const doneInCat = cat.missionIds.filter((id) => completedMissions[id]).length;
      const basePct = completedCount === 0 ? 0.15 : 0.15 + (doneInCat / cat.missionIds.length) * 0.75;
      return {
        ...cat,
        val: Math.min(basePct, 0.95),
        displayPct: Math.round(basePct * 100),
      };
    });
  }, [completedMissions, completedCount]);

  // ── Calculate XP Progression Points ──
  const xpProgression = useMemo(() => {
    const allMissions = Object.values(LAB_DATA).flatMap((lab) => lab.missions);
    let accum = 0;
    const points = [{ label: 'Baseline', xp: 0 }];

    allMissions.forEach((m) => {
      if (completedMissions[m.id]) {
        accum += m.xp;
        points.push({ label: `M0${m.num}`, xp: accum });
      }
    });

    return points;
  }, [completedMissions]);

  // SVG Chart Geometry
  const chartW = 600;
  const chartH = 220;
  const pad = { top: 20, right: 30, bottom: 40, left: 55 };
  const graphW = chartW - pad.left - pad.right;
  const graphH = chartH - pad.top - pad.bottom;
  const maxScaleXP = Math.max(5000, totalXP + 300);

  // Radar Polygon Points calculation
  const radarCx = 150;
  const radarCy = 140;
  const radarRadius = 90;

  const radarPoints = skillValues.map((cat, i) => {
    const angle = (i * 2 * Math.PI) / skillValues.length - Math.PI / 2;
    const r = radarRadius * cat.val;
    return {
      x: radarCx + r * Math.cos(angle),
      y: radarCy + r * Math.sin(angle),
      labelX: radarCx + (radarRadius + 22) * Math.cos(angle),
      labelY: radarCy + (radarRadius + 22) * Math.sin(angle),
      name: cat.name,
      pct: cat.displayPct,
    };
  });

  const radarPolygonPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';

  return (
    <div className={s.wrap}>
      {/* ── Page Header ── */}
      <div className={s.header}>
        <div>
          <h1 className={s.title}>OPERATIONAL TELEMETRY & ANALYTICS</h1>
          <p className={s.subtitle}>
            Performance telemetry, multi-vector skill matrix assessment, and incident mitigation curve.
          </p>
        </div>
      </div>

      {/* ── Top Charts Row ── */}
      <div className={s.topChartsGrid}>
        {/* Skill Matrix Radar */}
        <div className={s.chartCard}>
          <div className={s.cardHeader}>
            <div>
              <span className={s.cardTag}>ASSESSMENT MATRIX</span>
              <h3 className={s.cardTitle}>SPECIALIZATION RADAR</h3>
            </div>
            <span className={s.pill}>6 VECTORS</span>
          </div>

          <div className={s.radarContainer}>
            <svg viewBox="0 0 300 280" className={s.radarSvg}>
              {/* Concentric Grid Rings */}
              {[0.25, 0.5, 0.75, 1].map((lvl) => (
                <circle
                  key={lvl}
                  cx={radarCx}
                  cy={radarCy}
                  r={radarRadius * lvl}
                  fill="none"
                  stroke="rgba(0, 240, 210, 0.12)"
                  strokeDasharray={lvl === 1 ? 'none' : '3 3'}
                />
              ))}

              {/* Spokes */}
              {skillValues.map((_, i) => {
                const angle = (i * 2 * Math.PI) / skillValues.length - Math.PI / 2;
                const x = radarCx + radarRadius * Math.cos(angle);
                const y = radarCy + radarRadius * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={radarCx}
                    y1={radarCy}
                    x2={x}
                    y2={y}
                    stroke="rgba(0, 240, 210, 0.15)"
                  />
                );
              })}

              {/* Polygon Area */}
              <path
                d={radarPolygonPath}
                fill="rgba(0, 245, 200, 0.18)"
                stroke="var(--cyan-primary)"
                strokeWidth="2"
              />

              {/* Data Dots & Labels */}
              {radarPoints.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="var(--cyan-primary)" />
                  <text
                    x={pt.labelX}
                    y={pt.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={s.radarLabel}
                  >
                    {pt.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* XP Progression Timeline Chart */}
        <div className={s.chartCard} style={{ flex: 1.4 }}>
          <div className={s.cardHeader}>
            <div>
              <span className={s.cardTag}>TELEMETRY TIMELINE</span>
              <h3 className={s.cardTitle}>XP PROGRESSION CURVE</h3>
            </div>
            <div className={s.xpCounterTag}>
              <IconZap size={14} />
              <span>{totalXP.toLocaleString()} TOTAL XP</span>
            </div>
          </div>

          <div className={s.lineChartContainer}>
            {completedCount === 0 ? (
              <div className={s.chartEmptyOverlay}>
                <div className={s.emptyNotice}>
                  <IconTarget size={28} />
                  <div className={s.emptyNoticeTitle}>NO MISSION DATA RECORDED YET</div>
                  <p className={s.emptyNoticeText}>
                    Complete your first operation in Lab 01 to start plotting your skill calibration curve.
                  </p>
                </div>
              </div>
            ) : null}

            <svg viewBox={`0 0 ${chartW} ${chartH}`} className={s.lineSvg}>
              {/* Horizontal Grid Lines & Y-Labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = pad.top + graphH * (1 - pct);
                const xpVal = Math.round(maxScaleXP * pct);
                return (
                  <g key={pct}>
                    <line
                      x1={pad.left}
                      y1={y}
                      x2={chartW - pad.right}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.06)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={pad.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      className={s.axisLabel}
                    >
                      {xpVal}
                    </text>
                  </g>
                );
              })}

              {/* Data Path */}
              {xpProgression.length > 1 && (
                <>
                  {/* Area gradient fill */}
                  <defs>
                    <linearGradient id="xpAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--cyan-primary)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--cyan-primary)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path
                    d={`
                      M ${pad.left},${pad.top + graphH}
                      ${xpProgression
                        .map((pt, i) => {
                          const x = pad.left + (graphW / (xpProgression.length - 1)) * i;
                          const y = pad.top + graphH * (1 - pt.xp / maxScaleXP);
                          return `L ${x},${y}`;
                        })
                        .join(' ')}
                      L ${pad.left + graphW},${pad.top + graphH} Z
                    `}
                    fill="url(#xpAreaGrad)"
                  />

                  {/* Stroke Line */}
                  <path
                    d={xpProgression
                      .map((pt, i) => {
                        const x = pad.left + (graphW / (xpProgression.length - 1)) * i;
                        const y = pad.top + graphH * (1 - pt.xp / maxScaleXP);
                        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="var(--cyan-primary)"
                    strokeWidth="2.5"
                  />

                  {/* Points */}
                  {xpProgression.map((pt, i) => {
                    const x = pad.left + (graphW / (xpProgression.length - 1)) * i;
                    const y = pad.top + graphH * (1 - pt.xp / maxScaleXP);
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="4" fill="var(--cyan-primary)" />
                        <text
                          x={x}
                          y={chartH - 12}
                          textAnchor="middle"
                          className={s.axisLabel}
                        >
                          {pt.label}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* ── Bottom Breakdown Metrics ── */}
      <div className={s.bottomCardsGrid}>
        {/* Strengths */}
        <div className={s.breakdownCard}>
          <div className={s.cardHeader}>
            <h4 className={s.cardTitle}>PRIMARY STRENGTHS</h4>
            <span className={s.strengthTag}>VERIFIED</span>
          </div>

          <div className={s.metricBars}>
            {[
              { skill: 'AI Threat Analysis', pct: completedCount > 0 ? 88 : 45, color: 'var(--cyan-primary)' },
              { skill: 'Supply Chain Security', pct: completedCount > 1 ? 76 : 38, color: 'var(--cyan-primary)' },
              { skill: 'Forensic Triage', pct: completedCount > 2 ? 72 : 32, color: 'var(--cyan-primary)' },
            ].map((m) => (
              <div key={m.skill} className={s.metricItem}>
                <div className={s.metricRow}>
                  <span className={s.metricName}>{m.skill}</span>
                  <span className={s.metricPercent}>{m.pct}%</span>
                </div>
                <div className={s.barTrack}>
                  <div className={s.barFill} style={{ width: `${m.pct}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className={s.breakdownCard}>
          <div className={s.cardHeader}>
            <h4 className={s.cardTitle}>AREAS FOR IMPROVEMENT</h4>
            <span className={s.improveTag}>TARGETS</span>
          </div>

          <div className={s.metricBars}>
            {[
              { skill: 'Kubernetes Hardening', pct: 42, color: 'var(--status-warning)' },
              { skill: 'Post-Quantum Cryptography', pct: 36, color: 'var(--status-warning)' },
              { skill: 'Zero Trust Microsegmentation', pct: 30, color: 'var(--status-warning)' },
            ].map((m) => (
              <div key={m.skill} className={s.metricItem}>
                <div className={s.metricRow}>
                  <span className={s.metricName}>{m.skill}</span>
                  <span className={s.metricPercent}>{m.pct}%</span>
                </div>
                <div className={s.barTrack}>
                  <div className={s.barFill} style={{ width: `${m.pct}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Telemetry KPIs */}
        <div className={s.breakdownCard}>
          <div className={s.cardHeader}>
            <h4 className={s.cardTitle}>SESSION TELEMETRY</h4>
            <span className={s.liveTag}>LIVE</span>
          </div>

          <div className={s.kpiRows}>
            <div className={s.kpiRow}>
              <span className={s.kpiKey}>Missions Completed</span>
              <span className={s.kpiVal}>{completedCount} / {Object.values(LAB_DATA).reduce((sum, l) => sum + l.missions.length, 0)}</span>
            </div>
            <div className={s.kpiRow}>
              <span className={s.kpiKey}>Global Ranking</span>
              <span className={s.kpiVal}>#{rank}</span>
            </div>
            <div className={s.kpiRow}>
              <span className={s.kpiKey}>Accreditation Badges</span>
              <span className={s.kpiVal}>{badges.length}</span>
            </div>
            <div className={s.kpiRow}>
              <span className={s.kpiKey}>Enclave Readiness</span>
              <span className={s.kpiVal} style={{ color: 'var(--status-success)' }}>100% OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
