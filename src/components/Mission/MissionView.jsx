// src/components/Mission/MissionView.jsx
// 3-Phase: BRIEFING → WORKSPACE → COMPLETE
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
import s from './MissionView.module.css';

const PHASE = { BRIEFING: 'briefing', WORKSPACE: 'workspace', COMPLETE: 'complete' };

export default function MissionView() {
  const {
    currentLab, currentMission,
    completedMissions, completeMission,
    initMissionTasks, toggleTask, missionTasks,
    setView, setLab
  } = useStore();

  const lab     = LAB_DATA[currentLab];
  const mission = lab?.missions[currentMission];

  const [phase,     setPhase]     = useState(PHASE.BRIEFING);
  const [answer,    setAnswer]    = useState('');
  const [feedback,  setFeedback]  = useState(null);   // 'correct' | 'wrong'
  const [answerOk,  setAnswerOk]  = useState(false);
  const [showHint,  setShowHint]  = useState(false);
  const [animKey,   setAnimKey]   = useState(0);

  // Reset phase when mission changes
  useEffect(() => {
    setPhase(PHASE.BRIEFING);
    setAnswer('');
    setFeedback(null);
    setAnswerOk(false);
    setAnimKey((k) => k + 1);
  }, [mission?.id]);

  if (!mission) return null;

  const isDone  = !!completedMissions[mission.id];
  const color   = lab.color;
  const neon    = `var(--neon-${color})`;
  const prevEvidence = currentMission > 0
    ? lab.missions[currentMission - 1].evidence_out : null;

  initMissionTasks(mission.id, mission.tasks.length);
  const tasks = missionTasks[mission.id] || [];

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
      setTimeout(() => { setFeedback(null); setAnswer(''); }, 1500);
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
    }, 3500);
  }

  // ── Tool block map ──
  const toolBlock = {
    log:         <LogViewer lines={mission.logLines} />,
    log_terminal:<LogViewer lines={mission.logLines} termCmds={mission.terminalCmds} />,
    burp:        <BurpBlock requests={mission.burpRequests} />,
    tickets:     <TicketBlock tickets={mission.tickets} onSelect={(id) => setAnswer(id)} />,
    policy:      <PolicyBlock policies={mission.policies} />,
    agent:       <AgentBuilder patterns={mission.agentPatterns} onDeploy={() => { setAnswer('DEPLOY_ALL'); setAnswerOk(true); }} />,
    marketplace: <MarketplaceBlock listings={mission.marketplaceListings} audit={mission.clusterAudit} />,
    k8s:         <K8sBlock pods={mission.pods} termCmds={mission.terminalCmds} />,
    deepfake:    <DeepfakeBlock indicators={mission.videoIndicators} />,
    crypto:      <CryptoBlock algorithms={mission.cryptoAlgorithms} />,
  }[mission.type];

  // ─────────────────────────────────────────────
  // PHASE 1: BRIEFING
  // ─────────────────────────────────────────────
  if (phase === PHASE.BRIEFING) {
    return (
      <div className={s.wrap} key={`briefing-${animKey}`} style={{ animation: 'phaseIn 0.5s ease' }}>
        {/* Back button */}
        <div className={s.topBar}>
          <button className={s.backBtn} onClick={() => { setLab(currentLab); setView('labs'); }}>
            ← BACK TO OPERATIONS
          </button>
          <div className={s.missionTag}>
            <span style={{ color: neon }}>LAB 0{lab.id}</span>
            <span className={s.missionTagSep}>//</span>
            <span>MISSION {mission.num} OF 5</span>
          </div>
          <div className={s.mXPTag} style={{ color: neon }}>+{mission.xp} XP</div>
        </div>

        {/* Mission header */}
        <div className={s.briefingHeader} style={{ borderLeftColor: neon }}>
          <div className={s.briefingMeta} style={{ color: neon }}>
            {lab.company.toUpperCase()} · {lab.caseId} · MISSION {mission.num}
          </div>
          <h1 className={s.briefingTitle}>{mission.title}</h1>
          <p className={s.briefingRole}>Your role: <span style={{ color: neon }}>{lab.role}</span></p>
        </div>

        {/* Evidence handoff from previous mission */}
        {prevEvidence && (
          <div className={s.handoff}>
            <span className={s.handoffIcon}>📥</span>
            <div>
              <div className={s.handoffLabel}>INCOMING INTELLIGENCE FROM PREVIOUS MISSION</div>
              <div className={s.handoffVal}>
                <strong style={{ color: neon }}>{prevEvidence.key}:</strong> {prevEvidence.value}
              </div>
            </div>
          </div>
        )}

        {/* Character card */}
        <div className={s.charCard} style={{ borderLeftColor: neon }}>
          <div className={s.charAvatarWrap}>
            <div className={s.charAvatar} style={{ background: `linear-gradient(135deg,${neon},var(--neon-cyan))` }}>
              {mission.partner.initial}
            </div>
            <div className={s.charOnline} />
          </div>
          <div className={s.charBody}>
            <div className={s.charName} style={{ color: neon }}>{mission.partner.name}</div>
            <div className={s.charRole}>{mission.partner.role}</div>
          </div>
        </div>

        {/* Full briefing dialogue */}
        <div className={s.dialogueBox}>
          <div className={s.dialogueLabel}>// MISSION BRIEFING</div>
          <p className={s.dialogueText}>"{mission.dialogue}"</p>
        </div>

        {/* Context evidence */}
        <div className={s.evidenceSection}>
          <div className={s.evidenceSectionTitle}>// INTELLIGENCE PACKAGE</div>
          <div className={s.evidenceGrid}>
            {mission.evidence.map((e) => (
              <div className={s.evidenceCard} key={e.key}>
                <div className={s.evidenceKey} style={{ color: neon }}>{e.key}</div>
                <div className={s.evidenceVal}>{e.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives */}
        <div className={s.objectivesBox}>
          <div className={s.objectivesTitle}>// MISSION OBJECTIVES</div>
          {mission.tasks.map((t, i) => (
            <div key={i} className={s.objective}>
              <span className={s.objNum} style={{ color: neon }}>{String(i + 1).padStart(2, '0')}</span>
              <span className={s.objText}>{t}</span>
            </div>
          ))}
        </div>

        {/* Enter lab button */}
        <button
          className={s.enterLabBtn}
          style={{ background: `linear-gradient(135deg, rgba(${color === 'green' ? '0,255,170' : '0,212,255'},0.15), transparent)`, borderColor: neon, color: neon }}
          onClick={() => setPhase(PHASE.WORKSPACE)}
        >
          <span>⚡ ENTER THE LAB — BEGIN INVESTIGATION</span>
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // PHASE 2: WORKSPACE (tools + answer)
  // ─────────────────────────────────────────────
  if (phase === PHASE.WORKSPACE) {
    return (
      <div className={s.wrap} key={`workspace-${animKey}`} style={{ animation: 'phaseIn 0.4s ease' }}>
        {/* Top bar */}
        <div className={s.topBar}>
          <button className={s.backBtn} onClick={() => setPhase(PHASE.BRIEFING)}>
            ← BACK TO BRIEFING
          </button>
          <div className={s.missionTag}>
            <span style={{ color: neon }}>{mission.title.toUpperCase()}</span>
          </div>
          <div className={s.rightActions}>
            <button className={s.hintBtn} onClick={() => setShowHint(true)}>💡 HINT</button>
            <div className={s.mXPTag} style={{ color: neon }}>+{mission.xp} XP</div>
          </div>
        </div>

        {/* Recap strip */}
        <div className={s.recapStrip} style={{ borderLeftColor: neon }}>
          <span className={s.recapLabel}>MISSION BRIEFING RECAP</span>
          <span className={s.recapText}>
            {mission.dialogue.length > 180
              ? mission.dialogue.slice(0, 180) + '...'
              : mission.dialogue}
          </span>
          <button className={s.recapMore} onClick={() => setPhase(PHASE.BRIEFING)}
            style={{ color: neon }}>
            Full briefing →
          </button>
        </div>

        {/* Task checklist */}
        <div className={s.taskStrip}>
          {mission.tasks.map((t, i) => (
            <div
              key={i}
              className={`${s.taskChip} ${tasks[i] ? s.taskChipDone : ''}`}
              onClick={() => toggleTask(mission.id, i)}
              style={tasks[i] ? { borderColor: neon, color: neon } : {}}
            >
              <span className={s.taskChipCheck}>{tasks[i] ? '✓' : `${i + 1}`}</span>
              <span>{t}</span>
            </div>
          ))}
        </div>

        {/* Tool block */}
        <div className={s.toolArea}>
          {toolBlock}
        </div>

        {/* Answer submission */}
        {!isDone ? (
          <div className={s.answerBlock}>
            <div className={s.answerTitle}>🔎 SUBMIT YOUR FINDING</div>
            <p className={s.answerQuestion}>{mission.question}</p>
            <div className={s.answerRow}>
              <input
                className={`${s.answerInput} ${feedback === 'correct' ? s.inputCorrect : ''} ${feedback === 'wrong' ? s.inputWrong : ''}`}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Type your answer and press Enter..."
                autoFocus
              />
              <button className={s.submitBtn} onClick={handleSubmit}>SUBMIT</button>
            </div>
            {feedback === 'correct' && (
              <div className={s.feedbackCorrect}>✓ CORRECT IDENTIFICATION — Click "Complete Mission" to advance</div>
            )}
            {feedback === 'wrong' && (
              <div className={s.feedbackWrong}>✗ Incorrect — Re-examine the evidence panel above</div>
            )}
          </div>
        ) : (
          <div className={s.alreadyDone}>✓ MISSION ALREADY COMPLETE — {mission.xp} XP AWARDED</div>
        )}

        <button
          className={s.completeBtn}
          disabled={isDone || !answerOk}
          onClick={handleComplete}
        >
          {isDone ? '✓ MISSION COMPLETE' : 'COMPLETE MISSION & ADVANCE TO NEXT ➜'}
        </button>

        {showHint && (
          <HintPanel hints={mission.hints} missionId={mission.id} onClose={() => setShowHint(false)} />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // PHASE 3: COMPLETE
  // ─────────────────────────────────────────────
  return (
    <div className={s.wrap} style={{ animation: 'phaseIn 0.5s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <div className={s.completeIcon}>🏅</div>
      <div className={s.completeTitle} style={{ color: neon }}>MISSION {mission.num} COMPLETE</div>
      <div className={s.completeSub}>{mission.title}</div>
      <div className={s.completeXP} style={{ color: neon }}>+{mission.xp} XP AWARDED</div>
      <div className={s.completeBadge}>
        {mission.badge.emoji} <span>{mission.badge.name}</span>
      </div>
      <div className={s.completeFwd}>Advancing to next mission...</div>
    </div>
  );
}
