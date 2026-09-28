// src/components/Analytics/AnalyticsView.jsx
import { useEffect, useRef } from 'react';
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import s from './AnalyticsView.module.css';

export default function AnalyticsView() {
  const { completedMissions, totalXP, badges } = useStore();
  const radarRef = useRef(null);
  const xpRef = useRef(null);

  const completedCount = Object.keys(completedMissions).length;

  // Radar chart
  useEffect(() => {
    const canvas = radarRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 130, cy = 130, r = 100;
    const skills = ['AI Security', 'Cloud Infra', 'Forensics', 'Cryptography', 'Networking', 'Kubernetes'];
    const pct = [
      completedMissions['m1_1'] || completedMissions['m1_2'] ? 0.7 : 0.1,
      completedMissions['m2_1'] || completedMissions['m2_3'] ? 0.65 : 0.1,
      completedMissions['m2_4'] ? 0.8 : 0.1,
      completedMissions['m2_5'] ? 0.75 : 0.1,
      completedMissions['m1_4'] ? 0.6 : 0.1,
      completedMissions['m2_3'] ? 0.7 : 0.1,
    ];
    const step = (Math.PI * 2) / skills.length;
    ctx.clearRect(0, 0, 260, 260);
    // Grid rings
    [0.25, 0.5, 0.75, 1].forEach((f) => {
      ctx.beginPath();
      skills.forEach((_, i) => {
        const a = i * step - Math.PI / 2;
        const x = cx + r * f * Math.cos(a), y = cy + r * f * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0,212,255,0.15)';
      ctx.stroke();
    });
    // Spokes
    skills.forEach((_, i) => {
      const a = i * step - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      ctx.strokeStyle = 'rgba(0,212,255,0.15)';
      ctx.stroke();
    });
    // Data polygon
    ctx.beginPath();
    pct.forEach((v, i) => {
      const a = i * step - Math.PI / 2;
      const x = cx + r * v * Math.cos(a), y = cy + r * v * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,255,170,0.12)';
    ctx.fill();
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Labels
    ctx.fillStyle = 'rgba(122,155,196,0.9)';
    ctx.font = '10px Share Tech Mono';
    ctx.textAlign = 'center';
    skills.forEach((sk, i) => {
      const a = i * step - Math.PI / 2;
      ctx.fillText(sk, cx + (r + 18) * Math.cos(a), cy + (r + 18) * Math.sin(a) + 4);
    });
  }, [completedMissions]);

  // XP chart
  useEffect(() => {
    const canvas = xpRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { l: 40, r: 20, t: 20, b: 30 };
    const all = [...LAB_DATA[1].missions, ...LAB_DATA[2].missions];
    let running = 0;
    const pts = [{ label: 'Start', xp: 0 }, ...all.map((m) => {
      if (completedMissions[m.id]) running += m.xp;
      return { label: m.num, xp: running };
    })];
    const maxXP = 2000;
    const toX = (i) => pad.l + ((w - pad.l - pad.r) / (pts.length - 1)) * i;
    const toY = (v) => h - pad.b - ((h - pad.t - pad.b) * v / maxXP);
    ctx.clearRect(0, 0, w, h);
    // Fill
    ctx.beginPath();
    pts.forEach((p, i) => { const x = toX(i), y = toY(p.xp); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.lineTo(toX(pts.length - 1), h - pad.b);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,255,170,0.08)';
    ctx.fill();
    // Line
    ctx.beginPath();
    pts.forEach((p, i) => { const x = toX(i), y = toY(p.xp); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Dots
    pts.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(toX(i), toY(p.xp), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00ffaa';
      ctx.fill();
    });
    // Labels
    ctx.fillStyle = 'rgba(122,155,196,0.8)';
    ctx.font = '9px Share Tech Mono';
    ctx.textAlign = 'center';
    pts.forEach((p, i) => ctx.fillText(p.label, toX(i), h - pad.b + 14));
  }, [completedMissions]);

  return (
    <div className={s.wrap}>
      <div className={s.row}>
        <div className={s.card}>
          <div className={s.cardTitle}>SKILL RADAR</div>
          <canvas ref={radarRef} width={260} height={260} />
        </div>
        <div className={s.card} style={{ flex: 2 }}>
          <div className={s.cardTitle}>XP PROGRESSION</div>
          <canvas ref={xpRef} width={480} height={260} />
        </div>
      </div>

      <div className={s.row}>
        <div className={s.card}>
          <div className={s.cardTitle}>// STRENGTHS</div>
          {[['AI Threat Analysis', '87%'], ['Supply Chain Security', '74%'], ['Forensic Investigation', '69%']].map(([skill, val]) => (
            <div key={skill} className={s.metricRow}>
              <span className={s.metricLabel}>{skill}</span>
              <div className={s.metricBar}><div className={s.metricFill} style={{ width: val, background: 'var(--neon-green)', boxShadow: '0 0 4px var(--neon-green)' }} /></div>
              <span className={s.metricVal} style={{ color: 'var(--neon-green)' }}>{val}</span>
            </div>
          ))}
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>// IMPROVEMENTS</div>
          {[['Kubernetes Security', '42%'], ['Cryptography Depth', '38%'], ['Zero Trust Design', '31%']].map(([skill, val]) => (
            <div key={skill} className={s.metricRow}>
              <span className={s.metricLabel}>{skill}</span>
              <div className={s.metricBar}><div className={s.metricFill} style={{ width: val, background: 'var(--neon-orange)', boxShadow: '0 0 4px var(--neon-orange)' }} /></div>
              <span className={s.metricVal} style={{ color: 'var(--neon-orange)' }}>{val}</span>
            </div>
          ))}
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>// SESSION STATS</div>
          {[
            ['Total XP', `${totalXP.toLocaleString()} XP`],
            ['Missions Complete', `${completedCount}/10`],
            ['Badges Earned', badges.length],
            ['Global Rank', '#247'],
          ].map(([k, v]) => (
            <div key={k} className={s.statRow}>
              <span className={s.statKey}>{k}</span>
              <span className={s.statVal}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
