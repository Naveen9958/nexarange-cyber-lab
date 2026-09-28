// src/components/Debrief/DebriefView.jsx
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import s from './DebriefView.module.css';

export default function DebriefView() {
  const { currentLab, completedMissions, totalXP, badges, setView } = useStore();
  const lab = LAB_DATA[currentLab || 1];

  return (
    <div className={s.wrap}>
      <div className={s.topBanner}>
        <div className={s.bannerTitle}>CASE {lab.caseId} — CLOSED</div>
        <div className={s.bannerSub}>{lab.title}</div>
      </div>

      <div className={s.section}>
        <div className={s.sectionTitle}>// ATTACK CHAIN RECONSTRUCTION</div>
        <div className={s.chain}>
          {lab.debriefChain.map((step, i) => (
            <div key={i} className={s.chainItem}>
              <div className={s.chainNode}>{i + 1}</div>
              <div className={s.chainLabel}>{step}</div>
              {i < lab.debriefChain.length - 1 && <div className={s.chainArrow}>→</div>}
            </div>
          ))}
        </div>
      </div>

      <div className={s.row}>
        <div className={s.card}>
          <div className={s.cardTitle}>// MISSION STATS</div>
          <div className={s.stat}><span className={s.statKey}>Missions Completed</span><span className={s.statVal}>{lab.missions.filter((m) => completedMissions[m.id]).length}/5</span></div>
          <div className={s.stat}><span className={s.statKey}>XP Earned This Lab</span><span className={s.statVal}>{lab.missions.reduce((acc, m) => completedMissions[m.id] ? acc + m.xp : acc, 0)} XP</span></div>
          <div className={s.stat}><span className={s.statKey}>Total Platform XP</span><span className={s.statVal}>{totalXP.toLocaleString()} XP</span></div>
          <div className={s.stat}><span className={s.statKey}>Badges Earned</span><span className={s.statVal}>{badges.length}</span></div>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>// EARNED BADGES</div>
          <div className={s.badgeRow}>
            {lab.missions.map((m) => (
              <div key={m.id} className={`${s.badgeItem} ${completedMissions[m.id] ? s.badgeEarned : s.badgeLocked}`} title={m.badge.name}>
                <div className={s.badgeEmoji}>{completedMissions[m.id] ? m.badge.emoji : '🔒'}</div>
                <div className={s.badgeName}>{m.badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={s.actions}>
        <button className={s.certBtn} onClick={() => setView('certificates')}>🏆 VIEW CERTIFICATE</button>
        <button className={s.dashBtn} onClick={() => setView('dashboard')}>← RETURN TO HQ</button>
      </div>
    </div>
  );
}
