// src/components/Mission/blocks/BurpBlock.jsx
import { useState } from 'react';
import s from './Blocks.module.css';

export default function BurpBlock({ requests }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className={s.block}>
      <div className={s.blockTitle}>🔍 BURP SUITE — HTTP INTERCEPT</div>
      <div className={s.burpWrap}>
        <div className={s.burpTable}>
          <div className={`${s.burpRow} ${s.burpHead}`}>
            <span>#</span><span>HOST</span><span>METHOD</span><span>PATH</span><span>STATUS</span>
          </div>
          {requests.map((r, i) => (
            <div key={r.id} className={`${s.burpRow} ${selected === i ? s.burpSelected : ''}`} onClick={() => setSelected(i)}>
              <span>{i + 1}</span>
              <span>{r.host}</span>
              <span className={r.method === 'POST' ? s.methodPost : s.methodGet}>{r.method}</span>
              <span>{r.path}</span>
              <span className={r.status === 200 ? s.status200 : s.status403}>{r.status}</span>
            </div>
          ))}
        </div>
        <div className={s.burpDetail}>
          {selected === null
            ? <div className={s.burpPlaceholder}>Select a request to inspect its response</div>
            : <pre className={s.burpResponse}>{requests[selected].response}</pre>}
        </div>
      </div>
    </div>
  );
}
