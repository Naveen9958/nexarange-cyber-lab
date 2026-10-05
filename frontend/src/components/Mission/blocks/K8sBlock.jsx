// src/components/Mission/blocks/K8sBlock.jsx — Realistic Kubernetes workload inspection
import { useState } from 'react';
import s from './Blocks.module.css';

export default function K8sBlock({ pods = [], termCmds }) {
  const [termOut, setTermOut] = useState([
    { text: 'vortex-prod-gke-us-east1 — kubectl v1.28.4 ready', cls: 'info' }
  ]);
  const [cmd, setCmd] = useState('');

  function runCmd(e) {
    if (e.key !== 'Enter') return;
    const c = cmd.trim();
    if (!c) return;
    const out = [...termOut, { text: `$ ${c}`, cls: '' }];
    const resp = termCmds?.[c] || termCmds?.[c.toLowerCase()];
    if (resp) {
      resp.split('\n').forEach((l) => out.push({ text: l, cls: '' }));
    } else if (c === 'clear') {
      setTermOut([]);
      setCmd('');
      return;
    } else {
      out.push({ text: `Error: unknown command "${c.split(' ')[0]}"`, cls: 'err' });
    }
    setTermOut(out);
    setCmd('');
  }

  return (
    <div className={s.block}>
      <div className={s.blockTitle}>☸️ KUBERNETES CLUSTER — POD WORKLOAD AUDIT</div>
      <p className={s.blockHint}>
        Inspect running workloads across all cluster namespaces. Use kubectl terminal commands to describe anomalous pods and extract container environment configurations.
      </p>

      <table className={s.table}>
        <thead>
          <tr>
            <th>POD NAME</th>
            <th>NAMESPACE</th>
            <th>IMAGE</th>
            <th>STATUS</th>
            <th>GPU ALLOCATION</th>
          </tr>
        </thead>
        <tbody>
          {pods.map((p) => (
            <tr key={p.name}>
              <td style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>{p.name}</td>
              <td>{p.namespace}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{p.image}</td>
              <td className={s.allow}>{p.status}</td>
              <td>{p.gpu || '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={s.miniTerm}>
        <div className={s.miniTermHeader}>
          <span className={s.dot} style={{ background: '#ff5f57' }} />
          <span className={s.dot} style={{ background: '#ffbd2e' }} />
          <span className={s.dot} style={{ background: '#28ca40' }} />
          <span className={s.termLabel}>KUBECTL SHELL (vortex-prod-gke-us-east1)</span>
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
            placeholder="kubectl get pods --all-namespaces, kubectl describe pod <name> -n <ns>..."
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
