// src/components/Boot/BootScreen.jsx
import { useState, useEffect } from 'react';
import { BOOT_LINES } from '../../data/labData';
import s from './BootScreen.module.css';

export default function BootScreen({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines((l) => [...l, BOOT_LINES[i]]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        i++;
      } else {
        clearInterval(id);
        setTimeout(onComplete, 600);
      }
    }, 170);
    return () => clearInterval(id);
  }, [onComplete]);

  return (
    <div className={s.boot}>
      <div className={s.content}>
        <div className={s.logo}>NEXARANGE</div>
        <div className={s.version}>// ELITE CYBER OPERATIONS PLATFORM v4.7.2 //</div>
        <div className={s.barWrap}>
          <div className={s.bar} style={{ width: `${progress}%` }} />
        </div>
        <div className={s.log}>
          {lines.map((l, i) => <div key={i}>{l}</div>)}
          <span className={s.cursor}>█</span>
        </div>
      </div>
      <div className={s.scanline} />
    </div>
  );
}
