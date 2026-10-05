// src/components/Mission/blocks/BurpBlock.jsx — Professional Burp Suite with Request/Response tabs & search filter
import { useState } from 'react';
import s from './Blocks.module.css';

export default function BurpBlock({ requests = [] }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState('request'); // 'request' | 'response'

  const filtered = requests.filter((r) => {
    if (!filter) return true;
    const term = filter.toLowerCase();
    return (
      r.path.toLowerCase().includes(term) ||
      r.method.toLowerCase().includes(term) ||
      r.host.toLowerCase().includes(term) ||
      String(r.status).includes(term)
    );
  });

  const activeReq = selected !== null ? filtered[selected] : null;

  return (
    <div className={s.block}>
      <div className={s.blockTitle}>🔍 BURP SUITE — HTTP INTERCEPT & REPEATER</div>
      <p className={s.blockHint}>
        Inspect intercepted HTTP transactions. Analyze request payloads and responses to correlate session identifiers and unauthorized API executions.
      </p>

      {/* Filter / Search Bar */}
      <div className={s.burpControls}>
        <input
          type="text"
          placeholder="Filter traffic (e.g. POST, /invoke, 200, 403)..."
          className={s.burpSearchInput}
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setSelected(null);
          }}
        />
        <span className={s.burpCount}>
          {filtered.length} of {requests.length} captured
        </span>
      </div>

      <div className={s.burpWrap}>
        {/* Left: Intercept Table */}
        <div className={s.burpTable}>
          <div className={`${s.burpRow} ${s.burpHead}`}>
            <span>#</span>
            <span>MTHD</span>
            <span>HOST</span>
            <span>PATH</span>
            <span>STAT</span>
          </div>
          {filtered.length === 0 ? (
            <div className={s.burpPlaceholder}>No HTTP transactions match filter.</div>
          ) : (
            filtered.map((r, i) => (
              <div
                key={r.id || i}
                className={`${s.burpRow} ${selected === i ? s.burpSelected : ''}`}
                onClick={() => setSelected(i)}
              >
                <span>{i + 1}</span>
                <span className={r.method === 'POST' ? s.methodPost : s.methodGet}>{r.method}</span>
                <span>{r.host}</span>
                <span>{r.path}</span>
                <span className={r.status === 200 ? s.status200 : s.status403}>{r.status}</span>
              </div>
            ))
          )}
        </div>

        {/* Right: Request / Response Inspector */}
        <div className={s.burpDetail}>
          {activeReq ? (
            <>
              <div className={s.burpTabs}>
                <button
                  type="button"
                  className={`${s.burpTab} ${tab === 'request' ? s.burpTabActive : ''}`}
                  onClick={() => setTab('request')}
                >
                  HTTP REQUEST ({activeReq.method})
                </button>
                <button
                  type="button"
                  className={`${s.burpTab} ${tab === 'response' ? s.burpTabActive : ''}`}
                  onClick={() => setTab('response')}
                >
                  HTTP RESPONSE ({activeReq.status})
                </button>
              </div>

              <div className={s.burpBody}>
                {tab === 'request' ? (
                  <pre className={`${s.burpPre} ${s.burpReqPre}`}>
                    {activeReq.request || `${activeReq.method} ${activeReq.path} HTTP/1.1\nHost: ${activeReq.host}\nUser-Agent: NexaRange-Agent/1.0\nAccept: application/json`}
                  </pre>
                ) : (
                  <pre className={s.burpPre}>{activeReq.response}</pre>
                )}
              </div>
            </>
          ) : (
            <div className={s.burpPlaceholder}>
              Select an HTTP transaction from the intercept table to inspect its raw request headers and response payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
