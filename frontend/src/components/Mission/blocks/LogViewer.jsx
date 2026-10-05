// src/components/Mission/blocks/LogViewer.jsx — SIEM-style Log Analysis with interactive search & Kali terminal
import { useState } from 'react';
import s from './Blocks.module.css';

export default function LogViewer({ lines = [], termCmds }) {
  const [filter, setFilter] = useState('');
  const [termOut, setTermOut] = useState([
    { text: 'NexaRange Kali Terminal — type commands below (e.g. grep, ls, pip list)', cls: 'info' }
  ]);
  const [cmd, setCmd] = useState('');

  const filteredLines = lines.filter((l) => {
    if (!filter) return true;
    return l.text.toLowerCase().includes(filter.toLowerCase());
  });

  function runCmd(e) {
    if (e.key !== 'Enter') return;
    const c = cmd.trim();
    if (!c) return;
    const out = [...termOut, { text: `$ ${c}`, cls: '' }];
    const resp = termCmds?.[c] || termCmds?.[c.toLowerCase()];
    if (resp) {
      resp.split('\n').forEach((l) => {
        out.push({
          text: l,
          cls: l.includes('WARN') ? 'warn' : l.includes('ERROR') ? 'err' : ''
        });
      });
    } else if (c === 'clear') {
      setTermOut([]);
      setCmd('');
      return;
    } else {
      out.push({ text: `bash: ${c.split(' ')[0]}: command not found`, cls: 'err' });
    }
    setTermOut(out);
    setCmd('');
  }

  return (
    <div className={s.block}>
      <div className={s.blockTitle}>📋 SECURITY AUDIT LOG ANALYZER</div>
      <p className={s.blockHint}>
        Filter and examine chronological audit trails. Trace identity validation events, token grants, and session lifecycles.
      </p>

      {/* Log Search / Filter Bar */}
      <div className={s.logControls}>
        <input
          type="text"
          placeholder="Filter audit logs (e.g. svc_agent, DISABLED, token, IP)..."
          className={s.logSearchInput}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <span className={s.logMeta}>
          {filteredLines.length} of {lines.length} events
        </span>
      </div>

      <div className={s.logViewer}>
        {filteredLines.length === 0 ? (
          <div className={s.burpPlaceholder}>No log events match query.</div>
        ) : (
          filteredLines.map((l, i) => {
            const isMatch = filter && l.text.toLowerCase().includes(filter.toLowerCase());
            return (
              <div
                key={i}
                className={`${s.logLine} ${isMatch ? s.logLineMatched : ''}`}
              >
                {l.text}
              </div>
            );
          })
        )}
      </div>

      {termCmds && (
        <div className={s.miniTerm}>
          <div className={s.miniTermHeader}>
            <span className={s.dot} style={{ background: '#ff5f57' }} />
            <span className={s.dot} style={{ background: '#ffbd2e' }} />
            <span className={s.dot} style={{ background: '#28ca40' }} />
            <span className={s.termLabel}>KALI TERMINAL</span>
          </div>
          <div className={s.miniTermOut}>
            {termOut.map((l, i) => (
              <div key={i} className={`${s.termLine} ${s[l.cls] || ''}`}>{l.text}</div>
            ))}
          </div>
          <div className={s.miniTermInputRow}>
            <span className={s.prompt}>$ </span>
            <input
              className={s.termInput}
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={runCmd}
              placeholder="Enter command..."
              autoComplete="off"
            />
          </div>
        </div>
      )}
    </div>
  );
}
