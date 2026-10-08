// src/components/Quiz/LabQuizView.jsx — Post-Lab 5-Question Incident Assessment & Capstone Written Synthesis
import React, { useState, useEffect } from 'react';
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

  // Questions and Synthesis Brief
  const mcqQuestions = quiz.questions || [];
  const synthesisQ = quiz.synthesisQuestion;
  const totalQuestions = mcqQuestions.length + (synthesisQ ? 1 : 0);

  // Current index (0..4 for MCQs, 5 for Synthesis Brief)
  const [currentIdx, setCurrentIdx] = useState(0);

  // User's MCQ selections: { [questionIdx]: selectedOptionIdx }
  const [selectedAnswers, setSelectedAnswers] = useState(
    existingResult?.answers || {}
  );

  // Operator Written Synthesis Brief text
  const [operatorBrief, setOperatorBrief] = useState(
    existingResult?.operatorBrief || ''
  );

  // Revealed feedback for MCQs
  const [revealed, setRevealed] = useState({});

  // Is completed
  const [isCompleted, setIsCompleted] = useState(Boolean(existingResult?.completed));

  // Reset or initialize when switching lab
  useEffect(() => {
    if (existingResult?.completed) {
      setSelectedAnswers(existingResult.answers || {});
      setOperatorBrief(existingResult.operatorBrief || '');
      setIsCompleted(true);
    } else {
      setSelectedAnswers({});
      setOperatorBrief('');
      setRevealed({});
      setIsCompleted(false);
      setCurrentIdx(0);
    }
  }, [labId, existingResult?.completed]);

  const isBriefStep = synthesisQ && currentIdx === mcqQuestions.length;
  const currentQ = !isBriefStep ? mcqQuestions[currentIdx] : null;

  const currentSelection = selectedAnswers[currentIdx];
  const isCurrentRevealed = revealed[currentIdx] || isCompleted;

  // Handle selecting an MCQ option
  const handleSelectOption = (optIdx) => {
    if (isCurrentRevealed && !isCompleted) return;
    if (isCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx,
    }));
  };

  // Confirm current MCQ answer and reveal explanation
  const handleConfirmAnswer = () => {
    if (currentSelection === undefined) return;
    setRevealed((prev) => ({ ...prev, [currentIdx]: true }));
  };

  // Calculate score for display
  const calculateScore = () => {
    let correct = 0;
    mcqQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  // Finalize assessment
  const handleFinalize = () => {
    const correctCount = calculateScore();
    const mcqXP = correctCount * 50;
    const briefBonus = operatorBrief.trim().length >= (synthesisQ?.minChars || 30) ? (synthesisQ?.bonusXP || 100) : 0;
    const totalXPBonus = mcqXP + briefBonus;

    submitLabQuiz(labId, selectedAnswers, correctCount, totalXPBonus, operatorBrief.trim());
    setIsCompleted(true);
  };

  // Next step
  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      handleFinalize();
    }
  };

  // Prev step
  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setRevealed({});
    setIsCompleted(false);
    setCurrentIdx(0);
  };

  const score = isCompleted ? (existingResult?.score ?? calculateScore()) : calculateScore();
  const accuracyPct = Math.round((score / mcqQuestions.length) * 100);
  const finalBrief = isCompleted ? (existingResult?.operatorBrief || operatorBrief) : operatorBrief;

  // Track keywords in operator brief
  const trackedConcepts = (synthesisQ?.keyConcepts || []).map((term) => ({
    term,
    found: operatorBrief.toLowerCase().includes(term.toLowerCase()),
  }));

  // ── Results Summary View ──
  if (isCompleted) {
    const briefXPGranted = finalBrief.trim().length >= (synthesisQ?.minChars || 30);
    const totalEarned = (score * 50) + (briefXPGranted ? (synthesisQ?.bonusXP || 100) : 0);

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
              <div className={s.statPillLabel}>MCQ Accuracy</div>
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
              {accuracyPct >= 80
                ? `Outstanding execution, Operator. You have demonstrated a thorough forensic understanding of all 5 mission attack vectors and synthesized a verified incident brief.`
                : `You have completed the forensic evaluation and reflection brief. Review the takeaways below to solidify your technical incident response readiness.`}
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
                <span className={s.verifiedStamp}>✓ ENCLAVE VERIFIED (+100 XP)</span>
              </div>
              <div className={s.submittedBriefBody}>
                {finalBrief}
              </div>
            </div>
          )}

          {/* Question Breakdown List */}
          <div className={s.reviewSection}>
            <div className={s.reviewHeading}>// DETAILED FORENSIC MCQ BREAKDOWN (5 QUESTIONS)</div>
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

  // ── Active Question Taking View ──
  return (
    <div className={s.wrap}>
      {/* Top Banner */}
      <div className={s.topBanner}>
        <div>
          <div className={s.bannerTag}>
            <span className={s.pulseDot} />
            OPERATION 0{labId} // POST-LAB KNOWLEDGE ASSESSMENT
          </div>
          <h1 className={s.bannerTitle}>{quiz.title}</h1>
          <p className={s.bannerSub}>
            5 Tactical Mission Questions + Capstone Written Synthesis Brief // Case {labInfo.caseId}
          </p>
        </div>
        <div className={s.bannerStats}>
          <div className={s.statPill}>
            <div className={s.statPillLabel}>Current Step</div>
            <div className={s.statPillVal}>0{currentIdx + 1} / 0{totalQuestions}</div>
          </div>
          <div className={s.statPill}>
            <div className={s.statPillLabel}>Potential Bonus</div>
            <div className={s.statPillVal}>+350 XP</div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className={s.progressSection}>
        <div className={s.progressHeader}>
          <span className={s.progressTitle}>// ASSESSMENT TRAJECTORY</span>
          <span className={s.progressRatio}>
            STEP {currentIdx + 1} OF {totalQuestions} {isBriefStep ? '(WRITTEN SYNTHESIS)' : '(TACTICAL MCQ)'}
          </span>
        </div>
        <div className={s.progressBarBg}>
          <div
            className={s.progressBarFill}
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <div className={s.stepDots}>
          {/* MCQs Steps */}
          {mcqQuestions.map((q, idx) => {
            const isRevealedStep = revealed[idx];
            const isCorrect = isRevealedStep && selectedAnswers[idx] === q.correctIndex;
            const isWrong = isRevealedStep && selectedAnswers[idx] !== q.correctIndex;

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

          {/* Step 6: Written Brief */}
          {synthesisQ && (
            <button
              className={s.stepDotItem}
              onClick={() => setCurrentIdx(mcqQuestions.length)}
              type="button"
            >
              <div
                className={`${s.stepDotPill} ${
                  currentIdx === mcqQuestions.length
                    ? s.dotActive
                    : operatorBrief.trim().length >= 40
                    ? s.dotCorrect
                    : ''
                }`}
              />
              <span
                className={`${s.stepDotLabel} ${
                  currentIdx === mcqQuestions.length ? s.stepDotActiveLabel : ''
                }`}
              >
                BRIEF
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Card */}
      {isBriefStep ? (
        /* ── STEP 06: WRITTEN SYNTHESIS BRIEF ── */
        <div className={s.questionCard}>
          <div className={s.missionBadgeRow}>
            <div className={s.missionTag}>
              <span>{synthesisQ.badge}</span>
              <span>CAPSTONE STEP // EXECUTIVE INCIDENT SYNTHESIS</span>
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

          {/* Guiding Checklist for the 5 Missions */}
          <div className={s.guidingBox}>
            <div className={s.guidingHeader}>
              <IconShield size={14} />
              <span>KEY INCIDENT VECTORS TO COVER IN YOUR BRIEF:</span>
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

          {/* Action Bar for Brief */}
          <div className={s.actionBar}>
            <button
              type="button"
              className={s.secondaryBtn}
              onClick={handlePrev}
            >
              ← PREVIOUS QUESTION
            </button>

            <button
              type="button"
              className={s.primaryBtn}
              onClick={handleFinalize}
              disabled={operatorBrief.trim().length < 20}
            >
              <span>SUBMIT BRIEF & FINALIZE ASSESSMENT</span>
              <IconCheckCircle size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* ── STEPS 01 TO 05: TACTICAL MCQS ── */
        <div className={s.questionCard}>
          <div className={s.missionBadgeRow}>
            <div className={s.missionTag}>
              <span>{currentQ.badge}</span>
              <span>RELATED TO MISSION 0{currentQ.missionNum}: {currentQ.missionTitle.toUpperCase()}</span>
            </div>
            <div className={s.topicTag}>
              <span>VECTOR: {currentQ.topic}</span>
            </div>
          </div>

          <div className={s.questionText}>
            {currentQ.question}
          </div>

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

          {/* Revealed Explanation */}
          {isCurrentRevealed && (
            <div
              className={`${s.explanationBox} ${
                currentSelection !== currentQ.correctIndex ? s.explanationWrong : ''
              }`}
            >
              <div
                className={`${s.explanationTag} ${
                  currentSelection === currentQ.correctIndex
                    ? s.explanationTagSuccess
                    : s.explanationTagFail
                }`}
              >
                <IconShield size={16} />
                <span>
                  {currentSelection === currentQ.correctIndex
                    ? 'VERIFIED CORRECT // FORENSIC TAKEAWAY'
                    : 'INCORRECT EVALUATION // CORRECT RATIONALE'}
                </span>
              </div>
              <p className={s.explanationText}>{currentQ.explanation}</p>
            </div>
          )}

          {/* Action Bar */}
          <div className={s.actionBar}>
            <button
              type="button"
              className={s.secondaryBtn}
              onClick={handlePrev}
              disabled={currentIdx === 0}
              style={{ visibility: currentIdx === 0 ? 'hidden' : 'visible' }}
            >
              ← PREVIOUS
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              {!isCurrentRevealed ? (
                <button
                  type="button"
                  className={s.primaryBtn}
                  onClick={handleConfirmAnswer}
                  disabled={currentSelection === undefined}
                >
                  <span>CONFIRM ANSWER</span>
                  <IconCheckCircle size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className={s.primaryBtn}
                  onClick={handleNext}
                >
                  <span>
                    {currentIdx < mcqQuestions.length - 1
                      ? 'NEXT QUESTION'
                      : 'PROCEED TO WRITTEN SYNTHESIS'}
                  </span>
                  <IconArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
