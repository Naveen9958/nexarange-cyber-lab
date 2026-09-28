// src/components/Mission/blocks/PolicyBlock.jsx
import s from './Blocks.module.css';
export default function PolicyBlock({ policies }) {
  return (
    <div className={s.block}>
      <div className={s.blockTitle}>🌐 NETWORK MICRO-SEGMENTATION POLICIES</div>
      <table className={s.table}>
        <thead><tr><th>POLICY ID</th><th>SOURCE</th><th>DESTINATION</th><th>ACTION</th><th>CONDITION</th></tr></thead>
        <tbody>
          {policies.map((p) => (
            <tr key={p.id} className={p.exception ? s.trException : ''}>
              <td>{p.id}</td><td>{p.src}</td><td>{p.dst}</td>
              <td className={p.action === 'ALLOW' ? s.allow : s.deny}>{p.action}</td>
              <td className={p.exception ? s.exception : ''}>{p.condition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
