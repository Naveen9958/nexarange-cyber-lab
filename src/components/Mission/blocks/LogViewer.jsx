// src/components/Mission/blocks/LogViewer.jsx
import { useState } from 'react';
import s from './Blocks.module.css';

export default function LogViewer({ lines, termCmds, missionId }) {
  const [termOut, setTermOut] = useState([
    { text: 'NexaRange Kali Terminal — type commands below', cls: 'info' }
  ]);
  const [cmd, setCmd] = useState('');

  function runCmd(e) {
    if (e.key !== 'Enter') return;
    const c = cmd.trim();
    if (!c) return;
    const out = [...termOut, { text: `$ ${c}`, cls: '' }];
    const resp = termCmds?.[c] || termCmds?.[c.toLowerCase()];
    if (resp) {
      resp.split('\n').forEach((l) => out.push({ text: l, cls: l.includes('⚠') || l.includes('WARN') || l.includes('MALICIOUS') ? 'warn' : '' }));
    } else if (c === 'clear') {
      setTermOut([]); setCmd(''); return;
    } else {
      out.push({ text: `bash: ${c.split(' ')[0]}: command not found`, cls: 'err' });
    }
    setTermOut(out);
    setCmd('');
  }

  return (
    <div className={s.block}>
      <div className={s.blockTitle}>📋 RAW LOG ANALYSIS</div>
      <div className={s.logViewer}>
        {lines.map((l, i) => (
          <div key={i} className={`${s.logLine} ${l.highlight ? s.logHighlight : ''}`}>{l.text}</div>
        ))}
      </div>
      {termCmds && (
        <div className={s.miniTerm}>
          <div className={s.miniTermHeader}>
            <span className={s.dot} style={{background:'#ff5f57'}} />
            <span className={s.dot} style={{background:'#ffbd2e'}} />
            <span className={s.dot} style={{background:'#28ca40'}} />
            <span className={s.termLabel}>KALI TERMINAL</span>
          </div>
          <div className={s.miniTermOut}>
            {termOut.map((l, i) => (
              <div key={i} className={`${s.termLine} ${s[l.cls]}`}>{l.text}</div>
            ))}
          </div>
          <div className={s.miniTermInputRow}>
            <span className={s.prompt}>$ </span>
            <input className={s.termInput} value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={runCmd} placeholder="Enter command..." autoComplete="off" />
          </div>
        </div>
      )}
    </div>
  );
}
