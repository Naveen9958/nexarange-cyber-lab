// src/components/Terminal/TerminalView.jsx — Realistic Simulated Security Terminal
import { useState, useRef, useEffect } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/api';
import { KALI_GLOBAL } from '../../data/labData';
import { IconTerminal } from '../Common/Icons';
import s from './TerminalView.module.css';

const QUICK_COMMANDS = ['help', 'status', 'scan', 'inspect', 'trace', 'analyze', 'clear'];

const EXTENDED_RESPONSES = {
  status: `[ENCLAVE TELEMETRY STATUS]
  ● Security Enclave: LAB-01-SECURE
  ● Host: nexarange-kali (Linux 6.1.0-kali9-amd64)
  ● Operator: ACTIVE (Verified via Enclave Session)
  ● Tunnel: WireGuard mTLS / AES-256-GCM
  ● Threat Mitigation Engine: ARMED
  ● Active Defense Daemons: 4 running (auth-mon, mcp-audit, k8s-watch, net-sentry)`,

  scan: `[INITIATING SIMULATED SUBNET SCAN]
  Target: 10.240.0.0/24 (NexaCorp Internal DMZ)
  > Sending ARP discovery probes...
  > 3 active simulated endpoints detected:
    ├── 10.240.0.12  auth-validator.nexacorp.internal  [PORT 443/HTTPS, 8080/HTTP]
    ├── 10.240.0.47  mcp-gateway.nexacorp.internal     [PORT 8443/MCP-STREAM]
    └── 10.240.0.99  model-registry.vortex.internal    [PORT 9000/GRPC]
  [SCAN COMPLETE] No external network interfaces touched.`,

  inspect: `[CONTAINER & SERVICE INSPECTION]
  Analyzing active workload svc_agent_047...
  > Process Tree:
    PID 1042: python3 -m agentic_framework.core (User: svc_agent_047)
    PID 1058: /usr/local/bin/mcp-connector --pipe conn_012
  > Status: ANOMALOUS
  > Memory Footprint: 218MB
  > Open Descriptors: TCP 10.240.0.47:8443 -> ESTABLISHED
  > Security Flag: CVE-2026-AI-TOKEN-BYPASS observed in token validator.`,

  trace: `[PACKET TRACE ROUTE]
  Trace route to internal data store (10.240.0.99):
   1  10.240.0.1 (gateway.local)            0.24 ms
   2  10.240.0.47 (mcp-gateway)             0.41 ms  [⚠ INJECTED PAYLOAD TRAFFIC]
   3  10.240.0.99 (model-registry)          0.38 ms  [Target accessed via conn_012]
  Trace complete. 3 hops identified across zero-trust boundary.`,

  analyze: `[AI THREAT HEURISTIC ANALYSIS]
  > Scanning session sess_a7x9k2 activity log...
  > Threat Score: 89 / 100 (HIGH RISK)
  > Observed Behaviors:
    [!] Disabled credential token generation without revoking key
    [!] Outbound pipe to unvetted MCP connector (conn_012)
    [!] Injected synthetic training rows into dataset v9
  > Recommendation: Revoke bearer tokens immediately and deploy ZT policy ZT-009.`,

  reset: `[SYSTEM RESET]
  Flushing simulated connection pools...
  Restarting virtual enclave sandbox...
  Session reset to baseline calibration. Terminal ready.`,
};

