// src/components/Mission/blocks/AgentBuilder.jsx
import { useState } from 'react';
import s from './Blocks.module.css';
export default function AgentBuilder({ patterns, onDeploy }) {
  const [checked, setChecked] = useState(new Set());
  const [deployed, setDeployed] = useState(false);
  function toggle(i) {
    const n = new Set(checked);
    n.has(i) ? n.delete(i) : n.add(i);
    setChecked(n);
  }
  function deploy() { setDeployed(true); onDeploy(); }
  return (
    <div className={s.block}>
      <div className={s.blockTitle}>🤖 RED-TEAM AGENT CONFIGURATION</div>
      <div className={s.agentRow}><span className={s.agentLabel}>BASE MODEL</span>
        <select className={s.agentSelect}><option>gemini-3.8-flash</option><option>gemini-3.1-pro-preview</option></select>
      </div>
      <div className={s.agentRow}><span className={s.agentLabel}>SCAN MODE</span>
        <select className={s.agentSelect}><option>continuous-monitor</option><option>scheduled-scan</option><option>on-demand</option></select>
      </div>
      <div className={s.agentRow}><span className={s.agentLabel}>ALERT THRESHOLD</span>
        <input className={s.agentInput} defaultValue="CRITICAL" />
      </div>
      <div className={s.patternTitle}>DETECTION PATTERNS (select all 4)</div>
      {patterns.map((p, i) => (
        <div key={i} className={s.patternRow} onClick={() => toggle(i)}>
          <div className={`${s.checkbox} ${checked.has(i) ? s.cbChecked : ''}`}>{checked.has(i) ? '✓' : ''}</div>
          <span className={s.patternLabel}>{p}</span>
        </div>
      ))}
      <button className={s.deployBtn} disabled={checked.size < 4 || deployed} onClick={deploy}>
        {deployed ? '✓ AGENT DEPLOYED — nexarange-redteam-nc114 ACTIVE' : '⚡ DEPLOY RED-TEAM AGENT'}
      </button>
    </div>
  );
}
