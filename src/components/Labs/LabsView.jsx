// src/components/Labs/LabsView.jsx
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import s from './LabsView.module.css';

export default function LabsView() {
  const { openMission, completedMissions } = useStore();
  return (
    <div className={s.wrap}>
      {[1, 2].map((labId) => {
        const lab = LAB_DATA[labId];
        const c = lab.color;
        const neon = `var(--neon-${c})`;
        return (
          <div key={labId} className={s.labSection}>
            <div className={s.labHeader}>
              <div className={s.labHeaderLeft}>
                <div className={s.labNum} style={{ color: neon }}>LAB 0{labId}</div>
                <div className={s.labTitle}>{lab.title}</div>
                <div className={s.labMeta}>{lab.company} · {lab.caseId} · {lab.role}</div>
              </div>
              <div className={s.labHeaderRight}>
                <div className={s.totalXP} style={{ color: neon }}>{lab.totalXP} XP</div>
                <div className={s.track}>{lab.subtitle}</div>
              </div>
            </div>
            <div className={s.missionChain}>
              {lab.missions.map((m, i) => {
                const done = !!completedMissions[m.id];
                const prevDone = i === 0 || !!completedMissions[lab.missions[i - 1].id];
                const locked = !prevDone;
                return (
                  <div
                    key={m.id}
                    className={`${s.missionCard} ${done ? s.mDone : ''} ${locked ? s.mLocked : ''}`}
                    onClick={() => !locked && openMission(labId, i)}
                  >
                    <div className={s.mNum} style={{ color: done ? neon : locked ? 'var(--text-muted)' : neon }}>
                      {done ? '✓' : locked ? '🔒' : `M${m.num}`}
                    </div>
                    <div className={s.mInfo}>
                      <div className={s.mTitle} style={{ color: done ? neon : 'var(--text-primary)' }}>{m.title}</div>
                      <div className={s.mMeta}>
                        <span className={s.mPartner}>{m.partner.name}</span>
                        <span className={s.mXP} style={{ color: neon }}>+{m.xp} XP</span>
                        <span className={s.mBadge}>{m.badge.emoji} {m.badge.name}</span>
                      </div>
                    </div>
                    {!locked && !done && <div className={s.launchBtn} style={{ color: neon }}>ENTER ➜</div>}
                    {done && <div className={s.doneTag} style={{ borderColor: neon, color: neon }}>COMPLETE</div>}
                    {locked && <div className={s.lockTag}>LOCKED</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
