// src/components/Labs/LabsView.jsx — Premium Cybersecurity Operations Hub
import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import {
  IconZap,
  IconLock,
  IconCheckCircle,
  IconArrowRight,
  IconSearch,
} from '../Common/Icons';
import s from './LabsView.module.css';

export default function LabsView() {
  const { openMission, completedMissions } = useStore();
  const [trackFilter, setTrackFilter] = useState('all'); // 'all' | 'ai' | 'cloud'
  const [search, setSearch] = useState('');

  const labList = [LAB_DATA[1], LAB_DATA[2]].filter(Boolean);

  const filteredLabs = labList.filter((lab) => {
    if (trackFilter === 'ai' && lab.id !== 1) return false;
    if (trackFilter === 'cloud' && lab.id !== 2) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchLab = lab.title.toLowerCase().includes(q) || lab.subtitle.toLowerCase().includes(q) || lab.company.toLowerCase().includes(q);
      const matchMission = lab.missions.some((m) => m.title.toLowerCase().includes(q) || m.question.toLowerCase().includes(q));
      return matchLab || matchMission;
    }
    return true;
  });

  return (
    <div className={s.wrap}>
      {/* ── Header Filter Bar ── */}
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>SECURITY SIMULATION LABS</h1>
          <p className={s.pageDesc}>
            Realistic multi-stage incident scenarios. Progressively decrypt, investigate, and neutralize threat vectors.
          </p>
        </div>

        <div className={s.filterRow}>
          {/* Track Filter Tabs */}
          <div className={s.trackTabs}>
            <button
              className={`${s.tabBtn} ${trackFilter === 'all' ? s.tabActive : ''}`}
              onClick={() => setTrackFilter('all')}
            >
              All Tracks ({labList.length})
            </button>
            <button
              className={`${s.tabBtn} ${trackFilter === 'ai' ? s.tabActive : ''}`}
              onClick={() => setTrackFilter('ai')}
            >
              AI Security (1)
            </button>
            <button
              className={`${s.tabBtn} ${trackFilter === 'cloud' ? s.tabActive : ''}`}
              onClick={() => setTrackFilter('cloud')}
            >
              Cloud Infrastructure (1)
            </button>
          </div>

          {/* Search Input */}
          <div className={s.searchWrap}>
            <IconSearch size={16} className={s.searchIcon} />
            <input
              className={s.searchInput}
              placeholder="Filter missions or vectors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Labs List ── */}
      <div className={s.labsContainer}>
        {filteredLabs.map((lab) => {
          const completedInLab = lab.missions.filter((m) => completedMissions[m.id]).length;
          const progressPct = Math.round((completedInLab / lab.missions.length) * 100);

          return (
            <div key={lab.id} className={s.labCard}>
              {/* Lab Banner Header */}
              <div className={s.labHeader}>
                <div className={s.labMetaGroup}>
                  <div className={s.labPillRow}>
                    <span className={s.labIdBadge}>OPERATION 0{lab.id}</span>
                    <span className={s.labTrackBadge}>{lab.subtitle.toUpperCase()}</span>
                    <span className={s.labDifficultyBadge}>
                      {`DIFFICULTY: ${lab.difficulty ? lab.difficulty.toUpperCase() : 'MEDIUM TO ADVANCED'}`}
                    </span>
                  </div>

                  <h2 className={s.labTitle}>{lab.title}</h2>
                  <div className={s.labCaseInfo}>
                    <span>Target Enclave: <strong>{lab.company}</strong></span>
                    <span className={s.dotSep}>•</span>
                    <span>Case Reference: <strong>{lab.caseId}</strong></span>
                    <span className={s.dotSep}>•</span>
                    <span>Investigator Role: <strong>{lab.role}</strong></span>
                  </div>
                </div>

                <div className={s.labHeaderRight}>
                  <div className={s.xpCounter}>
                    <IconZap size={16} />
                    <span>+{lab.totalXP} XP</span>
                  </div>
                  <div className={s.progressSummary}>
                    <div className={s.progressText}>
                      <span>{completedInLab} / {lab.missions.length} Missions</span>
                      <span>{progressPct}% Complete</span>
                    </div>
                    <div className={s.progressBar}>
                      <div className={s.progressFill} style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lab Chain Description */}
              <div className={s.labDescBox}>
                <p className={s.labDescription}>
                  {lab.id === 1
                    ? 'An autonomous threat agent breached NexaCorp core infrastructure. Trace token validation flaws, examine Burp Suite traffic to rogue MCP servers, isolate prompt injections, and fix zero-trust access.'
                    : 'A synthesized deepfake executive call triggered a high-value wire compromise. Unpack poisoned Python ML packages, audit rogue Kubernetes pods, and migrate quantum-vulnerable cryptography.'}
                </p>
              </div>

              {/* Missions Progression Chain */}
              <div className={s.chainHeader}>
                <span className={s.chainTitle}>MISSION OPERATION CHAIN</span>
                <span className={s.chainSub}>Execute sequentially to assemble digital evidence</span>
              </div>

              <div className={s.missionChain}>
                {lab.missions.map((m, i) => {
                  const done = !!completedMissions[m.id];
                  const prevDone = i === 0 || !!completedMissions[lab.missions[i - 1].id];
                  const locked = !prevDone;

                  return (
                    <div
                      key={m.id}
                      className={`${s.missionRow} ${done ? s.rowDone : ''} ${locked ? s.rowLocked : s.rowActive}`}
                      onClick={() => !locked && openMission(lab.id, i)}
                    >
                      {/* Step Indicator */}
                      <div className={s.missionStep}>
                        {done ? (
                          <div className={s.stepDone}><IconCheckCircle size={18} /></div>
                        ) : locked ? (
                          <div className={s.stepLocked}><IconLock size={16} /></div>
                        ) : (
                          <div className={s.stepActive}>0{m.num}</div>
                        )}
                      </div>

                      {/* Mission Info */}
                      <div className={s.missionInfo}>
                        <div className={s.missionTitleRow}>
                          <h4 className={s.missionTitle}>{m.title}</h4>
                          <span className={s.missionXP}>+{m.xp} XP</span>
                        </div>

                        <div className={s.missionMetaRow}>
                          <span className={s.partnerBadge}>
                            Lead: {m.partner.name} ({m.partner.role})
                          </span>
                          <span className={s.badgeReward}>
                            Reward: {m.badge.emoji} {m.badge.name}
                          </span>
                        </div>

                        {locked && (
                          <div className={s.lockedReason}>
                            <IconLock size={12} /> Complete Mission 0{lab.missions[i - 1].num} ({lab.missions[i - 1].title}) to unlock
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className={s.missionAction}>
                        {done ? (
                          <button
                            className={s.reviewBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              openMission(lab.id, i);
                            }}
                          >
                            <span>REVIEW</span>
                            <IconArrowRight size={14} />
                          </button>
                        ) : locked ? (
                          <span className={s.lockedPill}>LOCKED</span>
                        ) : (
                          <button
                            className={s.enterBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              openMission(lab.id, i);
                            }}
                          >
                            <span>ENTER LAB</span>
                            <IconArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
