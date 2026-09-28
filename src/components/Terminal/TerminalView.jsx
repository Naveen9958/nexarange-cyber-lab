// src/components/Terminal/TerminalView.jsx
import { useState } from 'react';
import { KALI_GLOBAL } from '../../data/labData';
import s from './TerminalView.module.css';

export default function TerminalView() {
  const [output, setOutput] = useState([
    { text: 'NexaRange Kali Linux v2026.09 — Operator: NAVEEN', cls: 'info' },
    { text: 'Type "help" for available commands.', cls: 'muted' },
  ]);
  const [cmd, setCmd] = useState('');
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);

  function run() {
    const c = cmd.trim();
    if (!c) return;
    const newHist = [c, ...history];
    setHistory(newHist);
    setHistIdx(-1);
    const out = [...output, { text: `naveen@nexarange:~$ ${c}`, cls: '' }];
    if (c === 'clear') { setOutput([]); setCmd(''); return; }
    const resp = KALI_GLOBAL[c] || KALI_GLOBAL[c.toLowerCase()];
    if (resp) {
      resp.split('\n').forEach((l) => out.push({ text: l, cls: l.includes('⚠') || l.includes('MALICIOUS') ? 'warn' : '' }));
    } else {
      out.push({ text: `bash: ${c.split(' ')[0]}: command not found`, cls: 'err' });
    }
    setOutput(out);
    setCmd('');
  }

  function onKey(e) {
    if (e.key === 'Enter') { run(); }
    else if (e.key === 'ArrowUp') {
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setCmd(history[next] || '');
    } else if (e.key === 'ArrowDown') {
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setCmd(next === -1 ? '' : history[next]);
    }
  }

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <div className={s.dots}>
          <span className={s.dot} style={{background:'#ff5f57'}}/>
          <span className={s.dot} style={{background:'#ffbd2e'}}/>
          <span className={s.dot} style={{background:'#28ca40'}}/>
        </div>
        <div className={s.title}>KALI LINUX TERMINAL — naveen@nexarange</div>
      </div>
      <div className={s.out}>
        {output.map((l, i) => (
          <div key={i} className={`${s.line} ${s[l.cls] || ''}`}>{l.text}</div>
        ))}
      </div>
      <div className={s.inputRow}>
        <span className={s.prompt}>naveen@nexarange:~$ </span>
        <input
          className={s.input}
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={onKey}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          placeholder=""
        />
      </div>
    </div>
  );
}
