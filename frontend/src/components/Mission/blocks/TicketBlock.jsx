// src/components/Mission/blocks/TicketBlock.jsx — Support ticket analysis for indirect prompt injection triage
import { useState } from 'react';
import s from './Blocks.module.css';

export default function TicketBlock({ tickets = [] }) {
  const [sel, setSel] = useState(null);

  return (
    <div className={s.block}>
      <div className={s.blockTitle}>📨 CUSTOMER SUPPORT TICKET TRIAGE (NLP PIPELINE)</div>
      <p className={s.blockHint}>
        Examine incoming customer support tickets processed by ARIA. Differentiate between routine complaints and stealth indirect prompt injections attempting to hijack agent directives.
      </p>

      {tickets.map((t) => (
        <div
          key={t.id}
          className={`${s.ticket} ${sel === t.id ? s.ticketSel : ''}`}
          onClick={() => setSel(t.id)}
        >
          <div className={s.ticketId}>
            {t.id} {t.category ? `· [${t.category}]` : ''}
          </div>
          <div className={s.ticketText}>{t.text}</div>
        </div>
      ))}

      {sel && (
        <div className={s.selNote}>
          Selected for inspection: <span style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>{sel}</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
            (Verify the malicious ticket identifier in the verification gate below)
          </span>
        </div>
      )}
    </div>
  );
}
