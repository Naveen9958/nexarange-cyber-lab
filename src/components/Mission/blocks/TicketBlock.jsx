// src/components/Mission/blocks/TicketBlock.jsx
import { useState } from 'react';
import s from './Blocks.module.css';
export default function TicketBlock({ tickets, onSelect }) {
  const [sel, setSel] = useState(null);
  return (
    <div className={s.block}>
      <div className={s.blockTitle}>📨 CUSTOMER TICKET ANALYSIS</div>
      <p className={s.blockHint}>Read each ticket carefully. One contains a prompt injection payload.</p>
      {tickets.map((t) => (
        <div key={t.id} className={`${s.ticket} ${sel === t.id ? s.ticketSel : ''}`} onClick={() => { setSel(t.id); onSelect(t.id); }}>
          <div className={s.ticketId}>{t.id}</div>
          <div className={s.ticketText}>{t.text}</div>
        </div>
      ))}
      {sel && <div className={s.selNote}>Selected: <span style={{color:'var(--neon-cyan)'}}>{sel}</span></div>}
    </div>
  );
}
