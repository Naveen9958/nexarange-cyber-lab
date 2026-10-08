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
    resetMissionTasks,
    setView,
    setLab,
    missionReplayMode,
    setMissionReplayMode,
  } = useStore();

  const labId = currentLab || 1;
  const lab = LAB_DATA[labId] || LAB_DATA[1];
  const missionIdx = typeof currentMission === 'number' && lab?.missions?.[currentMission] ? currentMission : 0;
  const mission = lab?.missions?.[missionIdx] || lab?.missions?.[0];

  const [phase, setPhase] = useState(PHASE.BRIEFING);
  const [replayMode, setReplayMode] = useState(Boolean(missionReplayMode));
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [answerOk, setAnswerOk] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Reset phase when mission changes or replayMode is toggled
  useEffect(() => {
    setPhase(PHASE.BRIEFING);
    setAnswer('');
    setFeedback(null);
    setAnswerOk(false);
    setAnimKey((k) => k + 1);
    setReplayMode(Boolean(missionReplayMode));
  }, [mission?.id, missionReplayMode]);

  useEffect(() => {
    if (mission?.id && mission?.tasks?.length) {
      initMissionTasks(mission.id, mission.tasks.length);
    }
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
  const isArchived = isDone && !replayMode;
  const prevEvidence = missionIdx > 0 && lab?.missions?.[missionIdx - 1]
    ? lab.missions[missionIdx - 1].evidence_out
    : null;

  const tasks = (mission?.id && missionTasks[mission.id]) || (mission?.tasks ? Array(mission.tasks.length).fill(false) : []);
  const completedTasksCount = tasks.filter(Boolean).length;

  function triggerReplay() {
    setReplayMode(true);
    setMissionReplayMode(true);
    if (resetMissionTasks && mission?.tasks?.length) {
      resetMissionTasks(mission.id, mission.tasks.length);
    }
    setAnswer('');
    setFeedback(null);
    setAnswerOk(false);
  }

  // ── Answer check (Strict & precise validation with alias support) ──
  function handleSubmit() {
    const clean = (v) => (v || '').toString().trim().toLowerCase().replace(/[\s-_]+/g, '');
    const u = clean(answer);
    const c = clean(mission.answer);

    const validAnswers = [c];
    if (mission.aliases && Array.isArray(mission.aliases)) {
      mission.aliases.forEach((a) => validAnswers.push(clean(a)));
    }

    if (u && validAnswers.includes(u)) {
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
    if (!isDone) {
      completeMission(mission.id, mission.xp, mission.badge);
    }
    setPhase(PHASE.COMPLETE);
    const nextIdx = missionIdx + 1;
    setTimeout(() => {
      if (nextIdx < lab.missions.length) {
        useStore.getState().openMission(labId, nextIdx);
      } else {
        // All lab missions neutralized: Trigger Post-Lab 5-Question Incident Evaluation
        useStore.getState().openLabQuiz(labId);
      }
    }, 2800);
  }

  // ── Tool block map (rendered on demand with safe fallbacks) ──
  function renderToolBlock() {
    if (!mission) return null;
    switch (mission.type) {
      case 'log':
        return <LogViewer lines={mission.logLines || []} />;
      case 'log_terminal':
        return <LogViewer lines={mission.logLines || []} termCmds={mission.terminalCmds || []} />;
      case 'burp':
        return <BurpBlock requests={mission.burpRequests || []} />;
      case 'tickets':
        return <TicketBlock tickets={mission.tickets || []} />;
      case 'policy':
        return <PolicyBlock policies={mission.policies || []} />;
      case 'agent':
        return (
          <AgentBuilder
            patterns={mission.agentPatterns || []}
            onDeploy={() => {
              setAnswer('DEPLOY_ALL');
              setAnswerOk(true);
            }}
          />
        );
      case 'marketplace':
        return <MarketplaceBlock listings={mission.marketplaceListings || []} audit={mission.clusterAudit} />;
      case 'k8s':
        return <K8sBlock pods={mission.pods || []} termCmds={mission.terminalCmds || []} />;
      case 'deepfake':
        return <DeepfakeBlock indicators={mission.videoIndicators || []} />;
      case 'crypto':
        return <CryptoBlock algorithms={mission.cryptoAlgorithms || []} />;
      default:
        return null;
    }
  }

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
          {isDone ? (
            <div className={s.briefingButtonGroup}>
              <button
                className={s.enterWorkspaceBtnSecondary}
                onClick={() => {
                  setReplayMode(false);
                  setPhase(PHASE.WORKSPACE);
                }}
              >
                <span>REVIEW ARCHIVE (READ-ONLY)</span>
                <IconArrowRight size={16} />
              </button>
              <button
                className={s.enterWorkspaceBtn}
                onClick={() => {
                  triggerReplay();
                  setPhase(PHASE.WORKSPACE);
                }}
              >
                <span>↻ REPLAY OPERATION</span>
                <IconArrowRight size={18} />
              </button>
            </div>
          ) : (
            <button
              className={s.enterWorkspaceBtn}
              onClick={() => setPhase(PHASE.WORKSPACE)}
            >
              <span>ENTER INVESTIGATION WORKSPACE</span>
              <IconArrowRight size={18} />
            </button>
          )}
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
              {isDone && replayMode && (
                <span className={s.replayModeBadge}>
                  <span className={s.replayPulse} />
                  REPLAY ACTIVE
                </span>
              )}
              {isArchived && (
                <span className={s.archivedBadge}>ARCHIVED RECORD</span>
              )}
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
                <div className={s.checklistHeaderRight}>
                  <span className={s.checklistProgress}>
                    {completedTasksCount}/{mission.tasks.length}
                  </span>
                  {completedTasksCount > 0 && (
                    <button
                      className={s.checklistResetBtn}
                      onClick={() => resetMissionTasks && resetMissionTasks(mission.id, mission.tasks.length)}
                      title="Reset checklist items"
                    >
                      RESET
                    </button>
                  )}
                </div>
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
            {isDone && replayMode && (
              <div className={s.replayModeBanner}>
                <div className={s.replayBannerLeft}>
                  <span className={s.replayBannerIcon}>↻</span>
                  <div>
                    <div className={s.replayBannerTitle}>OPERATIONAL REPLAY & PRACTICE MODE</div>
                    <div className={s.replayBannerDesc}>
                      You are re-executing this operation. Re-test investigation tasks and verify threat indicators.
                    </div>
                  </div>
                </div>
                <button
                  className={s.viewArchiveBtn}
                  onClick={() => setReplayMode(false)}
                  title="Switch to read-only archive"
                >
                  View Archived Record
                </button>
              </div>
            )}

            {/* Tool Interactive Block */}
            <div className={s.toolContainer}>
              {renderToolBlock()}
            </div>

            {/* Submission Section */}
            {!isArchived ? (
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
                    <span>
                      {isDone
                        ? 'CORRECT! Threat indicator re-verified during operational replay.'
                        : 'CORRECT! Threat indicator confirmed. Click "Complete Mission" below to log finding.'}
                    </span>
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
                <div className={s.alreadyCompletedLeft}>
                  <IconCheckCircle size={20} />
                  <span>MISSION SECURED — {mission.xp} XP credited to operator dossier.</span>
                </div>
                <button
                  className={s.replayTriggerBtn}
                  onClick={triggerReplay}
                  title="Re-open verification gate and replay this mission"
                >
                  ↻ REPLAY OPERATION
                </button>
              </div>
            )}

            {/* Complete Mission & Advance Button */}
            <div className={s.completeActionWrap}>
              {isArchived ? (
                <>
                  <button
                    className={s.replayTriggerBtnBig}
                    onClick={triggerReplay}
                    title="Re-run interactive operational simulation"
                  >
                    <span>↻ REPLAY OPERATION</span>
                  </button>

                  {missionIdx + 1 < lab.missions.length ? (
                    <button
                      className={s.advanceNextBtn}
                      onClick={() => useStore.getState().openMission(labId, missionIdx + 1)}
                    >
                      <span>NEXT OPERATION (0{missionIdx + 2})</span>
                      <IconArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      className={s.advanceNextBtn}
                      onClick={() => useStore.getState().showDebrief(labId)}
                    >
                      <span>VIEW LAB DEBRIEF</span>
                      <IconArrowRight size={18} />
                    </button>
                  )}
                </>
              ) : (
                <button
                  className={s.completeFinalBtn}
                  disabled={!answerOk}
                  onClick={handleComplete}
                >
                  <span>{isDone ? 'COMPLETE REPLAY & ADVANCE' : 'COMPLETE MISSION & ADVANCE'}</span>
                  <IconArrowRight size={18} />
                </button>
              )}
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

        <span className={s.completePill}>{isDone ? 'REPLAY SUCCEEDED' : 'OPERATION SUCCEEDED'}</span>
        <h2 className={s.completeTitle}>{mission.title}</h2>
        <p className={s.completeSub}>
          {isDone
            ? 'Operational objectives successfully re-tested and validated in replay mode.'
            : 'Threat vector neutralized and forensic trace added to incident debrief report.'}
        </p>

        <div className={s.completeXPBox}>
          {isDone ? <IconCheckCircle size={22} /> : <IconZap size={22} />}
          <span>{isDone ? 'OBJECTIVE RE-CONFIRMED' : `+${mission.xp} XP AWARDED`}</span>
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
