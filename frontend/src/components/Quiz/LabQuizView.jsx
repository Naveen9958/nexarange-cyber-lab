// src/components/Quiz/LabQuizView.jsx — Multi-Modal Incident Assessment, MITRE ATT&CK Killchain Sequencer & CISO Executive Brief
import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { LAB_QUIZ_DATA } from '../../data/labQuizData';
import { LAB_DATA } from '../../data/labData';
import {
  IconCheckCircle,
  IconArrowRight,
  IconAward,
  IconZap,
  IconShield,
} from '../Common/Icons';
import s from './LabQuizView.module.css';

export default function LabQuizView() {
  const { currentLab, labQuizzes, submitLabQuiz, showDebrief, setView, operator } = useStore();
  const labId = currentLab || 1;
  const quiz = LAB_QUIZ_DATA[labId] || LAB_QUIZ_DATA[1];
  const labInfo = LAB_DATA[labId] || LAB_DATA[1];

  const existingResult = labQuizzes[labId];

  // Evaluation Modes: 'killchain' | 'terminal' | 'mcq' | 'brief'
  const [evalMode, setEvalMode] = useState('killchain');

  // Killchain Sequencing State
  // Shuffle or initialize stages
  const initialStages = quiz.killchainStages || [];
  const [orderedStages, setOrderedStages] = useState(() => {
    // Default shuffled for interaction
    return [...initialStages].sort((a, b) => (a.id % 2 === 0 ? 1 : -1));
  });
  const [killchainVerified, setKillchainVerified] = useState(false);
  const [killchainMsg, setKillchainMsg] = useState(null);

  // Terminal Scenario Challenge State
  const termChallenge = quiz.terminalChallenge || null;
  const [termSelectedCmd, setTermSelectedCmd] = useState(null);
  const [termOutput, setTermOutput] = useState(null);
  const [termVerified, setTermVerified] = useState(false);

  // MCQs & Written Synthesis
  const mcqQuestions = quiz.questions || [];
  const synthesisQ = quiz.synthesisQuestion;
  const [currentIdx, setCurrentIdx] = useState(0);

  const [selectedAnswers, setSelectedAnswers] = useState(
    existingResult?.answers || {}
  );
  const [operatorBrief, setOperatorBrief] = useState(
    existingResult?.operatorBrief || ''
  );
  const [revealed, setRevealed] = useState({});
  const [isCompleted, setIsCompleted] = useState(Boolean(existingResult?.completed));

  useEffect(() => {
    if (existingResult?.completed) {
      setSelectedAnswers(existingResult.answers || {});
      setOperatorBrief(existingResult.operatorBrief || '');
      setIsCompleted(true);
      setKillchainVerified(true);
      setOrderedStages(quiz.killchainStages || []);
      setTermVerified(true);
    } else {
      setSelectedAnswers({});
      setOperatorBrief('');
      setRevealed({});
      setIsCompleted(false);
      setCurrentIdx(0);
      setKillchainVerified(false);
      setKillchainMsg(null);
      setOrderedStages([...(quiz.killchainStages || [])].sort((a, b) => (a.id % 2 === 0 ? 1 : -1)));
      setTermSelectedCmd(null);
      setTermOutput(null);
      setTermVerified(false);
    }
  }, [labId, existingResult?.completed]);

  // Killchain Handlers
  const moveStage = (index, direction) => {
    if (killchainVerified) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= orderedStages.length) return;
    const newStages = [...orderedStages];
    const temp = newStages[index];
    newStages[index] = newStages[targetIdx];
    newStages[targetIdx] = temp;
    setOrderedStages(newStages);
    setKillchainMsg(null);
  };

  const handleVerifyKillchain = () => {
    let isCorrect = true;
    for (let i = 0; i < orderedStages.length; i++) {
      if (orderedStages[i].step !== i + 1) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      setKillchainVerified(true);
      setKillchainMsg({
        success: true,
        text: '✓ ATTACK KILLCHAIN RECONSTRUCTED ACCURATELY! +50 XP Killchain Bonus Unlocked.',
      });
      useStore.getState().showToast?.('+50 XP Killchain Reconstructed!', 'success');
    } else {
      setKillchainMsg({
        success: false,
        text: '✗ INACCURATE SEQUENCE: Review chronological incident progression (Ingress -> Escalation -> Hijack -> Lateral -> Hardening).',
      });
    }
  };

  // Terminal Challenge Handler
  const handleRunTermCmd = (cmd) => {
    setTermSelectedCmd(cmd);
    if (cmd === termChallenge?.correctCommand) {
      setTermOutput(termChallenge.output);
      setTermVerified(true);
      useStore.getState().showToast?.('+50 XP Forensic Artifact Confirmed!', 'success');
    } else {
      setTermOutput(`bash: ${cmd}: command executed, but did not reveal the target signature flaw. Try parsing the JWT token structure.`);
      setTermVerified(false);
    }
  };

  // MCQ Handlers
  const currentQ = mcqQuestions[currentIdx];
  const currentSelection = selectedAnswers[currentIdx];
  const isCurrentRevealed = revealed[currentIdx] || isCompleted;

  const handleSelectOption = (optIdx) => {
    if (isCurrentRevealed && !isCompleted) return;
    if (isCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx,
    }));
  };

  const handleConfirmAnswer = () => {
    if (currentSelection === undefined) return;
    setRevealed((prev) => ({ ...prev, [currentIdx]: true }));
  };

  const calculateScore = () => {
    let correct = 0;
    mcqQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleFinalize = () => {
    const correctCount = calculateScore();
    const mcqXP = correctCount * 50;
    const briefBonus = operatorBrief.trim().length >= (synthesisQ?.minChars || 30) ? (synthesisQ?.bonusXP || 100) : 0;
    const killchainBonus = killchainVerified ? 50 : 0;
    const totalXPBonus = mcqXP + briefBonus + killchainBonus;

    submitLabQuiz(labId, selectedAnswers, correctCount, totalXPBonus, operatorBrief.trim());
    setIsCompleted(true);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setRevealed({});
    setIsCompleted(false);
    setCurrentIdx(0);
    setKillchainVerified(false);
    setKillchainMsg(null);
    setOrderedStages([...(quiz.killchainStages || [])].sort((a, b) => (a.id % 2 === 0 ? 1 : -1)));
    setTermSelectedCmd(null);
    setTermOutput(null);
    setTermVerified(false);
    setEvalMode('killchain');
  };

  const score = isCompleted ? (existingResult?.score ?? calculateScore()) : calculateScore();
  const accuracyPct = Math.round((score / mcqQuestions.length) * 100);
  const finalBrief = isCompleted ? (existingResult?.operatorBrief || operatorBrief) : operatorBrief;

  const trackedConcepts = (synthesisQ?.keyConcepts || []).map((term) => ({
    term,
    found: operatorBrief.toLowerCase().includes(term.toLowerCase()),
  }));

  // ── Results Summary View ──
  if (isCompleted) {
    const briefXPGranted = finalBrief.trim().length >= (synthesisQ?.minChars || 30);
    const totalEarned = (score * 50) + (briefXPGranted ? (synthesisQ?.bonusXP || 100) : 0) + 50;

    return (
      <div className={s.wrap}>
        {/* Top Banner */}
        <div className={s.topBanner}>
          <div>
            <div className={s.bannerTag}>
              <span className={s.pulseDot} />
              OPERATION 0{labId} // INCIDENT RESOLUTION VERIFIED
            </div>
            <h1 className={s.bannerTitle}>{quiz.title} // EVALUATION ARCHIVE</h1>
            <p className={s.bannerSub}>{quiz.subtitle} — Case {labInfo.caseId}</p>
          </div>
          <div className={s.bannerStats}>
            <div className={s.statPill}>
              <div className={s.statPillLabel}>Forensic Score</div>
              <div className={s.statPillVal}>{score} / {mcqQuestions.length}</div>
            </div>
            <div className={s.statPill}>
              <div className={s.statPillLabel}>Total Bonus XP</div>
              <div className={s.statPillVal}>+{totalEarned} XP</div>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className={s.resultsWrap}>
          <div className={s.resultHero}>
            <div className={s.scoreBadgeCircle}>
              <span className={s.scoreNumerator}>{score}</span>
              <span className={s.scoreDenominator}>/ {mcqQuestions.length}</span>
            </div>

            <div className={s.xpBadgeGain}>
              <IconZap size={16} />
              <span>+{totalEarned} XP CREDITED TO ENCLAVE PROFILE</span>
            </div>

            <h2 className={s.resultTitle}>
              {accuracyPct === 100
                ? 'FLAWLESS EVALUATION — 100% PROFICIENCY'
                : accuracyPct >= 80
                ? 'TACTICAL MASTERY CONFIRMED'
                : 'ASSESSMENT ARCHIVED — REVIEW RECOMMENDATIONS'}
            </h2>
            <p className={s.resultSub}>
              You have completed the multi-modal cyber range evaluation, reconstructed the MITRE ATT&CK killchain, verified the forensic artifacts, and submitted your executive incident debrief.
            </p>
          </div>

          {/* Operator Submitted Written Synthesis Brief Showcase */}
          {finalBrief && (
            <div className={s.submittedBriefCard}>
              <div className={s.submittedBriefHeader}>
                <div className={s.submittedBriefTag}>
                  <IconShield size={16} />
                  <span>
                    OPERATOR INCIDENT SYNTHESIS BRIEF // {(operator?.fullName || operator?.name || operator?.callsign || 'OPERATOR').toUpperCase()}
                  </span>
                </div>
                <span className={s.verifiedStamp}>✓ CISO VERIFIED (+100 XP)</span>
              </div>
              <div className={s.submittedBriefBody}>
                {finalBrief}
              </div>
            </div>
          )}

          {/* Question Breakdown List */}
          <div className={s.reviewSection}>
            <div className={s.reviewHeading}>// DETAILED ROOT-CAUSE & REMEDIATION BREAKDOWN</div>
            {mcqQuestions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctIndex;

              return (
                <div key={q.id} className={s.reviewCard}>
                  <div className={s.reviewCardHeader}>
                    <div className={s.missionTag}>
                      <span>{q.badge}</span>
                      <span>MISSION 0{q.missionNum}: {q.missionTitle.toUpperCase()}</span>
                    </div>
                    <span className={isCorrect ? s.reviewOutcomeCorrect : s.reviewOutcomeWrong}>
                      {isCorrect ? '✓ CORRECT (+50 XP)' : '✗ INCORRECT (0 XP)'}
                    </span>
                  </div>

                  <div className={s.reviewQTitle}>
                    {idx + 1}. {q.question}
                  </div>

                  {q.codeDiff && (
                    <div className={s.codeDiffBox}>
                      <div className={s.codeDiffHeader}>
                        <span>VULNERABILITY ANATOMY // CODE DIFF</span>
                        <span>{q.mitre}</span>
                      </div>
                      <div className={s.codeDiffGrid}>
                        <div className={s.codeDiffCol}>
                          <pre className={s.codeDiffVuln}>{q.codeDiff.vulnerable}</pre>
                        </div>
                        <div className={s.codeDiffCol}>
                          <pre className={s.codeDiffPatched}>{q.codeDiff.patched}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={s.reviewAnswers}>
                    <div className={s.chosenAnswer}>
                      <strong>Your Answer:</strong> {userAns !== undefined ? q.options[userAns] : 'No answer selected'}
                    </div>
                    {!isCorrect && (
                      <div className={s.correctAnswer}>
                        <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                      </div>
                    )}
                  </div>

                  <div className={`${s.explanationBox} ${!isCorrect ? s.explanationWrong : ''}`}>
                    <div className={`${s.explanationTag} ${isCorrect ? s.explanationTagSuccess : s.explanationTagFail}`}>
                      <IconShield size={14} />
                      <span>FORENSIC TAKEAWAY // {q.topic.toUpperCase()}</span>
                    </div>
                    <p className={s.explanationText}>{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className={s.resultActions}>
            <button className={s.primaryBtn} onClick={() => showDebrief(labId)}>
              <span>PROCEED TO CASE DEBRIEF</span>
              <IconArrowRight size={16} />
            </button>
            <button className={s.secondaryBtn} onClick={() => setView('certificates')}>
              <IconAward size={16} />
              <span style={{ marginLeft: '6px' }}>VIEW ACCREDITATIONS</span>
            </button>
            <button className={s.secondaryBtn} onClick={handleRetake}>
              RETAKE ASSESSMENT
            </button>
            <button className={s.secondaryBtn} onClick={() => setView('labs')}>
              RETURN TO LABS
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active Interactive Evaluation Deck ──
  return (
    <div className={s.wrap}>
      {/* Top Banner */}
      <div className={s.topBanner}>
        <div>
          <div className={s.bannerTag}>
            <span className={s.pulseDot} />
            OPERATION 0{labId} // POST-LAB INCIDENT COMMAND EVALUATION
          </div>
          <h1 className={s.bannerTitle}>{quiz.title}</h1>
          <p className={s.bannerSub}>
            Hands-on Incident Reconstruction: Killchain Sequencing, Kali Terminal Verification, Root-Cause Analysis, & CISO Brief.
          </p>
        </div>
        <div className={s.bannerStats}>
          <div className={s.statPill}>
            <div className={s.statPillLabel}>Enclave Case</div>
            <div className={s.statPillVal}>{labInfo.caseId}</div>
          </div>
          <div className={s.statPill}>
            <div className={s.statPillLabel}>Max Bonus</div>
            <div className={s.statPillVal}>+{quiz.totalXP} XP</div>
          </div>
        </div>
      </div>

      {/* Multi-Modal Evaluation Navigation Tabs */}
      <div className={s.quizModeTabs}>
        <button
          type="button"
          className={`${s.quizModeBtn} ${evalMode === 'killchain' ? s.quizModeBtnActive : ''}`}
          onClick={() => setEvalMode('killchain')}
        >
          <span>⚡</span>
          <span>MITRE ATT&CK KILLCHAIN SEQUENCER</span>
          <span className={s.modeBadge}>{killchainVerified ? 'VERIFIED' : 'ACTIVE'}</span>
        </button>

        <button
          type="button"
          className={`${s.quizModeBtn} ${evalMode === 'terminal' ? s.quizModeBtnActive : ''}`}
          onClick={() => setEvalMode('terminal')}
        >
          <span>🐉</span>
          <span>KALI FORENSIC CHALLENGE</span>
          <span className={s.modeBadge}>{termVerified ? 'RESOLVED' : 'CHALLENGE'}</span>
        </button>

        <button
          type="button"
          className={`${s.quizModeBtn} ${evalMode === 'mcq' ? s.quizModeBtnActive : ''}`}
          onClick={() => setEvalMode('mcq')}
        >
          <span>📋</span>
          <span>ROOT-CAUSE & CODE DIFFS</span>
          <span className={s.modeBadge}>{calculateScore()}/5</span>
        </button>

        <button
          type="button"
          className={`${s.quizModeBtn} ${evalMode === 'brief' ? s.quizModeBtnActive : ''}`}
          onClick={() => setEvalMode('brief')}
        >
          <span>📝</span>
          <span>CISO EXECUTIVE SYNTHESIS BRIEF</span>
          <span className={s.modeBadge}>+100 XP</span>
        </button>
      </div>

      {/* ── MODE 1: MITRE ATT&CK KILLCHAIN SEQUENCER ── */}
      {evalMode === 'killchain' && (
        <div className={s.killchainContainer}>
          <div className={s.killchainHeader}>
            <div>
              <h3 className={s.killchainTitle}>INCIDENT KILLCHAIN RECONSTRUCTION (MITRE ATT&CK)</h3>
              <p className={s.killchainDesc}>
                Arrange the 5 incident phases in chronological breach order. Threat actors chained these 5 vectors together to achieve complete enclave compromise.
              </p>
            </div>
            {killchainVerified ? (
              <div className={s.killchainVerifiedBanner}>
                <IconCheckCircle size={18} />
                <span>KILLCHAIN VERIFIED (+50 XP)</span>
              </div>
            ) : (
              <button
                type="button"
                className={s.verifyKillchainBtn}
                onClick={handleVerifyKillchain}
              >
                VERIFY KILLCHAIN INTEGRITY
              </button>
            )}
          </div>

          {killchainMsg && !killchainVerified && (
            <div style={{ color: '#ff5555', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              {killchainMsg.text}
            </div>
          )}

          <div className={s.killchainList}>
            {orderedStages.map((stage, idx) => (
              <div
                key={stage.id}
                className={`${s.killchainNode} ${killchainVerified ? s.killchainNodeCorrect : ''}`}
              >
                <div className={s.nodeLeft}>
                  <div className={s.nodeOrderBadge}>0{idx + 1}</div>
                  <div className={s.nodeInfo}>
                    <div className={s.nodeTitleRow}>
                      <span className={s.nodeTitle}>{stage.title}</span>
                      <span className={s.nodeCode}>{stage.code}</span>
                      <span className={s.nodeCode}>{stage.tag}</span>
                    </div>
                    <div className={s.nodeFlaw}>
                      <strong>Component:</strong> {stage.actor} — {stage.flaw}
                    </div>
                  </div>
                </div>

                {!killchainVerified && (
                  <div className={s.nodeControls}>
                    <button
                      type="button"
                      className={s.moveBtn}
                      disabled={idx === 0}
                      onClick={() => moveStage(idx, -1)}
                    >
                      ▲ Up
                    </button>
                    <button
                      type="button"
                      className={s.moveBtn}
                      disabled={idx === orderedStages.length - 1}
                      onClick={() => moveStage(idx, 1)}
                    >
                      ▼ Down
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="button"
              className={s.primaryBtn}
              onClick={() => setEvalMode('terminal')}
            >
              <span>CONTINUE TO KALI CHALLENGE ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODE 2: KALI TERMINAL FORENSIC CHALLENGE ── */}
      {evalMode === 'terminal' && termChallenge && (
        <div className={s.terminalChallengeCard}>
          <div>
            <div className={s.missionTag}>
              <span>🐉</span>
              <span>KALI LINUX INCIDENT VALIDATION // HANDS-ON INVESTIGATION</span>
            </div>
            <h3 className={s.questionText} style={{ marginTop: '8px' }}>
              {termChallenge.title}
            </h3>
            <p className={s.termScenarioText}>{termChallenge.scenario}</p>
          </div>

          <div className={s.termOptionsGrid}>
            {termChallenge.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                className={`${s.termOptionBtn} ${termSelectedCmd === opt ? s.termOptionSelected : ''}`}
                onClick={() => handleRunTermCmd(opt)}
              >
                <span style={{ color: '#00ffaa' }}>└─#</span>
                <code>{opt}</code>
              </button>
            ))}
          </div>

          {termOutput && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#8b949e', marginBottom: '6px' }}>
                KALI ENCLAVE TERMINAL OUTPUT:
              </div>
              <pre className={s.termScreenOut}>{termOutput}</pre>
            </div>
          )}

          {termVerified && (
            <div className={s.killchainVerifiedBanner}>
              <IconCheckCircle size={18} />
              <span>FORENSIC TAKEAWAY: {termChallenge.takeaway}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="button"
              className={s.primaryBtn}
              onClick={() => setEvalMode('mcq')}
            >
              <span>CONTINUE TO ROOT-CAUSE SCENARIOS ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODE 3: ROOT-CAUSE SCENARIOS & CODE DIFFS ── */}
      {evalMode === 'mcq' && (
        <>
          {/* Question Stepper Tabs */}
          <div className={s.progressSection}>
            <div className={s.progressHeader}>
              <span className={s.progressLabel}>SCENARIO QUESTIONS</span>
              <span className={s.progressCount}>0{currentIdx + 1} / 0{mcqQuestions.length}</span>
            </div>
            <div className={s.stepDotsRow}>
              {mcqQuestions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isAnswered = userAns !== undefined;
                const isCorrect = revealed[idx] && userAns === q.correctIndex;
                const isWrong = revealed[idx] && userAns !== q.correctIndex;

                let pillClass = s.stepDotPill;
                if (idx === currentIdx) pillClass += ` ${s.dotActive}`;
                else if (isCorrect) pillClass += ` ${s.dotCorrect}`;
                else if (isWrong) pillClass += ` ${s.dotWrong}`;

                return (
                  <button
                    key={q.id}
                    className={s.stepDotItem}
                    onClick={() => setCurrentIdx(idx)}
                    type="button"
                  >
                    <div className={pillClass} />
                    <span className={`${s.stepDotLabel} ${idx === currentIdx ? s.stepDotActiveLabel : ''}`}>
                      Q0{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={s.questionCard}>
            <div className={s.missionBadgeRow}>
              <div className={s.missionTag}>
                <span>{currentQ.badge}</span>
                <span>MISSION 0{currentQ.missionNum}: {currentQ.missionTitle.toUpperCase()}</span>
              </div>
              <div className={s.topicTag}>
                <span>{currentQ.mitre} // {currentQ.owasp}</span>
              </div>
            </div>

            <div className={s.questionText}>
              {currentQ.question}
            </div>

            {/* Code Diff Box */}
            {currentQ.codeDiff && (
              <div className={s.codeDiffBox}>
                <div className={s.codeDiffHeader}>
                  <span>ARCHITECTURAL FLAW VS SECURE IMPLEMENTATION</span>
                  <span>{currentQ.cve}</span>
                </div>
                <div className={s.codeDiffGrid}>
                  <div className={s.codeDiffCol}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#ff5555', marginBottom: '4px' }}>
                      [!] VULNERABLE LOGIC OBSERVED:
                    </div>
                    <pre className={s.codeDiffVuln}>{currentQ.codeDiff.vulnerable}</pre>
                  </div>
                  <div className={s.codeDiffCol}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#3fb950', marginBottom: '4px' }}>
                      [✔] SECURE ZERO-TRUST HARDENING:
                    </div>
                    <pre className={s.codeDiffPatched}>{currentQ.codeDiff.patched}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Options */}
            <div className={s.optionsList}>
              {currentQ.options.map((option, optIdx) => {
                const isSelected = currentSelection === optIdx;
                const isCorrect = isCurrentRevealed && optIdx === currentQ.correctIndex;
                const isWrong = isCurrentRevealed && isSelected && optIdx !== currentQ.correctIndex;

                let itemClass = s.optionItem;
                let keyClass = s.optionKey;

                if (isSelected) {
                  itemClass += ` ${s.optionSelected}`;
                  keyClass += ` ${s.keySelected}`;
                }
                if (isCorrect) {
                  itemClass += ` ${s.optionCorrect}`;
                  keyClass += ` ${s.keyCorrect}`;
                }
                if (isWrong) {
                  itemClass += ` ${s.optionWrong}`;
                  keyClass += ` ${s.keyWrong}`;
                }

                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={optIdx}
                    type="button"
                    className={itemClass}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isCurrentRevealed}
                  >
                    <div className={keyClass}>
                      {isCorrect ? '✓' : isWrong ? '✗' : letter}
                    </div>
                    <div className={s.optionText}>{option}</div>
                  </button>
                );
              })}
            </div>

            {/* Explanation when revealed */}
            {isCurrentRevealed && (
              <div className={`${s.explanationBox} ${currentSelection !== currentQ.correctIndex ? s.explanationWrong : ''}`}>
                <div className={`${s.explanationTag} ${currentSelection === currentQ.correctIndex ? s.explanationTagSuccess : s.explanationTagFail}`}>
                  <IconShield size={14} />
                  <span>TECHNICAL ROOT CAUSE & REMEDIATION // {currentQ.topic.toUpperCase()}</span>
                </div>
                <p className={s.explanationText}>{currentQ.explanation}</p>
              </div>
            )}

            {/* Action Bar */}
            <div className={s.actionBar}>
              <button
                type="button"
                className={s.secondaryBtn}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
              >
                ← PREVIOUS SCENARIO
              </button>

              {!isCurrentRevealed ? (
                <button
                  type="button"
                  className={s.primaryBtn}
                  onClick={handleConfirmAnswer}
                  disabled={currentSelection === undefined}
                >
                  <span>CONFIRM ANSWER & INSPECT REMEDIATION</span>
                  <IconArrowRight size={16} />
                </button>
              ) : currentIdx < mcqQuestions.length - 1 ? (
                <button
                  type="button"
                  className={s.primaryBtn}
                  onClick={() => setCurrentIdx((i) => i + 1)}
                >
                  <span>NEXT SCENARIO ➔</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={s.primaryBtn}
                  onClick={() => setEvalMode('brief')}
                >
                  <span>PROCEED TO CISO SYNTHESIS BRIEF ➔</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── MODE 4: CISO EXECUTIVE SYNTHESIS BRIEF ── */}
      {evalMode === 'brief' && synthesisQ && (
        <div className={s.questionCard}>
          <div className={s.missionBadgeRow}>
            <div className={s.missionTag}>
              <span>{synthesisQ.badge}</span>
              <span>CAPSTONE CERTIFICATION // CISO EXECUTIVE INCIDENT SYNTHESIS</span>
            </div>
            <div className={s.topicTag}>
              <span>BONUS: +{synthesisQ.bonusXP} XP</span>
            </div>
          </div>

          <div className={s.questionText}>
            {synthesisQ.title}
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
            {synthesisQ.prompt}
          </p>

          {/* Guiding Checklist */}
          <div className={s.guidingBox}>
            <div className={s.guidingHeader}>
              <IconShield size={14} />
              <span>KEY INCIDENT VECTORS TO COVER IN YOUR SYNTHESIS:</span>
            </div>
            <ul className={s.guidingList}>
              {synthesisQ.guidingPoints.map((pt, pIdx) => (
                <li key={pIdx} className={s.guidingItem}>
                  <span className={s.guidingBullet}>▹</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Written Textarea */}
          <div className={s.briefContainer}>
            <textarea
              className={s.briefTextarea}
              placeholder={synthesisQ.placeholder}
              value={operatorBrief}
              onChange={(e) => setOperatorBrief(e.target.value)}
            />

            <div className={s.briefMetaRow}>
              <div className={`${s.charCount} ${operatorBrief.trim().length >= synthesisQ.minChars ? s.charCountValid : ''}`}>
                {operatorBrief.trim().length} characters {operatorBrief.trim().length >= synthesisQ.minChars ? '(✓ Ready to submit)' : `(Min ${synthesisQ.minChars} chars recommended)`}
              </div>

              {/* Concept Keywords Illuminated */}
              <div className={s.conceptsTracked}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Concepts Detected:</span>
                {trackedConcepts.map((c, cIdx) => (
                  <span
                    key={cIdx}
                    className={`${s.conceptTag} ${c.found ? s.conceptActive : s.conceptInactive}`}
                  >
                    {c.found ? `✓ ${c.term}` : c.term}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Finalize Button */}
          <div className={s.actionBar}>
            <button
              type="button"
              className={s.secondaryBtn}
              onClick={() => setEvalMode('mcq')}
            >
              ← REVIEW SCENARIOS
            </button>

            <button
              type="button"
              className={s.primaryBtn}
              onClick={handleFinalize}
              disabled={operatorBrief.trim().length < 20}
            >
              <span>SUBMIT CISO BRIEF & ACCREDIT CERTIFICATION</span>
              <IconCheckCircle size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
