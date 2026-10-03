// Centralized application constants & calculations

export const THEMES = ['dark', 'light', 'system'];
export const DEFAULT_THEME = 'dark';

export const USER_ROLES = ['user'];
export const MISSION_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const SKILL_CATEGORIES = [
  'AI Security',
  'Cloud Infra',
  'Forensics',
  'Cryptography',
  'Networking',
  'Kubernetes',
];

// Centralized Level & Progression Formulas
export const XP_PER_LEVEL = 350;
export const BASE_LEVEL = 3; // Baseline rank tier

export const calculateLevelInfo = (totalXp = 0) => {
  const xp = Math.max(0, Number(totalXp) || 0);
  const currentLevel = BASE_LEVEL + Math.floor(xp / XP_PER_LEVEL);
  const currentLevelBaseXp = (currentLevel - BASE_LEVEL) * XP_PER_LEVEL;
  const xpIntoCurrentLevel = xp - currentLevelBaseXp;
  const xpToNextLevel = XP_PER_LEVEL - xpIntoCurrentLevel;
  const progressPercentage = Math.min(100, Math.round((xpIntoCurrentLevel / XP_PER_LEVEL) * 100));

  return {
    level: currentLevel,
    xp,
    xpToNextLevel,
    progressPercentage,
  };
};

export const calculateRank = (totalXp = 0, baseRank = 247) => {
  const xp = Math.max(0, Number(totalXp) || 0);
  return Math.max(12, baseRank - Math.floor(xp / 10));
};

// Safe Whitelisted Simulated Terminal Commands
export const ALLOWED_TERMINAL_COMMANDS = [
  'help',
  'status',
  'scan',
  'inspect',
  'trace',
  'analyze',
  'clear',
  'whoami',
  'reset',
  'nmap localhost',
  'kubectl get pods',
  'pip list',
];

export const SIMULATED_COMMAND_RESPONSES = {
  help: `NEXARANGE SIMULATION TERMINAL — SAFE INVESTIGATION SUITE
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
  reset                 Re-calibrate simulation enclave`,

  status: `[ENCLAVE TELEMETRY STATUS]
  ● Security Enclave: LAB-01-SECURE
  ● Host: nexarange-kali (Linux 6.1.0-kali9-amd64)
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

  clear: '',

  reset: `[SYSTEM RESET]
  Flushing simulated connection pools...
  Restarting virtual enclave sandbox...
  Session reset to baseline calibration. Terminal ready.`,

  'nmap localhost': `Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-03 12:00 UTC
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https
8443/tcp open  mcp-stream
Nmap done: 1 IP address (1 host up) scanned in 0.04 seconds`,

  'kubectl get pods': `NAME                               READY   STATUS    RESTARTS   AGE
agent-validator-7d9f8b4c5-x2n8q    1/1     Running   0          4h12m
mcp-gateway-6b8c9d7e1-k9m2p        1/1     Running   1          2h45m
rogue-worker-miner-8a1c3e-99p      1/1     Running   0          18m (ANOMALOUS)
model-store-syncer-5f4e3d-7h8j     1/1     Running   0          6h30m`,

  'pip list': `Package             Version
------------------- -------
agentic-core        1.4.2
cryptography        42.0.5
mcp-python-sdk      0.9.1
torch-secure        2.2.0
requests-sanitized  2.31.0
unverified-loader   0.1.0 (FLAGGED: UNVETTED SUPPLY CHAIN)`,
};