export default function TerminalView() {
  const { operator } = useStore();
  const opName = operator?.name || 'Operator';
  const opCallsign = operator?.callsign || '0xOPERATOR';

  const [output, setOutput] = useState([
    { text: '═══════════════════════════════════════════════════════════════════════', cls: 'muted' },
    { text: '  NEXARANGE SECURE ENCLAVE TERMINAL v2.6.4 — CLASSIFIED SIMULATION', cls: 'head' },
    { text: `  Operator: ${opCallsign.toUpperCase()} (${opName.toUpperCase()})  |  Session: SESS-SEC-994  |  Lab Connection: ACTIVE`, cls: 'info' },
    { text: '═══════════════════════════════════════════════════════════════════════', cls: 'muted' },
    { text: 'Type "help" for a list of simulated security assessment commands.', cls: 'accent' },
  ]);
  const [cmd, setCmd] = useState('');
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  const [activeSessionId, setActiveSessionId] = useState(null);
  const bottomRef = useRef(null);

  // Initialize terminal session with backend on mount
  useEffect(() => {
    let mounted = true;
    api.terminal.createSession(1)
      .then((res) => {
        if (mounted && res.success && res.data?.session?.sessionId) {
          setActiveSessionId(res.data.session.sessionId);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  async function executeCommand(inputCmd) {
    const c = (inputCmd || cmd).trim();
    if (!c) return;

    const newHist = [c, ...history.filter((h) => h !== c)];
    setHistory(newHist);
    setHistIdx(-1);

    const out = [...output, { text: `operator@nexarange:~$ ${c}`, cls: 'promptLine' }];

    if (c === 'clear') {
      setOutput([]);
      setCmd('');
      return;
    }

    setIsExecuting(true);
    setCmd('');

    // Attempt backend execution first
    try {
      let sessId = activeSessionId;
      if (!sessId) {
        const sessRes = await api.terminal.createSession(1);
        sessId = sessRes.data?.session?.sessionId;
        setActiveSessionId(sessId);
      }
      if (sessId) {
        const res = await api.terminal.executeCommand(sessId, c);
        if (res.success && res.data?.lines) {
          setOutput([...out, ...res.data.lines]);
          setIsExecuting(false);
          return;
        }
      }
    } catch (err) {
      // Fallback to client simulation if offline
    }

    setTimeout(() => {
      const lower = c.toLowerCase();
      let resp = EXTENDED_RESPONSES[lower] || KALI_GLOBAL[c] || KALI_GLOBAL[lower];

      if (lower === 'whoami') {
        const clearanceLine = operator?.clearance ? `\nClearance: ${operator.clearance}` : '';
        resp = `Operator: ${opCallsign} (${opName})\nRole: ${operator?.role || 'Fresher / Trainee'}${clearanceLine}\nEnvironment: nexarange-kali-sandbox (Simulated Enclave)`;
      } else if (lower === 'status') {
        const clearanceStr = operator?.clearance ? ` (Clearance: ${operator.clearance})` : '';
        resp = `[ENCLAVE TELEMETRY STATUS]
  ● Security Enclave: LAB-01-SECURE
  ● Host: nexarange-kali (Linux 6.1.0-kali9-amd64)
  ● Operator: ${opCallsign} (${opName}) (Role: ${operator?.role || 'Fresher / Trainee'})${clearanceStr}
  ● Tunnel: WireGuard mTLS / AES-256-GCM
  ● Threat Mitigation Engine: ARMED
  ● Active Defense Daemons: 4 running (auth-mon, mcp-audit, k8s-watch, net-sentry)`;
      } else if (lower === 'help') {
        resp = `NEXARANGE SIMULATION TERMINAL — SAFE INVESTIGATION SUITE
Available commands:
  help                  Display this command reference
  status                Enclave telemetry and daemon states
  scan                  Simulate internal subnet discovery
  inspect               Inspect anomalous agent processes
  trace                 Trace simulated network routes and hops
  analyze               AI heuristic threat score & analysis
  nmap localhost        Port scan on local simulated services
  kubectl get pods      Inspect container cluster pods
  pip list              Audit installed Python dependencies
  whoami                Current operator identity and privileges
  clear                 Clear terminal buffer
  reset                 Re-calibrate simulation enclave`;
      }

      if (resp) {
        resp.split('\n').forEach((line) => {
          let lineCls = '';
          if (line.includes('⚠') || line.includes('MALICIOUS') || line.includes('HIGH RISK') || line.includes('[!]')) {
            lineCls = 'warn';
          } else if (line.includes('●') || line.includes('[INITIATING') || line.includes('[SCAN COMPLETE]')) {
            lineCls = 'info';
          }
          out.push({ text: line, cls: lineCls });
        });
      } else {
        out.push({
          text: `bash: ${c.split(' ')[0]}: command not found. Type "help" for simulated security utilities.`,
          cls: 'err',
        });
      }

      setOutput(out);
      setIsExecuting(false);
    }, 200);
  }

  function onKey(e) {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setCmd(history[next] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setCmd(next === -1 ? '' : history[next]);
    }
  }

  return (
    <div className={s.terminalContainer}>
      {/* ── Terminal Window Chrome ── */}
      <div className={s.windowChrome}>
        <div className={s.trafficLights}>
          <span className={`${s.light} ${s.lightRed}`} />
          <span className={`${s.light} ${s.lightYellow}`} />
          <span className={`${s.light} ${s.lightGreen}`} />
        </div>

        <div className={s.chromeTitle}>
          <IconTerminal size={14} className={s.chromeIcon} />
          <span>{opName.toLowerCase()}@nexarange-kali: ~ (Simulated Enclave)</span>
        </div>

        <div className={s.enclaveStatus}>
          <span className={s.statusDot} />
          <span>CONNECTED: LAB-01</span>
        </div>
      </div>

      {/* ── Quick Command Bar ── */}
      <div className={s.quickBar}>
        <span className={s.quickLabel}>QUICK UTILITIES:</span>
        <div className={s.quickChips}>
          {QUICK_COMMANDS.map((qc) => (
            <button
              key={qc}
              className={s.chip}
              onClick={() => executeCommand(qc)}
              disabled={isExecuting}
            >
              {qc}
            </button>
          ))}
        </div>
      </div>

      {/* ── Output Buffer ── */}
      <div className={s.terminalBody}>
        {output.map((line, idx) => (
          <div key={idx} className={`${s.line} ${s[line.cls] || ''}`}>
            {line.text}
          </div>
        ))}
        {isExecuting && (
          <div className={s.executingLine}>
            <span className={s.executingSpinner} />
            <span>Executing command in virtual sandbox...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Command Input Line ── */}
      <div className={s.inputBar}>
        <span className={s.prompt}>{opName.toLowerCase()}@nexarange:~$</span>
        <input
          className={s.commandInput}
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={onKey}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          placeholder="Type 'help' or click a quick utility above..."
        />
      </div>
    </div>
  );
}
