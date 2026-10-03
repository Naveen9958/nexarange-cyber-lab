import { Certificate } from '../models/Certificate.js';
import { Lab } from '../models/Lab.js';
import { MissionAttempt } from '../models/MissionAttempt.js';

const CERT_CONFIGS = {
  1: {
    title: 'Advanced AI Security Analyst (AISA)',
    code: 'NR-AISA-9941',
    category: 'AI Security Operations',
    level: 'Advanced',
  },
  2: {
    title: 'Cloud Forensics & Deepfake Incident Specialist (CFDIS)',
    code: 'NR-CFDIS-8402',
    category: 'Cloud Infrastructure & Synthetic Media',
    level: 'Advanced',
  },
  3: {
    title: 'Advanced LLM Security & RAG Defense Specialist (ALSD)',
    code: 'NR-ALSD-3071',
    category: 'AI Red Teaming & LLM Defense',
    level: 'Advanced',
  },
  4: {
    title: 'Zero Trust Cloud & Threat Attribution Expert (ZTTA)',
    code: 'NR-ZTTA-5519',
    category: 'Zero Trust & Cloud Forensics',
    level: 'Advanced',
  },
  5: {
    title: 'Next-Gen Cybersecurity Architect & Mesh Defender (NCAM)',
    code: 'NR-NCAM-7720',
    category: 'Autonomous Systems & Post-Quantum Defense',
    level: 'Master',
  },
};

export const certificateService = {
  async getUserCertificates(userId) {
    return Certificate.find({ userId, status: 'issued' }).sort({ issuedAt: -1 });
  },

  async getCertificateById(userId, certId) {
    return Certificate.findOne({ _id: certId, userId });
  },

  async checkAndIssueCertificate(userId, labId) {
    const config = CERT_CONFIGS[labId];
    if (!config) return null;

    // Check if certificate already exists
    const existing = await Certificate.findOne({ userId, labId });
    if (existing) return existing;

    // Verify all 5 missions for this lab are completed by this user
    const completedAttemptsCount = await MissionAttempt.countDocuments({
      userId,
      labId,
      status: 'completed',
    });

    if (completedAttemptsCount >= 5) {
      const certificateId = `${config.code}-${Date.now().toString(36).toUpperCase()}`;
      const cert = await Certificate.create({
        userId,
        labId,
        title: config.title,
        certificateId,
        code: config.code,
        category: config.category,
        level: config.level,
        status: 'issued',
        issuedAt: new Date(),
      });
      return cert;
    }

    return null;
  },
};
