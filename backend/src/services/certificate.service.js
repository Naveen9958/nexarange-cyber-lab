import { Certificate } from '../models/Certificate.js';
import { Lab } from '../models/Lab.js';
import { MissionAttempt } from '../models/MissionAttempt.js';

const CERT_CONFIGS = {
  1: {
    title: 'Advanced AI Security Analyst (AISA)',
    code: 'NR-AISA-9941',
    category: 'Advanced AI Security Track',
    level: 'Medium to Advanced',
  },
  2: {
    title: 'Cloud Forensics & Deepfake Incident Specialist (CFDIS)',
    code: 'NR-CFDIS-8402',
    category: 'Cloud Infrastructure and AI Trust Track',
    level: 'Medium to Advanced',
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
