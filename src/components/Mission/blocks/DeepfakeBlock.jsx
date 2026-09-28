// src/components/Mission/blocks/DeepfakeBlock.jsx
import s from './Blocks.module.css';
export default function DeepfakeBlock({ indicators }) {
  const anomalyCount = indicators.filter((i) => i.anomaly).length;
  return (
    <div className={s.block}>
      <div className={s.blockTitle}>🎭 DEEPFAKE FORENSIC ANALYSIS — cfo_call_final.mp4</div>
      <div className={s.dfVideoBox}>
        <div className={s.dfVideoInner}>
          <div className={s.dfPlayIcon}>⏵</div>
          <div className={s.dfLabel}>cfo_call_final.mp4 &nbsp;·&nbsp; 2:14 &nbsp;·&nbsp; UNDER ANALYSIS</div>
        </div>
        <div className={s.dfOverlay}>[FORENSIC MODE — PLAYBACK RESTRICTED]</div>
      </div>
      <div className={s.dfGrid}>
        {indicators.map((ind, i) => (
          <div key={i} className={`${s.dfCard} ${ind.anomaly ? s.dfAnomaly : s.dfOk}`}>
            <div className={s.dfBadge}>{ind.anomaly ? 'ANOMALY' : 'NORMAL'}</div>
            <div className={s.dfIndicator}>{ind.label}</div>
            <div className={s.dfValue}>{ind.value}</div>
            <div className={s.dfDetail}>{ind.detail}</div>
          </div>
        ))}
      </div>
      <div className={s.dfSummary}>
        Anomalies detected: <span style={{color:'var(--neon-red)'}}>{anomalyCount}/6</span>
      </div>
    </div>
  );
}
