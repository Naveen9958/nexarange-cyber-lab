import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { Lab } from '../models/Lab.js';
import { Mission } from '../models/Mission.js';
import { User } from '../models/User.js';
import { Progress } from '../models/Progress.js';
import { logger } from '../utils/logger.js';

const SEED_LABS = [
  {
    labId: 1,
    title: 'Ghost in the Machine',
    subtitle: 'Advanced AI Security Track',
    company: 'NexaCorp',
    caseId: 'NC-114',
    role: 'AI Security Analyst — Naveen',
    color: 'green',
    category: 'AI Security',
    difficulty: 'Advanced',
    xpReward: 1000,
    estimatedTime: '45 mins',
    debriefChain: [
      'Agentic AI Identity Attack',
      'MCP Server Exploitation',
      'Prompt Injection via Ticket',
      'Zero Trust Policy Bypass',
      'Red-Team Agent Deployment',
    ],
  },
  {
    labId: 2,
    title: 'The Deepfake Deal',
    subtitle: 'Cloud Infrastructure & AI Trust Track',
    company: 'Vortex Cloud',
    caseId: 'VC-233',
    role: 'Infrastructure Security Eng. — Naveen',
    color: 'cyan',
    category: 'Cloud Infra',
    difficulty: 'Advanced',
    xpReward: 1000,
    estimatedTime: '50 mins',
    debriefChain: [
      'ML Supply Chain Poisoning',
      'Credential Marketplace Sale',
      'Rogue K8s Pod Spin-Up',
      'Deepfake CFO Video Generated',
      'Quantum-Vulnerable Crypto Exploited',
    ],
  },
  {
    labId: 3,
    title: 'Neural Vector Poisoning & RAG Breach',
    subtitle: 'AI Red Teaming & LLM Defense Track',
    company: 'OmniAI Enterprise',
    caseId: 'ON-307',
    role: 'AI Red Team Specialist — Naveen',
    color: 'purple',
    category: 'AI Security',
    difficulty: 'Advanced',
    xpReward: 1000,
    estimatedTime: '40 mins',
    debriefChain: [
      'Vector Embeddings Poisoning',
      'RAG Context Jailbreak',
      'Shadow MCP Tool Infiltration',
      'Model Inference Denial Attack',
      'Autonomous Defense Mesh Tuning',
    ],
  },
  {
    labId: 4,
    title: 'Operation Cloud Citadel: Zero Trust Breached',
    subtitle: 'Multi-Cloud & Identity Forensics Track',
    company: 'StrataCloud Systems',
    caseId: 'SC-419',
    role: 'Cloud Defense Architect — Naveen',
    color: 'cyan',
    category: 'Cloud Infra',
    difficulty: 'Advanced',
    xpReward: 1000,
    estimatedTime: '45 mins',
    debriefChain: [
      'Cloud Trail Audit Log Tampering',
      'IMDSv2 SSRF Token Extraction',
      'Container Escape via HostPath',
      'Cross-Tenant IAM Escalation',
      'Quantum-Vulnerable TLS Exfiltration',
    ],
  },
  {
    labId: 5,
    title: 'Project Dark Star: Autonomous Infrastructure Sabotage',
    subtitle: 'Next-Gen Critical Infrastructure & Post-Quantum Track',
    company: 'Apex Energy Grid',
    caseId: 'AE-501',
    role: 'Cyber-Physical Systems Defender — Naveen',
    color: 'green',
    category: 'Networking',
    difficulty: 'Advanced',
    xpReward: 1000,
    estimatedTime: '55 mins',
    debriefChain: [
      'SCADA Protocol Telemetry Injection',
      'Post-Quantum Kyber-1024 Handshake Hijack',
      'BGP Route Hijack & Anycast Tamper',
      'Ransomware Kernel Driver Unloading',
      'Autonomous Agent Hive Quarantine',
    ],
  },
];

