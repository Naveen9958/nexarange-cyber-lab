// src/components/Mission/blocks/CryptoBlock.jsx
import s from './Blocks.module.css';
export default function CryptoBlock({ algorithms }) {
  return (
    <div className={s.block}>
      <div className={s.blockTitle}>🔐 CRYPTOGRAPHIC INVENTORY — NIST PQC ASSESSMENT</div>
      <table className={s.table}>
        <thead><tr><th>ALGORITHM</th><th>USAGE</th><th>QUANTUM STATUS</th><th>REPLACEMENT</th><th>STANDARD</th></tr></thead>
        <tbody>
          {algorithms.map((a) => (
            <tr key={a.name} className={a.vulnerable ? s.trException : ''}>
              <td>{a.name}</td><td>{a.usage}</td>
              <td className={a.vulnerable ? s.exception : s.allow}>{a.quantum}</td>
              <td style={{color:a.vulnerable?'var(--neon-cyan)':'var(--text-muted)'}}>{a.replacement}</td>
              <td style={{fontFamily:'var(--font-mono)',fontSize:'0.65rem',color:'var(--text-muted)'}}>{a.standard}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
