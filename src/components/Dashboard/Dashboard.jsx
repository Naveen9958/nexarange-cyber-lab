// src/components/Dashboard/Dashboard.jsx
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import s from './Dashboard.module.css';

export default function Dashboard() {
  const { totalXP, badges, completedMissions, openMission, setView, setLab } = useStore();
  const completedCount = Object.keys(completedMissions).length;

  const lab1Done = LAB_DATA[1].missions.filter((m) => completedMissions[m.id]).length;
  const lab2Done = LAB_DATA[2].missions.filter((m) => completedMissions[m.id]).length;

  function handleLaunch(labId) {
    const lab = LAB_DATA[labId];
    const idx = lab.missions.findIndex((m) => !completedMissions[m.id]);
    openMission(labId, idx === -1 ? 0 : idx);
  }

  return (
    <div className={s.grid}>
      {/* Hero */}
      <div className={s.hero}>
        <div className={s.heroGlitch} data-text="CYBER RANGE">CYBER RANGE</div>
        <div className={s.heroSub}>ACTIVE OPERATIONS: <span className="neon-cyan">2 TRACKS AVAILABLE</span></div>
        <div className={s.ticker}>
          <div className={s.tickerInner}>
            ⚡ 1,247 operators active globally &nbsp;//&nbsp; 🔴 THREAT LEVEL: CRITICAL &nbsp;//&nbsp;
            🏅 0XSHADOW earned Case VC-233 Closed &nbsp;//&nbsp; 📡 Lab 01 Mission 2 completion: 73%
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {[
        { icon: '⚡', val: totalXP.toLocaleString(), label: 'TOTAL XP', pct: Math.min((totalXP / 2000) * 100, 100), color: 'green' },
        { icon: '🎯', val: `${completedCount}/10`, label: 'MISSIONS COMPLETE', pct: (completedCount / 10) * 100, color: 'cyan' },
        { icon: '🏅', val: badges.length, label: 'BADGES EARNED', pct: (badges.length / 12) * 100, color: 'purple' },
        { icon: '🌐', val: '#247', label: 'GLOBAL RANK', pct: 60, color: 'red' },
      ].map((c) => (
        <div className={s.statCard} key={c.label}>
          <div className={s.statIcon}>{c.icon}</div>
          <div className={s.statVal} style={{ color: `var(--neon-${c.color})` }}>{c.val}</div>
          <div className={s.statLabel}>{c.label}</div>
          <div className={s.bar}>
            <div className={s.barFill} style={{ width: `${c.pct}%`, background: `var(--neon-${c.color})`, boxShadow: `0 0 6px var(--neon-${c.color})` }} />
          </div>
        </div>
      ))}

      {/* Lab 1 Card */}
      <LabCard
        lab={LAB_DATA[1]}
        done={lab1Done}
        onLaunch={() => handleLaunch(1)}
        onDetails={() => { setLab(1); setView('labs'); }}
      />
      {/* Lab 2 Card */}
      <LabCard
        lab={LAB_DATA[2]}
        done={lab2Done}
        onLaunch={() => handleLaunch(2)}
        onDetails={() => { setLab(2); setView('labs'); }}
      />

      {/* Activity */}
      <div className={s.panel}>
        <div className={s.panelTitle}>// RECENT INTELLIGENCE</div>
        {[
          { time: '14:07:31', msg: '🟢 New threat vector identified in Lab 01' },
          { time: '13:55:12', msg: '🔵 Leaderboard updated — global sync complete' },
          { time: '13:42:05', msg: '🟣 Farah Sheikh briefing package ready' },
          { time: '13:30:00', msg: '🔴 MCP server anomaly detected — mission 2 hot' },
        ].map((a) => (
          <div className={s.actItem} key={a.time}>
            <span className={s.actTime}>{a.time}</span>
            <span className={s.actMsg}>{a.msg}</span>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className={s.panel}>
        <div className={s.panelTitle}>// EARNED BADGES</div>
        <div className={s.badgeGrid}>
          {badges.length === 0 ? (
            <div className={s.badgeEmpty}>Complete missions to unlock badges.</div>
          ) : badges.map((b, i) => (
            <div className={s.badgeItem} key={i} title={b.name}>
              <div className={s.badgeEmoji}>{b.emoji}</div>
              <div className={s.badgeName}>{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LabCard({ lab, done, onLaunch, onDetails }) {
  const c = lab.color;
  const neon = `var(--neon-${c})`;
  return (
    <div className={s.labCard} style={{ borderColor: `rgba(${c === 'green' ? '0,255,170' : '0,212,255'},0.25)` }} onClick={onDetails}>
      <div className={s.labCardHeader}>
        <span className={s.labTrackTag} style={{ color: neon, borderColor: `rgba(${c === 'green' ? '0,255,170' : '0,212,255'},0.3)` }}>
          {lab.subtitle.toUpperCase()}
        </span>
        <span className={s.labStatusTag} style={{ color: neon }}>● ACTIVE</span>
      </div>
      <div className={s.labId} style={{ color: neon, opacity: 0.6 }}>LAB 0{lab.id}</div>
      <div className={s.labTitle} style={{ color: lab.id === 1 ? 'var(--text-primary)' : neon }}>{lab.title}</div>
      <div className={s.labMeta}>📍 {lab.company} &nbsp;·&nbsp; 🎭 {lab.role}</div>
      <div className={s.labDesc}>{lab.id === 1
        ? 'An advanced persistent AI threat has infiltrated NexaCorp\'s agentic infrastructure. Neutralize five attack vectors before the rogue agent escalates access.'
        : 'A deepfake CFO call triggered a $47M wire transfer. Trace the attack chain from poisoned ML libraries to quantum-vulnerable cryptography.'
      }</div>
      <div className={s.labFooter}>
        <div className={s.labProg}>
          <div className={s.labProgLabel}>MISSION PROGRESS</div>
          <div className={s.labProgBar}><div className={s.labProgFill} style={{ width: `${(done / 5) * 100}%`, background: neon, boxShadow: `0 0 8px ${neon}` }} /></div>
          <div className={s.labProgText}>{done}/5 Missions</div>
        </div>
        <div className={s.labXP} style={{ color: neon }}>{lab.totalXP} XP</div>
      </div>
      <button
        className={s.labBtn}
        style={{ color: neon, borderColor: `rgba(${c === 'green' ? '0,255,170' : '0,212,255'},0.4)` }}
        onClick={(e) => { e.stopPropagation(); onLaunch(); }}
      >
        LAUNCH MISSION
      </button>
    </div>
  );
}
