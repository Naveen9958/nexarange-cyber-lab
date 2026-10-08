// src/components/Quiz/LabQuizView.jsx — Post-Lab 5-Question Incident Assessment & Knowledge Verification
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
  IconFlask,
  IconTrophy,
} from '../Common/Icons';
import s from './LabQuizView.module.css';

export default function LabQuizView() {
  const { currentLab, labQuizzes, submitLabQuiz, showDebrief, setView } = useStore();
  const labId = currentLab || 1;
  const quiz = LAB_QUIZ_DATA[labId] || LAB_QUIZ_DATA[1];
  const labInfo = LAB_DATA[labId] || LAB_DATA[1];

  const existingResult = labQuizzes[labId];

  // Current question index (0 to 4)
  const [currentIdx, setCurrentIdx] = useState(0);
  // User's selections: { [questionIdx]: selectedOptionIdx }
  const [selectedAnswers, setSelectedAnswers] = useState(
    existingResult?.answers || {}
  );
  // Has the user clicked "Submit Answer" on the current question to see feedback?
  const [revealed, setRevealed] = useState({});
  // Is the quiz complete and viewing the results screen?
  const [isCompleted, setIsCompleted] = useState(Boolean(existingResult?.completed));

  // Reset or initialize when switching lab
  useEffect(() => {
    if (existingResult?.completed) {
      setSelectedAnswers(existingResult.answers || {});
      setIsCompleted(true);
    } else {
      setSelectedAnswers({});
      setRevealed({});
      setIsCompleted(false);
      setCurrentIdx(0);
    }
  }, [labId, existingResult?.completed]);

  const questions = quiz.questions;
  const currentQ = questions[currentIdx];
  const totalQuestions = questions.length;

  const currentSelection = selectedAnswers[currentIdx];
  const isCurrentRevealed = revealed[currentIdx] || isCompleted;

  // Handle selecting an option
  const handleSelectOption = (optIdx) => {
    if (isCurrentRevealed && !isCompleted) return;
    if (isCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx,
    }));
  };

  // Confirm current answer and reveal explanation
  const handleConfirmAnswer = () => {
    if (currentSelection === undefined) return;
    setRevealed((prev) => ({ ...prev, [currentIdx]: true }));
  };

  // Move to next question or complete quiz
  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Calculate final score
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correctCount++;
        }
      });

      const xpEarned = correctCount * 50; // 50 XP per question
      submitLabQuiz(labId, selectedAnswers, correctCount, xpEarned);
      setIsCompleted(true);
    }
  };

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

  // Calculate score for display
  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  const score = isCompleted ? (existingResult?.score ?? calculateScore()) : calculateScore();
  const accuracyPct = Math.round((score / totalQuestions) * 100);

  // ── Results Summary View ──
  if (isCompleted) {
    return (
      <div className={s.wrap}>
        {/* Top Banner */}
        <div className={s.topBanner}>
          <div>
            <div className={s.bannerTag}>
              <span className={s.pulseDot} />
              OPERATION 0{labId} // FORENSIC KNOWLEDGE VERIFICATION
            </div>
            <h1 className={s.bannerTitle}>{quiz.title} // POST-LAB MCQ EVALUATION</h1>
            <p className={s.bannerSub}>{quiz.subtitle} — Case {labInfo.caseId}</p>
          </div>
          <div className={s.bannerStats}>
            <div className={s.statPill}>
              <div className={s.statPillLabel}>Score</div>
              <div className={s.statPillVal}>{score} / {totalQuestions}</div>
            </div>
            <div className={s.statPill}>
              <div className={s.statPillLabel}>Assessment Bonus</div>
              <div className={s.statPillVal}>+{score * 50} XP</div>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className={s.resultsWrap}>
          <div className={s.resultHero}>
            <div className={s.scoreBadgeCircle}>
              <span className={s.scoreNumerator}>{score}</span>
              <span className={s.scoreDenominator}>/ {totalQuestions}</span>
            </div>

            <div className={s.xpBadgeGain}>
              <IconZap size={16} />
              <span>+{score * 50} XP CREDITED TO ENCLAVE PROFILE</span>
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
                ? `Outstanding execution, Operator. You have demonstrated a thorough forensic understanding of all 5 mission attack vectors in Operation 0${labId}.`
                : `You have completed the 5-question forensic review. Review the correct takeaways below to solidify your technical incident response readiness.`}
            </p>
          </div>

          {/* Question Breakdown List */}
          <div className={s.reviewSection}>
            <div className={s.reviewHeading}>// DETAILED FORENSIC BREAKDOWN (5 QUESTIONS)</div>
            {questions.map((q, idx) => {
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
            5 Incident Questions directly derived from Missions 01–05 // Case {labInfo.caseId}
          </p>
        </div>
        <div className={s.bannerStats}>
          <div className={s.statPill}>
            <div className={s.statPillLabel}>Current Question</div>
            <div className={s.statPillVal}>0{currentIdx + 1} / 0{totalQuestions}</div>
          </div>
          <div className={s.statPill}>
            <div className={s.statPillLabel}>Potential Bonus</div>
            <div className={s.statPillVal}>+250 XP</div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className={s.progressSection}>
        <div className={s.progressHeader}>
          <span className={s.progressTitle}>// ASSESSMENT TRAJECTORY</span>
          <span className={s.progressRatio}>
            QUESTION {currentIdx + 1} OF {totalQuestions}
          </span>
        </div>
        <div className={s.progressBarBg}>
          <div
            className={s.progressBarFill}
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <div className={s.stepDots}>
          {questions.map((q, idx) => {
            const hasAns = selectedAnswers[idx] !== undefined;
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
        </div>
      </div>

      {/* Question Card */}
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
                  {currentIdx < totalQuestions - 1
                    ? 'NEXT QUESTION'
                    : 'FINALIZE & VIEW SCORE'}
                </span>
                <IconArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
