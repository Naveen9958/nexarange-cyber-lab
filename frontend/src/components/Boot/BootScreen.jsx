// src/components/Boot/BootScreen.jsx — High-tech Enclave Initialization
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
        setTimeout(onComplete, 500);
      }
    }, 140);

    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        clearInterval(id);
        onComplete();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearInterval(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [onComplete]);

  return (
    <div className={s.boot}>
      <div className={s.content}>
        <div className={s.logo}>NEXARANGE</div>
        <div className={s.version}>// CYBER SECURITY & AI DEFENSE PLATFORM v2.6 //</div>

        <div className={s.barWrap}>
          <div className={s.bar} style={{ width: `${progress}%` }} />
        </div>

        <div className={s.log}>
          {lines.map((l, i) => (
            <div key={i} className={s.logLine}>{l}</div>
          ))}
          <span className={s.cursor}>_</span>
        </div>

        <button className={s.skipBtn} onClick={onComplete}>
          SKIP BOOT SEQUENCE [ESC / SPACE]
        </button>
      </div>
    </div>
  );
}
