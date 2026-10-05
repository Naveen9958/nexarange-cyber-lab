// src/components/Mission/blocks/DeepfakeBlock.jsx — Forensic biometric deepfake analysis without answer spoilers
import s from './Blocks.module.css';

export default function DeepfakeBlock({ indicators = [] }) {
  return (
    <div className={s.block}>
      <div className={s.blockTitle}>🎭 DEEPFAKE FORENSIC ANALYSIS — cfo_call_final.mp4</div>
      <p className={s.blockHint}>
        Examine the forensic biometric indicators extracted from the video stream. Compare measured telemetry against physiological and physical baselines to identify anomalies.
      </p>

      <div className={s.dfVideoBox}>
        <div className={s.dfVideoInner}>
          <div className={s.dfPlayIcon}>⏵</div>
          <div className={s.dfLabel}>cfo_call_final.mp4 &nbsp;·&nbsp; 2:14 &nbsp;·&nbsp; UNDER ANALYSIS</div>
        </div>
        <div className={s.dfOverlay}>[FORENSIC MODE — BIOMETRIC TELEMETRY ISOLATION]</div>
      </div>

      <div className={s.dfGrid}>
        {indicators.map((ind, i) => (
          <div key={i} className={s.dfCard} style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6
            }}>
              <span className={s.dfIndicator}>{ind.label}</span>
              {ind.baseline && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)'
                }}>
                  {ind.baseline}
                </span>
              )}
            </div>
            <div className={s.dfValue} style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>
              {ind.value}
            </div>
            <div className={s.dfDetail}>{ind.detail}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 16,
        padding: '12px 16px',
        background: 'rgba(0, 212, 255, 0.05)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        💡 Forensic Task: Evaluate each telemetry vector against baseline limits. Count the total anomalous indicators and enter the count in the verification gate below.
      </div>
    </div>
  );
}
