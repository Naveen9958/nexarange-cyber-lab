// src/components/Debrief/DebriefView.jsx — Case Debrief & Attack Chain Reconstruction
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import { IconAward, IconCheckCircle, IconZap, IconShield } from '../Common/Icons';
import s from './DebriefView.module.css';

export default function DebriefView() {
  const { currentLab, completedMissions, totalXP, badges, setView, operator, openLabQuiz, labQuizzes } = useStore();
  const lab = LAB_DATA[currentLab || 1];
  const labId = currentLab || 1;
  const quizResult = labQuizzes?.[labId];

  const completedInLab = lab.missions.filter((m) => completedMissions[m.id]).length;
  const labXP = lab.missions.reduce(
    (acc, m) => (completedMissions[m.id] ? acc + m.xp : acc),
    0
  );

  return (
    <div className={s.wrap}>
      {/* ── Case Closed Banner ── */}
      <div className={s.topBanner}>
        <div className={s.bannerTag}>CASE RESOLUTION REPORT</div>
        <h1 className={s.bannerTitle}>CASE {lab.caseId} // CLOSED & SECURED</h1>
        <p className={s.bannerSub}>{lab.title} — {lab.subtitle}</p>
      </div>

      {/* ── Attack Chain Reconstruction ── */}
      <div className={s.section}>
        <div className={s.sectionTitle}>// ATTACK CHAIN RECONSTRUCTION TIMELINE</div>
        <div className={s.chain}>
          {lab.debriefChain.map((step, i) => (
            <div key={i} className={s.chainItem}>
              <div className={s.chainNode}>0{i + 1}</div>
              <div className={s.chainLabel}>{step}</div>
              {i < lab.debriefChain.length - 1 && <div className={s.chainArrow}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Case Narrative Summary & Forensic Takeaways ── */}
      {(lab.recap || lab.wrappingUp || lab.takeaway) && (
        <div className={s.narrativeSection}>
          {lab.recap && (
            <div className={s.narrativeCard}>
              <div className={s.narrativeTitle}>// FULL INCIDENT RECAP</div>
              <p className={s.narrativeText}>{lab.recap}</p>
            </div>
          )}
          {lab.wrappingUp && (
            <div className={s.narrativeCard}>
              <div className={s.narrativeTitle}>// CASE CLOSING & THREAT INTEL</div>
              <p className={s.narrativeText}>{lab.wrappingUp}</p>
            </div>
          )}
          {lab.takeaway && (
            <div className={`${s.narrativeCard} ${s.takeawayCard}`}>
              <div className={s.narrativeTitle}>// WHAT {(operator?.fullName || operator?.name || 'OPERATOR').toUpperCase()} TAKES AWAY FROM THIS</div>
              <p className={s.narrativeText}>{lab.takeaway}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Post-Lab Knowledge Assessment & Capstone Brief ── */}
      <div className={s.quizCard}>
        <div className={s.quizInfo}>
          <div className={s.quizTag}>
            <IconZap size={14} />
            <span>INCIDENT KNOWLEDGE VERIFICATION // 5 MCQS + WRITTEN BRIEF</span>
          </div>
          <div className={s.quizTitle}>POST-LAB ASSESSMENT & MISSION SYNTHESIS</div>
          <p className={s.quizDesc}>
            Validate forensic retention with 5 scenario-based MCQs followed by your Operator Written Synthesis Brief summarizing the 5 neutralization phases.
          </p>
          {quizResult?.completed && (
            <div className={s.quizScoreBadge}>
              <IconCheckCircle size={14} />
              <span>Assessment Completed: {quizResult.score}/5 MCQs Correct (+{quizResult.xpEarned || quizResult.score * 50} XP)</span>
            </div>
          )}
        </div>
        <button className={s.quizLaunchBtn} onClick={() => openLabQuiz(labId)}>
          <IconShield size={16} />
          <span>{quizResult?.completed ? 'REVIEW / RETAKE 5 MCQS & BRIEF' : 'START 5 MCQS + WRITTEN BRIEF'}</span>
        </button>
      </div>

      {/* ── Operator's Filed Synthesis Brief ── */}
      {quizResult?.operatorBrief && (
        <div className={s.briefSection}>
          <div className={s.briefCard}>
            <div className={s.briefHeader}>
              <div className={s.briefTag}>// OPERATOR FILED INCIDENT SYNTHESIS BRIEF</div>
              <span className={s.briefTimestamp}>RECORDED IN FORENSIC DOSSIER</span>
            </div>
            <div className={s.briefContent}>{quizResult.operatorBrief}</div>
          </div>
        </div>
      )}

      {/* ── Metrics & Badges ── */}
      <div className={s.row}>
        <div className={s.card}>
          <div className={s.cardTitle}>// CASE METRICS</div>
          <div className={s.stat}>
            <span className={s.statKey}>Missions Neutralized</span>
            <span className={s.statVal}>{completedInLab} / 5</span>
          </div>
          <div className={s.stat}>
            <span className={s.statKey}>XP Secured in Scenario</span>
            <span className={s.statVal}>+{labXP} XP</span>
          </div>
          <div className={s.stat}>
            <span className={s.statKey}>Total Enclave XP</span>
            <span className={s.statVal}>{totalXP.toLocaleString()} XP</span>
          </div>
          <div className={s.stat}>
            <span className={s.statKey}>Badges Credited</span>
            <span className={s.statVal}>{badges.length}</span>
          </div>
        </div>

        <div className={s.card}>
          <div className={s.cardTitle}>// ACCREDITATION BADGES</div>
          <div className={s.badgeRow}>
            {lab.missions.map((m) => {
              const isEarned = !!completedMissions[m.id];
              return (
                <div
                  key={m.id}
                  className={`${s.badgeItem} ${isEarned ? s.badgeEarned : s.badgeLocked}`}
                  title={m.badge.name}
                >
                  <div className={s.badgeEmoji}>{isEarned ? m.badge.emoji : '🔒'}</div>
                  <div className={s.badgeName}>{m.badge.name}</div>
                  <span className={s.badgeStatus}>{isEarned ? 'UNLOCKED' : 'LOCKED'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Navigation Actions ── */}
      <div className={s.actions}>
        <button className={s.certBtn} onClick={() => setView('certificates')}>
          <IconAward size={18} />
          <span>VIEW OFFICIAL ACCREDITATION</span>
        </button>
        <button className={s.dashBtn} onClick={() => setView('dashboard')}>
          RETURN TO COMMAND CENTER
        </button>
      </div>
    </div>
  );
}
