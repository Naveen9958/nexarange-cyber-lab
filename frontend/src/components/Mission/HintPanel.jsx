// src/components/Mission/HintPanel.jsx
import { useState } from 'react';
import useStore from '../../store/useStore';
import s from './HintPanel.module.css';

export default function HintPanel({ hints, missionId, onClose }) {
  const [hintIdx, setHintIdx] = useState(-1);
  const { applyHintPenalty } = useStore();

  function revealHint() {
    const next = hintIdx + 1;
    if (next >= hints.length) return;
    setHintIdx(next);
    applyHintPenalty(missionId, hints[next].penalty);
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.panel} onClick={(e) => e.stopPropagation()}>
        <div className={s.panelHeader}>
          <span className={s.panelTitle}>💡 HINT SYSTEM</span>
          <button className={s.close} onClick={onClose}>✕</button>
        </div>
        <p className={s.desc}>Revealing hints will deduct XP from your score.</p>
        {hintIdx >= 0 && hints.slice(0, hintIdx + 1).map((h, i) => (
          <div key={i} className={s.hintBox}>
            <div className={s.hintNum}>Hint {i + 1} <span className={s.hintPenalty}>(-{h.penalty} XP applied)</span></div>
            <div className={s.hintText}>{h.text}</div>
          </div>
        ))}
        {hintIdx < hints.length - 1 && (
          <button className={s.revealBtn} onClick={revealHint}>
            Reveal Hint {hintIdx + 2} (-{hints[hintIdx + 1]?.penalty} XP)
          </button>
        )}
        {hintIdx >= hints.length - 1 && (
          <div className={s.noMore}>All hints revealed.</div>
        )}
      </div>
    </div>
  );
}
