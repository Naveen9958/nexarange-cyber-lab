// src/components/Leaderboard/Leaderboard.jsx
import { LEADERBOARD } from '../../data/labData';
import s from './Leaderboard.module.css';

export default function Leaderboard() {
  const podium = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);
  const me = LEADERBOARD.find((e) => e.isMe);

  return (
    <div className={s.wrap}>
      <div className={s.title}>// GLOBAL LEADERBOARD</div>
      {/* Podium */}
      <div className={s.podium}>
        {[podium[1], podium[0], podium[2]].map((p, pi) => {
          const heights = ['140px', '180px', '120px'];
          const colors = ['#c0c0c0', '#ffd700', '#cd7f32'];
          const ranks = ['2nd', '1st', '3rd'];
          return (
            <div key={p.rank} className={s.podiumCol}>
              <div className={s.podiumAvatar} style={{ borderColor: colors[pi] }}>{p.avatar}</div>
              <div className={s.podiumName}>{p.name}</div>
              <div className={s.podiumXP} style={{ color: colors[pi] }}>{p.xp.toLocaleString()} XP</div>
              <div className={s.podiumBase} style={{ height: heights[pi], borderColor: colors[pi], background: `${colors[pi]}11` }}>
                <div className={s.podiumRankLabel} style={{ color: colors[pi] }}>{ranks[pi]}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* List */}
      <div className={s.list}>
        <div className={`${s.row} ${s.rowHead}`}>
          <span>RANK</span><span>OPERATOR</span><span>TRACK</span><span>XP</span>
        </div>
        {rest.map((e) => (
          <div key={e.rank} className={`${s.row} ${e.isMe ? s.rowMe : ''}`}>
            <span className={s.rank}>#{e.rank}</span>
            <span className={s.name}>{e.name} {e.isMe && <span className={s.meBadge}>YOU</span>}</span>
            <span className={s.track}>{e.track}</span>
            <span className={s.xp}>{e.xp.toLocaleString()} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
