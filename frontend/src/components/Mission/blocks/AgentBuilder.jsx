// src/components/Mission/blocks/AgentBuilder.jsx — Red-team agent builder with attack-chain rule verification
import { useState } from 'react';
import s from './Blocks.module.css';

export default function AgentBuilder({ patterns = [], onDeploy }) {
  const [checked, setChecked] = useState(new Set());
  const [deployed, setDeployed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function toggle(i) {
    if (deployed) return;
    const n = new Set(checked);
    n.has(i) ? n.delete(i) : n.add(i);
    setChecked(n);
    setErrorMsg('');
  }

  function deploy() {
    // Validate that the user selected ONLY the true attack vectors and no distractors
    const correctIndices = [];
    patterns.forEach((p, idx) => {
      const isCorrect = typeof p === 'object' ? p.isCorrect : !p.includes('DDoS') && !p.includes('SQL') && !p.includes('Bluetooth');
      if (isCorrect) correctIndices.push(idx);
    });

    const userSelected = Array.from(checked);
    const hasAllCorrect = correctIndices.every((idx) => checked.has(idx));
    const hasNoDistractors = userSelected.length === correctIndices.length;

    if (!hasAllCorrect || !hasNoDistractors) {
      setErrorMsg(
        'KILLCHAIN MISMATCH: The agent must ONLY include the 4 verified attack vectors uncovered in Case NC-114. Remove unrelated attack signatures.'
      );
      return;
    }

    setDeployed(true);
    setErrorMsg('');
    onDeploy();
  }

  return (
    <div className={s.block}>
      <div className={s.blockTitle}>🤖 RED-TEAM AI DEFENSE AGENT CONFIGURATION</div>
      <p className={s.blockHint}>
        Select only the verified attack patterns discovered throughout the NC-114 incident investigation (Missions 1–4). Avoid irrelevant perimeter noise.
      </p>

      <div className={s.agentRow}>
        <span className={s.agentLabel}>BASE MODEL</span>
        <select className={s.agentSelect}>
          <option>gemini-3.8-flash</option>
          <option>gemini-3.1-pro-preview</option>
        </select>
      </div>

      <div className={s.agentRow}>
        <span className={s.agentLabel}>SCAN MODE</span>
        <select className={s.agentSelect}>
          <option>continuous-monitor</option>
          <option>scheduled-scan</option>
          <option>on-demand</option>
        </select>
      </div>

      <div className={s.agentRow}>
        <span className={s.agentLabel}>ALERT THRESHOLD</span>
        <input className={s.agentInput} defaultValue="CRITICAL" readOnly />
      </div>

      <div className={s.patternTitle}>
        ATTACK DETECTION PATTERNS (SELECT 4 VERIFIED INCIDENT VECTORS)
      </div>

      {patterns.map((p, i) => {
        const label = typeof p === 'object' ? p.text : p;
        return (
          <div key={i} className={s.patternRow} onClick={() => toggle(i)}>
            <div className={`${s.checkbox} ${checked.has(i) ? s.cbChecked : ''}`}>
              {checked.has(i) ? '✓' : ''}
            </div>
            <span className={s.patternLabel}>{label}</span>
          </div>
        );
      })}

      {errorMsg && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          background: 'rgba(255, 51, 102, 0.12)',
          border: '1px solid rgba(255, 51, 102, 0.4)',
          borderRadius: 'var(--radius)',
          color: 'var(--neon-red)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          lineHeight: 1.5
        }}>
          ⚠ {errorMsg}
        </div>
      )}

      <button
        className={s.deployBtn}
        disabled={checked.size === 0 || deployed}
        onClick={deploy}
      >
        {deployed
          ? '✓ AGENT DEPLOYED — nexarange-redteam-nc114 ACTIVE'
          : `⚡ DEPLOY RED-TEAM AGENT (${checked.size} SELECTED)`}
      </button>
    </div>
  );
}