const SEED_MISSIONS = [
  // ── Lab 1 ──
  {
    missionId: 'm1_1', labId: 1, num: 1, xpReward: 100,
    title: 'Agentic AI Identity Attack', category: 'AI Security', difficulty: 'Beginner',
    badge: { emoji: '🕵️', name: 'Identity Hunter' },
    partner: { name: 'Devika Rao', role: 'IAM Security Lead', initial: 'D' },
    question: 'What is the session ID assigned to the rogue agent svc_agent_047?',
    answer: 'sess_a7x9k2',
  },
  {
    missionId: 'm1_2', labId: 1, num: 2, xpReward: 150,
    title: 'MCP Server Exploitation', category: 'AppSec & APIs', difficulty: 'Intermediate',
    badge: { emoji: '🔌', name: 'Connector Tracer' },
    partner: { name: 'Yusuf Ansari', role: 'API Security Engineer', initial: 'Y' },
    question: 'Which connector ID was invoked by the rogue session to inject data?',
    answer: 'conn_012',
  },
  {
    missionId: 'm1_3', labId: 1, num: 3, xpReward: 200,
    title: 'Prompt Injection Attack', category: 'AI Security', difficulty: 'Intermediate',
    badge: { emoji: '💉', name: 'Injection Spotter' },
    partner: { name: 'Simran Kaur', role: 'AI Red Team Lead', initial: 'S' },
    question: 'Which ticket ID contains the indirect prompt injection payload?',
    answer: 'TICK-8841',
  },
  {
    missionId: 'm1_4', labId: 1, num: 4, xpReward: 250,
    title: 'Zero Trust Policy Bypass', category: 'AppSec & APIs', difficulty: 'Advanced',
    badge: { emoji: '🛡️', name: 'ZT Enforcer' },
    partner: { name: 'Devika Rao', role: 'IAM Security Lead', initial: 'D' },
    question: 'Which policy ID has the over-permissive wildcard rule (ai:* on internal:*)?',
    answer: 'ZT-007',
  },
  {
    missionId: 'm1_5', labId: 1, num: 5, xpReward: 300,
    title: 'Red-Team Agent Deployment', category: 'AI Security', difficulty: 'Advanced',
    badge: { emoji: '🤖', name: 'Agent Commander' },
    partner: { name: 'Simran Kaur', role: 'AI Red Team Lead', initial: 'S' },
    question: 'Deploy all 4 counter-agent patterns. Type DEPLOY_ALL when ready.',
    answer: 'DEPLOY_ALL',
  },

  // ── Lab 2 ──
  {
    missionId: 'm2_1', labId: 2, num: 1, xpReward: 100,
    title: 'ML Supply Chain Poisoning', category: 'Cloud Infra', difficulty: 'Beginner',
    badge: { emoji: '📦', name: 'Artifact Verifier' },
    partner: { name: 'Priya Sharma', role: 'DevSecOps Lead', initial: 'P' },
    question: 'What is the SHA-256 hash prefix of the malicious poisoned wheel package?',
    answer: 'e3b0c442',
  },
  {
    missionId: 'm2_2', labId: 2, num: 2, xpReward: 150,
    title: 'Credential Marketplace Leak', category: 'Cloud Infra', difficulty: 'Intermediate',
    badge: { emoji: '🪙', name: 'Darknet Auditor' },
    partner: { name: 'Arjun Mehta', role: 'Threat Intelligence Lead', initial: 'A' },
    question: 'What is the leaked IAM Access Key ID sold on the forum?',
    answer: 'AKIA_VORTEX_9921_PROD',
  },
  {
    missionId: 'm2_3', labId: 2, num: 3, xpReward: 200,
    title: 'Rogue K8s Pod Isolation', category: 'Kubernetes', difficulty: 'Intermediate',
    badge: { emoji: '☸️', name: 'Cluster Warden' },
    partner: { name: 'Siddharth Nair', role: 'Cloud Platform Eng.', initial: 'S' },
    question: 'What is the name of the anomalous mining pod deployed in kube-system?',
    answer: 'rogue-worker-miner-8a1c3e',
  },
  {
    missionId: 'm2_4', labId: 2, num: 4, xpReward: 250,
    title: 'Deepfake Audio Heuristic', category: 'Forensics', difficulty: 'Advanced',
    badge: { emoji: '🎙️', name: 'Spectral Forensics' },
    partner: { name: 'Dr. Ananya Roy', role: 'Digital Forensics Lead', initial: 'A' },
    question: 'What is the confidence score percentage (0-100) that Audio File 03 is synthetic?',
    answer: '94.8',
  },
  {
    missionId: 'm2_5', labId: 2, num: 5, xpReward: 300,
    title: 'Post-Quantum Crypto Migration', category: 'Cryptography', difficulty: 'Advanced',
    badge: { emoji: '🔐', name: 'Quantum Sentinel' },
    partner: { name: 'Vikram Joshi', role: 'Principal Cryptographer', initial: 'V' },
    question: 'Which NIST Post-Quantum algorithm replaces vulnerable RSA-2048 in the patch?',
    answer: 'ML-KEM-768',
  },

  // ── Lab 3 ──
  {
    missionId: 'm3_1', labId: 3, num: 1, xpReward: 100,
    title: 'Vector Embeddings Poisoning', category: 'AI Security', difficulty: 'Beginner',
    badge: { emoji: '🧬', name: 'Vector Warden' },
    partner: { name: 'Maya Lin', role: 'RAG Pipeline Architect', initial: 'M' },
    question: 'What is the corrupted document ID in the vector store?',
    answer: 'DOC-VEC-9914',
  },
  {
    missionId: 'm3_2', labId: 3, num: 2, xpReward: 150,
    title: 'RAG Context Jailbreak', category: 'AI Security', difficulty: 'Intermediate',
    badge: { emoji: '🔓', name: 'Guardrail Specialist' },
    partner: { name: 'Kiran Patel', role: 'AI Safety Researcher', initial: 'K' },
    question: 'What prompt delimiter bypass string was used in the jailbreak?',
    answer: '---SYSTEM-OVERRIDE---',
  },
  {
    missionId: 'm3_3', labId: 3, num: 3, xpReward: 200,
    title: 'Shadow MCP Tool Infiltration', category: 'AppSec & APIs', difficulty: 'Intermediate',
    badge: { emoji: '🕵️', name: 'Tool Auditor' },
    partner: { name: 'Devika Rao', role: 'IAM Security Lead', initial: 'D' },
    question: 'What unauthorized tool namespace was registered in the MCP manifest?',
    answer: 'tools.exfil.stream',
  },
  {
    missionId: 'm3_4', labId: 3, num: 4, xpReward: 250,
    title: 'Model Inference Denial Attack', category: 'AI Security', difficulty: 'Advanced',
    badge: { emoji: '⚡', name: 'Throttle Guardian' },
    partner: { name: 'Priya Sharma', role: 'DevSecOps Lead', initial: 'P' },
    question: 'What recursion depth triggered the resource starvation in the LLM engine?',
    answer: '512',
  },
  {
    missionId: 'm3_5', labId: 3, num: 5, xpReward: 300,
    title: 'Autonomous Defense Mesh Tuning', category: 'AI Security', difficulty: 'Advanced',
    badge: { emoji: '🛡️', name: 'Neural Shield' },
    partner: { name: 'Simran Kaur', role: 'AI Red Team Lead', initial: 'S' },
    question: 'What is the activation threshold percentage set for the neural firewall?',
    answer: '98.5',
  },

  // ── Lab 4 ──
  {
    missionId: 'm4_1', labId: 4, num: 1, xpReward: 100,
    title: 'Cloud Trail Audit Log Tampering', category: 'Forensics', difficulty: 'Beginner',
    badge: { emoji: '🔍', name: 'Log Auditor' },
    partner: { name: 'Rahul Sen', role: 'Cloud Forensics Analyst', initial: 'R' },
    question: 'Which S3 bucket logging prefix was deleted by the attacker?',
    answer: 'audit-trails-prod-01',
  },
  {
    missionId: 'm4_2', labId: 4, num: 2, xpReward: 150,
    title: 'IMDSv2 SSRF Token Extraction', category: 'Cloud Infra', difficulty: 'Intermediate',
    badge: { emoji: '☁️', name: 'Metadata Shield' },
    partner: { name: 'Siddharth Nair', role: 'Cloud Platform Eng.', initial: 'S' },
    question: 'What is the TTL hop-limit set on the patched metadata interface?',
    answer: '1',
  },
  {
    missionId: 'm4_3', labId: 4, num: 3, xpReward: 200,
    title: 'Container Escape via HostPath', category: 'Kubernetes', difficulty: 'Intermediate',
    badge: { emoji: '📦', name: 'Namespace Warden' },
    partner: { name: 'Devika Rao', role: 'IAM Security Lead', initial: 'D' },
    question: 'Which host path was mounted into the malicious container pod?',
    answer: '/var/run/docker.sock',
  },
  {
    missionId: 'm4_4', labId: 4, num: 4, xpReward: 250,
    title: 'Cross-Tenant IAM Escalation', category: 'Forensics', difficulty: 'Advanced',
    badge: { emoji: '🗝️', name: 'Policy Enforcer' },
    partner: { name: 'Arjun Mehta', role: 'Threat Intelligence Lead', initial: 'A' },
    question: 'What was the assume-role trust policy external ID compromised?',
    answer: 'NEXA-TENANT-TRUST-99',
  },
  {
    missionId: 'm4_5', labId: 4, num: 5, xpReward: 300,
    title: 'Quantum-Vulnerable TLS Exfiltration', category: 'Cryptography', difficulty: 'Advanced',
    badge: { emoji: '🌐', name: 'Post-Quantum Guard' },
    partner: { name: 'Vikram Joshi', role: 'Principal Cryptographer', initial: 'V' },
    question: 'What cipher suite was banned to stop harvest-now-decrypt-later attacks?',
    answer: 'TLS_RSA_WITH_AES_256_CBC_SHA256',
  },

  // ── Lab 5 ──
  {
    missionId: 'm5_1', labId: 5, num: 1, xpReward: 100,
    title: 'SCADA Protocol Telemetry Injection', category: 'Networking', difficulty: 'Beginner',
    badge: { emoji: '🏭', name: 'Grid Controller' },
    partner: { name: 'Tanya Varma', role: 'Critical Infra Analyst', initial: 'T' },
    question: 'What Modbus unit ID was targeted with false telemetry packets?',
    answer: 'UNIT_247',
  },
  {
    missionId: 'm5_2', labId: 5, num: 2, xpReward: 150,
    title: 'Post-Quantum Kyber-1024 Handshake Hijack', category: 'Cryptography', difficulty: 'Intermediate',
    badge: { emoji: '⚛️', name: 'Kyber Analyst' },
    partner: { name: 'Vikram Joshi', role: 'Principal Cryptographer', initial: 'V' },
    question: 'What is the ciphertext size in bytes for the Kyber-1024 parameter set?',
    answer: '1568',
  },
  {
    missionId: 'm5_3', labId: 5, num: 3, xpReward: 200,
    title: 'BGP Route Hijack & Anycast Tamper', category: 'Networking', difficulty: 'Intermediate',
    badge: { emoji: '🌐', name: 'Route Sentinel' },
    partner: { name: 'Rahul Sen', role: 'Cloud Forensics Analyst', initial: 'R' },
    question: 'What Autonomous System Number (ASN) rogue prefix was announced?',
    answer: 'AS65530',
  },
  {
    missionId: 'm5_4', labId: 5, num: 4, xpReward: 250,
    title: 'Ransomware Kernel Driver Unloading', category: 'Cloud Infra', difficulty: 'Advanced',
    badge: { emoji: '🛡️', name: 'Kernel Defender' },
    partner: { name: 'Dr. Ananya Roy', role: 'Digital Forensics Lead', initial: 'A' },
    question: 'What driver signature certificate serial was revoked by the defender?',
    answer: '0x7F4A19B3E2',
  },
  {
    missionId: 'm5_5', labId: 5, num: 5, xpReward: 300,
    title: 'Autonomous Agent Hive Quarantine', category: 'AI Security', difficulty: 'Advanced',
    badge: { emoji: '🛸', name: 'Hive Neutralizer' },
    partner: { name: 'Simran Kaur', role: 'AI Red Team Lead', initial: 'S' },
    question: 'What quarantine enclave subnet CIDR isolated the autonomous agent hive?',
    answer: '10.99.255.0/28',
  },
];

