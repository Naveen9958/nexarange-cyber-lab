// src/components/Mission/MissionView.jsx
import { useState } from 'react';
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

export default function MissionView() {
  const { currentLab, currentMission, completedMissions, completeMission,
          initMissionTasks, toggleTask, missionTasks, setView, setLab } = useStore();

  const lab = LAB_DATA[currentLab];
  const mission = lab?.missions[currentMission];

  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [answerOk, setAnswerOk] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!mission) return null;

  const isDone = !!completedMissions[mission.id];
  const color = lab.color;
  const neon = `var(--neon-${color})`;

  initMissionTasks(mission.id, mission.tasks.length);
  const tasks = missionTasks[mission.id] || [];

  const prevEvidence = currentMission > 0
    ? lab.missions[currentMission - 1].evidence_out : null;

  function handleSubmit() {
    const clean = (v) => v.trim().toLowerCase().replace(/\s+/g, '-');
    const userAns = clean(answer);
    const correct = clean(mission.answer);
    if (userAns === correct || userAns.includes(correct.slice(0, 6)) || correct.includes(userAns)) {
      setFeedback('correct');
      setAnswerOk(true);
    } else {
      setFeedback('wrong');
      setTimeout(() => { setFeedback(null); setAnswer(''); }, 1200);
    }
  }

  function handleComplete() {
    if (isDone) return;
    completeMission(mission.id, mission.xp, mission.badge);
    // Advance to next mission after delay
    const nextIdx = currentMission + 1;
    if (nextIdx < lab.missions.length) {
      setTimeout(() => {
        useStore.getState().openMission(currentLab, nextIdx);
      }, 3500);
    } else {
      setTimeout(() => useStore.getState().showDebrief(currentLab), 3500);
    }
  }

  const InteractiveBlock = {
    log: <LogViewer lines={mission.logLines} />,
    log_terminal: <LogViewer lines={mission.logLines} termCmds={mission.terminalCmds} missionId={mission.id} />,
    burp: <BurpBlock requests={mission.burpRequests} />,
    tickets: <TicketBlock tickets={mission.tickets} onSelect={(id) => setAnswer(id)} />,
    policy: <PolicyBlock policies={mission.policies} />,
    agent: <AgentBuilder patterns={mission.agentPatterns} onDeploy={() => { setAnswer('DEPLOY_ALL'); setAnswerOk(true); }} />,
    marketplace: <MarketplaceBlock listings={mission.marketplaceListings} audit={mission.clusterAudit} />,
    k8s: <K8sBlock pods={mission.pods} termCmds={mission.terminalCmds} missionId={mission.id} />,
    deepfake: <DeepfakeBlock indicators={mission.videoIndicators} />,
    crypto: <CryptoBlock algorithms={mission.cryptoAlgorithms} />,
  }[mission.type];

  return (
    <div className={s.wrap}>
      {/* Header */}
      <div className={s.headerBar}>
        <button className={s.backBtn} onClick={() => { setLab(currentLab); setView('labs'); }}>← BACK</button>
        <span className={s.mNum}>LAB 0{lab.id} // MISSION {mission.num}</span>
        <span className={s.mTitle}>{mission.title}</span>
        <span className={s.mXP} style={{ color: neon }}>+{mission.xp} XP</span>
        <button className={s.hintBtn} onClick={() => setShowHint(true)}>💡 HINT</button>
      </div>

      {/* Evidence handoff */}
      {prevEvidence && (
        <div className={s.handoff}>
          <span className={s.handoffLabel}>EVIDENCE IN</span>
          <span className={s.handoffArrow}>→</span>
          <span className={s.handoffVal}>{prevEvidence.key}: <strong>{prevEvidence.value}</strong></span>
        </div>
      )}

      {/* Character briefing */}
      <div className={s.briefing} style={{ borderLeftColor: neon }}>
        <div className={s.charAvatar} style={{ background: `linear-gradient(135deg,${neon},var(--neon-cyan))` }}>
          {mission.partner.initial}
        </div>
        <div className={s.charBody}>
          <div className={s.charName} style={{ color: neon }}>{mission.partner.name}</div>
          <div className={s.charRole}>{mission.partner.role}</div>
          <div className={s.charDialogue}>"{mission.dialogue}"</div>
        </div>
      </div>

      {/* Evidence panel */}
      <div className={s.evidencePanel}>
        <div className={s.evidenceTitle}>// EVIDENCE & CONTEXT</div>
        {mission.evidence.map((e) => (
          <div className={s.evidenceItem} key={e.key}>
            <span className={s.evidenceKey}>{e.key}</span>
            {e.value}
          </div>
        ))}
      </div>

      {/* Interactive block */}
      {InteractiveBlock}

      {/* Tasks */}
      <div className={s.tasks}>
        <div className={s.tasksTitle}>// MISSION OBJECTIVES</div>
        {mission.tasks.map((t, i) => (
          <div
            key={i}
            className={`${s.task} ${tasks[i] ? s.taskDone : ''}`}
            onClick={() => toggleTask(mission.id, i)}
          >
            <div className={`${s.taskCheck} ${tasks[i] ? s.checked : ''}`}>{tasks[i] ? '✓' : ''}</div>
            {t}
          </div>
        ))}
      </div>

      {/* Answer submission */}
      {!isDone ? (
        <div className={s.answerBlock}>
          <div className={s.answerTitle}>🔎 SUBMIT FINDING</div>
          <p className={s.answerQ}>{mission.question}</p>
          <div className={s.answerRow}>
            <input
              className={`${s.answerInput} ${feedback === 'correct' ? s.correct : ''} ${feedback === 'wrong' ? s.wrong : ''}`}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter your answer..."
            />
            <button className={s.submitBtn} onClick={handleSubmit}>SUBMIT</button>
          </div>
          {feedback === 'correct' && <div className={s.feedbackOk}>✓ CORRECT — click "Complete Mission" to advance.</div>}
          {feedback === 'wrong' && <div className={s.feedbackErr}>✗ Incorrect. Re-examine the evidence.</div>}
        </div>
      ) : (
        <div className={s.alreadyDone}>✓ MISSION COMPLETE — {mission.xp} XP AWARDED</div>
      )}

      <button
        className={s.completeBtn}
        disabled={isDone || !answerOk}
        onClick={handleComplete}
      >
        {isDone ? '✓ MISSION ALREADY COMPLETE' : 'COMPLETE MISSION & ADVANCE ➜'}
      </button>

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
