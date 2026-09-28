// src/components/Layout/TopBar.jsx
import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import s from './TopBar.module.css';

const BREADCRUMBS = {
  dashboard: '// COMMAND CENTER',
  labs: '// ACTIVE OPERATIONS',
  terminal: '// HACKER TERMINAL',
  leaderboard: '// GLOBAL LEADERBOARD',
  friends: '// SQUAD NETWORK',
  analytics: '// PERFORMANCE ANALYTICS',
  certificates: '// CREDENTIALS VAULT',
  mission: '// ACTIVE MISSION',
  debrief: '// CASE DEBRIEF',
};

export default function TopBar() {
  const { view, totalXP } = useStore();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className={s.topbar}>
      <div className={s.breadcrumb}>{BREADCRUMBS[view] || `// ${view.toUpperCase()}`}</div>
      <div className={s.right}>
        <div className={s.xp}>
          <span className={s.xpLabel}>XP</span>
          <span className={s.xpValue}>{totalXP.toLocaleString()}</span>
        </div>
        <div className={s.dot} />
        <div className={s.threat}>THREAT LVL: <span className={s.threatVal}>CRITICAL</span></div>
        <div className={s.clock}>{time}</div>
      </div>
    </header>
  );
}