export const seedInitialData = async () => {
  logger.info('Initializing NexaRange seed verification...');

  // 1. Seed Labs (Upsert)
  for (const labData of SEED_LABS) {
    await Lab.findOneAndUpdate({ labId: labData.labId }, labData, { upsert: true, new: true });
  }
  logger.info(`Verified ${SEED_LABS.length} simulation labs in database.`);

  // 2. Seed Missions (Upsert)
  for (const missionData of SEED_MISSIONS) {
    await Mission.findOneAndUpdate({ missionId: missionData.missionId }, missionData, { upsert: true, new: true });
  }
  logger.info(`Verified ${SEED_MISSIONS.length} operational missions in database.`);

  // 3. Seed Default Operator Account (Naveen)
  const defaultEmail = 'naveen@nexarange.internal';
  const existingOperator = await User.findOne({ email: defaultEmail });
  if (!existingOperator) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('CyberAccess2026!', salt);

    const defaultUser = await User.create({
      name: 'Naveen',
      email: defaultEmail,
      callsign: '0xNAVEEN',
      passwordHash,
      role: 'user',
      level: 1,
      xp: 0,
      themePreference: 'dark',
      avatar: 'N',
      lastLoginAt: new Date(),
    });

    await Progress.create({
      userId: defaultUser._id,
      totalXp: 0,
      currentLevel: 1,
      missionsCompleted: {},
      labsCompleted: [],
      badges: [],
      skillMatrix: {
        'AI Security': 0,
        'Cloud Infra': 0,
        'Forensics': 0,
        'Cryptography': 0,
        'Networking': 0,
        'Kubernetes': 0,
      },
    });

    logger.info('Default operator account created (naveen@nexarange.internal)');
  }

  logger.info('Database seed complete and fully synchronized.');
};

// If run directly via `npm run seed`
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedInitialData();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      logger.error('Seed execution error:', { error: err.message });
      process.exit(1);
    }
  })();
}
