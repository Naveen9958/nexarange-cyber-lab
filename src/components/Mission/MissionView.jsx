// src/components/Mission/MissionView.jsx — Immersive Security Mission Operations
import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import LogViewer from './blocks/LogViewer';
import BurpBlock from './blocks/BurpBlock';
import TicketBlock from './blocks/TicketBlock';
import PolicyBlock from './blocks/PolicyBlock';
import AgentBuilder from './blocks/AgentBuilder';
import MarketplaceBlock from './blocks/MarketplaceBlock';
import K8sBlock from './blocks/K8sBlock';
import DeepfakeBlock from './blocks/DeepfakeBlock';
import CryptoBlock from './blocks/CryptoBlock';
import HintPanel from './HintPanel';
import {
  IconZap,
  IconArrowRight,
  IconCheckCircle,
  IconAlertCircle,
  IconShield,
  IconFlask,
  IconLock,
} from '../Common/Icons';
import s from './MissionView.module.css';

const PHASE = { BRIEFING: 'briefing', WORKSPACE: 'workspace', COMPLETE: 'complete' };

export default function MissionView() {
  const {
    currentLab,
    currentMission,
    completedMissions,
    completeMission,
    initMissionTasks,
    toggleTask,
    missionTasks,
    setView,
    setLab,
  } = useStore();

  const lab = LAB_DATA[currentLab || 1];
  const mission = lab?.missions[currentMission !== null ? currentMission : 0];

  const [phase, setPhase] = useState(PHASE.BRIEFING);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [answerOk, setAnswerOk] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Reset phase when mission changes
  useEffect(() => {
    setPhase(PHASE.BRIEFING);
    setAnswer('');
    setFeedback(null);
    setAnswerOk(false);
    setAnimKey((k) => k + 1);
  }, [mission?.id]);

  if (!mission) {
    return (
      <div className={s.emptyState}>
        <IconAlertCircle size={40} />
        <h2>NO ACTIVE MISSION SELECTED</h2>
        <p>Please select an operational lab scenario from the labs directory.</p>
        <button className={s.returnBtn} onClick={() => setView('labs')}>Go to Labs</button>
      </div>
    );
  }

  const isDone = !!completedMissions[mission.id];
  const prevEvidence = currentMission > 0 ? lab.missions[currentMission - 1].evidence_out : null;

  initMissionTasks(mission.id, mission.tasks.length);
  const tasks = missionTasks[mission.id] || [];
  const completedTasksCount = tasks.filter(Boolean).length;

  // ── Answer check ──
  function handleSubmit() {
    const clean = (v) => v.trim().toLowerCase().replace(/[\s-_]+/g, '');
    const u = clean(answer);
    const c = clean(mission.answer);
    if (u === c || u.includes(c.slice(0, 5)) || c.includes(u)) {
      setFeedback('correct');
      setAnswerOk(true);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
      }, 2500);
    }
  }

  // ── Complete mission & advance ──
  function handleComplete() {
    if (isDone) return;
    completeMission(mission.id, mission.xp, mission.badge);
    setPhase(PHASE.COMPLETE);
    const nextIdx = currentMission + 1;
    setTimeout(() => {
      if (nextIdx < lab.missions.length) {
        useStore.getState().openMission(currentLab, nextIdx);
      } else {
        useStore.getState().showDebrief(currentLab);
      }
    }, 3000);
  }

  // ── Tool block map ──
  const toolBlock = {
    log: <LogViewer lines={mission.logLines} />,
    log_terminal: <LogViewer lines={mission.logLines} termCmds={mission.terminalCmds} />,
    burp: <BurpBlock requests={mission.burpRequests} />,
    tickets: <TicketBlock tickets={mission.tickets} onSelect={(id) => setAnswer(id)} />,
    policy: <PolicyBlock policies={mission.policies} />,
    agent: <AgentBuilder patterns={mission.agentPatterns} onDeploy={() => { setAnswer('DEPLOY_ALL'); setAnswerOk(true); }} />,
    marketplace: <MarketplaceBlock listings={mission.marketplaceListings} audit={mission.clusterAudit} />,
    k8s: <K8sBlock pods={mission.pods} termCmds={mission.terminalCmds} />,
    deepfake: <DeepfakeBlock indicators={mission.videoIndicators} />,
    crypto: <CryptoBlock algorithms={mission.cryptoAlgorithms} />,
  }[mission.type];

  // ─────────────────────────────────────────────
  // PHASE 1: BRIEFING
  // ─────────────────────────────────────────────
  if (phase === PHASE.BRIEFING) {
    return (
      <div className={s.wrap} key={`briefing-${animKey}`}>
        {/* Navigation Breadcrumb Bar */}
        <div className={s.topNav}>
          <button className={s.backBtn} onClick={() => { setLab(currentLab); setView('labs'); }}>
            ← Back to Operations
          </button>
          <div className={s.navTags}>
            <span className={s.labTag}>OPERATION 0{lab.id}</span>
            <span className={s.sep}>/</span>
            <span className={s.missionNumTag}>MISSION 0{mission.num} OF 5</span>
          </div>
          <div className={s.xpTag}>
            <IconZap size={14} />
            <span>+{mission.xp} XP REWARD</span>
          </div>
        </div>

        {/* Mission Hero Header */}
        <div className={s.briefingHero}>
          <div className={s.caseMetadata}>
            <span>{lab.company}</span>
            <span className={s.dot}>•</span>
            <span>CASE: {lab.caseId}</span>
            <span className={s.dot}>•</span>
            <span>ROLE: {lab.role}</span>
          </div>
          <h1 className={s.missionTitle}>{mission.title}</h1>
          <p className={s.missionOverview}>
            Target vulnerability identification and mitigation exercise. Review intelligence files from your incident partner.
          </p>
        </div>

        {/* Previous Mission Evidence Transfer */}
        {prevEvidence && (
          <div className={s.evidenceHandoff}>
            <div className={s.handoffIcon}>📥</div>
            <div className={s.handoffContent}>
              <div className={s.handoffTitle}>INCOMING EVIDENCE HANDOFF (FROM PREVIOUS OPERATION)</div>
              <div className={s.handoffText}>
                <strong>{prevEvidence.key}:</strong> {prevEvidence.value}
              </div>
            </div>
          </div>
        )}

        {/* Lead Investigator Partner */}
        <div className={s.partnerCard}>
          <div className={s.partnerAvatar}>{mission.partner.initial}</div>
          <div className={s.partnerDetails}>
            <div className={s.partnerName}>{mission.partner.name}</div>
            <div className={s.partnerRole}>{mission.partner.role} · Incident Response Team</div>
          </div>
        </div>

        {/* Briefing Dialogue */}
        <div className={s.dialogueContainer}>
          <div className={s.dialogueHeader}>
            <span className={s.dialogueTag}>OPERATIONAL TRANSMISSION</span>
            <span className={s.encryptedBadge}>ENCRYPTED CHANNEL 256-BIT</span>
          </div>
          <blockquote className={s.dialogueText}>
            "{mission.dialogue}"
          </blockquote>
        </div>

        {/* Intelligence Evidence Cards */}
        <div className={s.intelSection}>
          <div className={s.sectionHeader}>
            <h3 className={s.sectionTitle}>EVIDENCE DOSSIER</h3>
            <span className={s.evidenceCount}>{mission.evidence.length} Indicators of Compromise</span>
          </div>
          <div className={s.evidenceGrid}>
            {mission.evidence.map((e, idx) => (
              <div key={idx} className={s.evidenceCard}>
                <div className={s.evidenceKey}>{e.key}</div>
                <div className={s.evidenceVal}>{e.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives Checklist */}
        <div className={s.objectivesSection}>
          <h3 className={s.sectionTitle}>MISSION OBJECTIVES</h3>
          <div className={s.tasksList}>
            {mission.tasks.map((task, i) => (
              <div key={i} className={s.taskRow}>
                <span className={s.taskNumber}>0{i + 1}</span>
                <span className={s.taskDesc}>{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enter Lab Workspace Button */}
        <div className={s.enterActionRow}>
          <button
            className={s.enterWorkspaceBtn}
            onClick={() => setPhase(PHASE.WORKSPACE)}
          >
            <span>ENTER INVESTIGATION WORKSPACE</span>
            <IconArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // PHASE 2: WORKSPACE (Split Layout)
  // ─────────────────────────────────────────────
  if (phase === PHASE.WORKSPACE) {
    return (
      <div className={s.wrap} key={`workspace-${animKey}`}>
        {/* Workspace Top Header */}
        <div className={s.workspaceHeader}>
          <div className={s.workspaceLeft}>
            <button className={s.backToBriefingBtn} onClick={() => setPhase(PHASE.BRIEFING)}>
              ← Review Briefing
            </button>
            <div className={s.workspaceTitleGroup}>
              <span className={s.wsLabPill}>OP 0{lab.id}</span>
              <h2 className={s.wsTitle}>{mission.title}</h2>
            </div>
          </div>

          <div className={s.workspaceRight}>
            <button className={s.hintTriggerBtn} onClick={() => setShowHint(true)}>
              💡 Intel Hints
            </button>
            <div className={s.wsXPBadge}>
              <IconZap size={14} />
              <span>+{mission.xp} XP</span>
            </div>
          </div>
        </div>

        {/* Main Workspace Split Layout */}
        <div className={s.splitLayout}>
          {/* Left Column: Briefing Recap & Checklist */}
          <aside className={s.instructionsCol}>
            {/* Quick Briefing Recap */}
            <div className={s.recapBox}>
              <span className={s.recapTag}>LEAD: {mission.partner.name}</span>
              <p className={s.recapBody}>
                {mission.dialogue.length > 200
                  ? mission.dialogue.slice(0, 200) + '...'
                  : mission.dialogue}
              </p>
            </div>

            {/* Checklist */}
            <div className={s.checklistCard}>
              <div className={s.checklistHeader}>
                <span className={s.checklistTitle}>INVESTIGATION TASKS</span>
                <span className={s.checklistProgress}>
                  {completedTasksCount}/{mission.tasks.length}
                </span>
              </div>

              <div className={s.checkItems}>
                {mission.tasks.map((t, idx) => {
                  const isChecked = !!tasks[idx];
                  return (
                    <div
                      key={idx}
                      className={`${s.checkItem} ${isChecked ? s.itemChecked : ''}`}
                      onClick={() => toggleTask(mission.id, idx)}
                    >
                      <div className={s.checkbox}>
                        {isChecked && <IconCheckCircle size={14} />}
                      </div>
                      <span className={s.checkText}>{t}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evidence summary */}
            <div className={s.evidenceSidebar}>
              <div className={s.evidenceSidebarTitle}>KNOWN IOCs</div>
              {mission.evidence.slice(0, 3).map((e, idx) => (
                <div key={idx} className={s.iocSnippet}>
                  <span className={s.iocKey}>{e.key}:</span>
                  <span className={s.iocVal}>{e.value}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Right Column: Challenge Tool Area & Answer Form */}
          <main className={s.challengeCol}>
            {/* Tool Interactive Block */}
            <div className={s.toolContainer}>
              {toolBlock}
            </div>

            {/* Submission Section */}
            {!isDone ? (
              <div className={s.submissionBox}>
                <div className={s.submitHeader}>
                  <span className={s.submitTag}>VERIFICATION GATE</span>
                  <h4 className={s.submitQuestion}>{mission.question}</h4>
                </div>

                <div className={s.inputRow}>
                  <input
                    className={`${s.answerInput} ${feedback === 'correct' ? s.inputCorrect : ''} ${feedback === 'wrong' ? s.inputWrong : ''}`}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Enter identified indicator or command..."
                    autoFocus
                  />
                  <button className={s.verifyBtn} onClick={handleSubmit}>
                    VERIFY FINDING
                  </button>
                </div>

                {feedback === 'correct' && (
                  <div className={s.feedbackSuccess}>
                    <IconCheckCircle size={16} />
                    <span>CORRECT! Threat indicator confirmed. Click "Complete Mission" below to log finding.</span>
                  </div>
                )}

                {feedback === 'wrong' && (
                  <div className={s.feedbackError}>
                    <IconAlertCircle size={16} />
                    <span>Incorrect indicator. Re-examine the parameters in the investigation tool above.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className={s.alreadyCompletedBox}>
                <IconCheckCircle size={20} />
                <span>MISSION SECURED — {mission.xp} XP credited to operator dossier.</span>
              </div>
            )}

            {/* Complete Mission & Advance Button */}
            <div className={s.completeActionWrap}>
              <button
                className={s.completeFinalBtn}
                disabled={isDone || !answerOk}
                onClick={handleComplete}
              >
                <span>{isDone ? 'OPERATION ARCHIVED' : 'COMPLETE MISSION & ADVANCE'}</span>
                <IconArrowRight size={18} />
              </button>
            </div>
          </main>
        </div>

        {/* Hint Modal */}
        {showHint && (
          <HintPanel
            hints={mission.hints}
            missionId={mission.id}
            onClose={() => setShowHint(false)}
          />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // PHASE 3: COMPLETE CELEBRATION
  // ─────────────────────────────────────────────
  return (
    <div className={s.completeScreen}>
      <div className={s.completeCard}>
        <div className={s.awardIconWrap}>
          <IconCheckCircle size={56} />
        </div>

        <span className={s.completePill}>OPERATION SUCCEEDED</span>
        <h2 className={s.completeTitle}>{mission.title}</h2>
        <p className={s.completeSub}>
          Threat vector neutralized and forensic trace added to incident debrief report.
        </p>

        <div className={s.completeXPBox}>
          <IconZap size={22} />
          <span>+{mission.xp} XP AWARDED</span>
        </div>

        <div className={s.badgeUnlockedRow}>
          <div className={s.badgeUnlockedEmoji}>{mission.badge.emoji}</div>
          <div>
            <div className={s.badgeUnlockedLabel}>ACCREDITATION BADGE UNLOCKED</div>
            <div className={s.badgeUnlockedName}>{mission.badge.name}</div>
          </div>
        </div>

        <div className={s.advancingText}>
          <span className={s.advanceSpinner} />
          <span>Synchronizing telemetry & loading next operation...</span>
        </div>
      </div>
    </div>
  );
}
