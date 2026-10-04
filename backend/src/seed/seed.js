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
    difficulty: 'Medium to Advanced',
    xpReward: 1000,
    estimatedTime: '40 to 50 minutes',
    debriefChain: [
      'Agentic AI Identity Attack',
      'MCP Server Exploitation',
      'Prompt Injection Chains',
      'Zero Trust Policy Bypass',
      'Build-Your-Own AI Red-Team Agent',
    ],
  },
  {
    labId: 2,
    title: 'The Deepfake Deal',
    subtitle: 'Cloud Infrastructure and AI Trust Track',
    company: 'Vortex Cloud',
    caseId: 'VC-233',
    role: 'Infrastructure Security Engineer — Naveen',
    color: 'cyan',
    category: 'Cloud Infra',
    difficulty: 'Medium to Advanced',
    xpReward: 1000,
    estimatedTime: '40 to 50 minutes',
    debriefChain: [
      'AI Supply Chain Poisoning',
      'Infostealer & Marketplace Analysis',
      'Kubernetes Security Sweep',
      'Deepfake & Adversarial AI Detection',
      'Quantum-Safe Cryptography Migration',
    ],
  },
];

const SEED_MISSIONS = [
  // ── Lab 1: Ghost in the Machine (NexaCorp) ──
  {
    missionId: 'm1_1', labId: 1, num: 1, xpReward: 100,
    title: 'Agentic AI Identity and Authorization Attack', category: 'AI Security', difficulty: 'Beginner',
    badge: { emoji: '🕵️', name: 'Identity Hunter' },
    partner: { name: 'Devika Rao', role: 'Identity and Access Engineer', initial: 'D' },
    question: 'What is the session ID assigned to the rogue agent svc_agent_047?',
    answer: 'sess_a7x9k2',
  },
  {
    missionId: 'm1_2', labId: 1, num: 2, xpReward: 150,
    title: 'MCP Server Security Exploitation', category: 'AppSec & APIs', difficulty: 'Intermediate',
    badge: { emoji: '🔌', name: 'Connector Tracer' },
    partner: { name: 'Yusuf Ansari', role: 'Platform Integration Engineer', initial: 'Y' },
    question: 'Which connector ID was invoked by the rogue session to inject data?',
    answer: 'conn_012',
  },
  {
    missionId: 'm1_3', labId: 1, num: 3, xpReward: 200,
    title: 'Prompt Injection Chains in Agentic Workflows', category: 'AI Security', difficulty: 'Intermediate',
    badge: { emoji: '💉', name: 'Injection Spotter' },
    partner: { name: 'Simran Kaur', role: 'Customer Success Lead', initial: 'S' },
    question: 'What is the ticket ID containing the prompt injection?',
    answer: 'TKT-4403',
  },
  {
    missionId: 'm1_4', labId: 1, num: 4, xpReward: 250,
    title: 'Zero Trust Architecture Bypass Simulation', category: 'AppSec & APIs', difficulty: 'Advanced',
    badge: { emoji: '🛡️', name: 'Trust Gap Finder' },
    partner: { name: 'Aditya Verma', role: 'Zero Trust Architecture Lead', initial: 'A' },
    question: 'What is the policy ID with the fatal zero trust exception for AI agents?',
    answer: 'ZT-009',
  },
  {
    missionId: 'm1_5', labId: 1, num: 5, xpReward: 300,
    title: 'Build-Your-Own AI Red-Team Agent', category: 'AI Security', difficulty: 'Advanced',
    badge: { emoji: '🤖', name: 'Case NC-114 Closed' },
    partner: { name: 'Rhea Malhotra', role: 'Incident Response Lead', initial: 'R' },
    question: 'Deploy the red-team agent with all 4 patterns selected.',
    answer: 'DEPLOY_ALL',
  },

  // ── Lab 2: The Deepfake Deal (Vortex Cloud) ──
  {
    missionId: 'm2_1', labId: 2, num: 1, xpReward: 100,
    title: 'AI Supply Chain Poisoning', category: 'Cloud Infra', difficulty: 'Beginner',
    badge: { emoji: '⛓️', name: 'Chain Watcher' },
    partner: { name: 'Farah Sheikh', role: 'Build and DevOps Engineer', initial: 'F' },
    question: 'What is the name of the malicious PyPI package?',
    answer: 'vortex-ai-utils',
  },
  {
    missionId: 'm2_2', labId: 2, num: 2, xpReward: 150,
    title: 'Infostealer and Credential Marketplace Analysis', category: 'Cloud Infra', difficulty: 'Intermediate',
    badge: { emoji: '🕸️', name: 'Marketplace Tracer' },
    partner: { name: 'Om Prakash', role: 'Threat Intelligence Analyst', initial: 'O' },
    question: 'What is the name of the rogue pod created using the stolen token?',
    answer: 'vxc-media-renderer-7x',
  },
  {
    missionId: 'm2_3', labId: 2, num: 3, xpReward: 200,
    title: 'Kubernetes and Cloud-Native Security', category: 'Kubernetes', difficulty: 'Intermediate',
    badge: { emoji: '☸️', name: 'Cluster Sweeper' },
    partner: { name: 'Leo Fernandes', role: 'Cloud Platform Engineer', initial: 'L' },
    question: 'What is the TARGET_IDENTITY env var set in the rogue pod?',
    answer: 'CFO_VORTEX',
  },
  {
    missionId: 'm2_4', labId: 2, num: 4, xpReward: 250,
    title: 'Deepfake and Adversarial AI Detection', category: 'Forensics', difficulty: 'Advanced',
    badge: { emoji: '🎭', name: 'Deepfake Spotter' },
    partner: { name: 'Naina Kapoor', role: 'AI Trust and Safety Engineer', initial: 'N' },
    question: 'How many anomalous indicators confirm this is a deepfake?',
    answer: '5',
  },
  {
    missionId: 'm2_5', labId: 2, num: 5, xpReward: 300,
    title: 'Quantum-Safe Cryptography Migration', category: 'Cryptography', difficulty: 'Advanced',
    badge: { emoji: '🔐', name: 'Case VC-233 Closed' },
    partner: { name: 'Ritika Anand', role: 'Cryptography and Compliance Lead', initial: 'R' },
    question: "How many algorithms in Vortex Cloud's stack are quantum-vulnerable?",
    answer: '3',
  },
];

export const seedInitialData = async () => {
  logger.info('Initializing NexaRange seed verification...');

  // Remove labs not in SEED_LABS
  await Lab.deleteMany({ labId: { $nin: SEED_LABS.map((l) => l.labId) } });

  // 1. Seed Labs (Upsert)
  for (const labData of SEED_LABS) {
    await Lab.findOneAndUpdate({ labId: labData.labId }, labData, { upsert: true, new: true });
  }
  logger.info(`Verified ${SEED_LABS.length} simulation labs in database.`);

  // Remove missions not in SEED_MISSIONS
  await Mission.deleteMany({ missionId: { $nin: SEED_MISSIONS.map((m) => m.missionId) } });

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
      username: 'naveen_internal',
      email: defaultEmail,
      callsign: '0xNAVEEN',
      passwordHash,
      role: 'Fresher / Trainee',
      level: 1,
      xp: 0,
      themePreference: 'dark',
      avatar: 'NK',
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
