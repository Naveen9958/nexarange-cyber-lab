// src/components/Mission/blocks/PolicyBlock.jsx — Zero Trust microsegmentation policy audit
import s from './Blocks.module.css';

export default function PolicyBlock({ policies = [] }) {
  return (
    <div className={s.block}>
      <div className={s.blockTitle}>🌐 ZERO TRUST MICRO-SEGMENTATION POLICIES (ENCLAVE V3.2)</div>
      <p className={s.blockHint}>
        Audit active east-west lateral movement and egress policies. Identify the flawed rule permitting AI agents to access internal tiers without strict cryptographic attestation.
      </p>
      <table className={s.table}>
        <thead>
          <tr>
            <th>POLICY ID</th>
            <th>SOURCE ENCLAVE</th>
            <th>DESTINATION ZONE</th>
            <th>ACTION</th>
            <th>SECURITY CONDITION / ATTESTATION</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((p) => (
            <tr key={p.id}>
              <td style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>{p.id}</td>
              <td>{p.src}</td>
              <td>{p.dst}</td>
              <td className={p.action === 'ALLOW' ? s.allow : s.deny}>{p.action}</td>
              <td>{p.condition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
