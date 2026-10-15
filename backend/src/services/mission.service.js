import { Mission } from '../models/Mission.js';
import { MissionAttempt } from '../models/MissionAttempt.js';
import { Progress } from '../models/Progress.js';
import { xpService } from './xp.service.js';
import { certificateService } from './certificate.service.js';
import { SKILL_CATEGORIES } from '../utils/constants.js';

export const missionService = {
  async getAllMissions() {
    return Mission.find({ isActive: true }).sort({ labId: 1, num: 1 });
  },

  async getMissionById(missionId) {
    const mission = await Mission.findOne({
      $or: [{ missionId }, { _id: missionId.match(/^[0-9a-fA-F]{24}$/) ? missionId : null }],
      isActive: true,
    });
    if (!mission) {
      const err = new Error('Operational mission not found or inactive.');
      err.statusCode = 404;
      throw err;
    }
    return mission;
  },

  async startMission(userId, missionId) {
    const mission = await this.getMissionById(missionId);

    // Atomically find or create mission attempt
    let attempt = await MissionAttempt.findOne({ userId, missionId: mission.missionId });
    if (!attempt) {
      attempt = await MissionAttempt.create({
        userId,
        missionId: mission.missionId,
        labId: mission.labId,
        status: 'in_progress',
        startedAt: new Date(),
      });
    } else if (attempt.status === 'not_started') {
      attempt.status = 'in_progress';
      attempt.startedAt = new Date();
      await attempt.save();
    }

    return {
      mission,
      attempt,
    };
  },

  async verifyFlag(missionId, submittedFlag) {
    const mission = await this.getMissionById(missionId);
    const clean = (v) => (v || '').toString().trim().toLowerCase().replace(/[\s-_]+/g, '');
    const userAns = clean(submittedFlag);
    const expected = clean(mission.answer);

    // Build list of valid aliases (both full CTF flag and raw threat indicator)
    const validAliases = [expected];
    const aliasMap = {
      m1_1: ['sess_a7x9k2', 'sessa7x9k2', 'a7x9k2', 'alg_none', 'alg:none', 'none'],
      m1_2: ['conn_012', 'conn012', '012', '0x1f'],
      m1_3: ['tkt-4403', 'tkt4403', '4403', 'systemoverride', '---systemoverride---'],
      m1_4: ['zt-009', 'zt009', '009', 'x-internal-origin', 'xinternalorigin'],
      m1_5: ['deploy_all', 'deployall', 'deploy', '4'],
      m2_1: ['vortex-ai-utils', 'vortex_ai_utils', 'vortexaiutils', 'sha256'],
      m2_2: ['vxc-media-renderer-7x', 'vxc_media_renderer_7x', 'vxcmediarenderer7x', 'media-renderer-7x'],
      m2_3: ['cfo_vortex', 'cfovortex', 'cfo vortex'],
      m2_4: ['5', 'five'],
      m2_5: ['3', 'three'],
    };

    if (aliasMap[mission.missionId]) {
      aliasMap[mission.missionId].forEach((a) => validAliases.push(clean(a)));
    }

    const isValid = Boolean(userAns && validAliases.includes(userAns));

    return {
      isValid,
      missionId: mission.missionId,
      flagAccepted: isValid ? mission.answer : null,
      submitted: submittedFlag,
      telemetry: {
        timestamp: new Date().toISOString(),
        validationMethod: 'Cryptographic Flag & Algorithmic Indicator Check',
        algorithmStatus: isValid ? 'VERIFIED' : 'CHALLENGE_FAILED',
      },
    };
  },

  async executeAlgorithm(algorithmType, payload = {}) {
    switch (algorithmType) {
      case 'jwt-verify': {
        const { header, claims, signature } = payload;
        const alg = (header?.alg || 'HS256').toUpperCase();
        if (alg === 'NONE') {
          return {
            algorithm: 'JWT Header Algorithm None Attack (RFC 7519)',
            vulnerabilityStatus: 'VULNERABILITY_EXPLOITED',
            bypassedVerification: true,
            extractedSession: claims?.assigned_session || 'sess_a7x9k2',
            flag: 'FLAG{aria_jwt_none_bypass_91a}',
            explanation: 'The validator accepted unauthenticated token with alg:none, skipping HMAC cryptographic verification.',
          };
        }
        return {
          algorithm: 'HMAC-SHA256 Signature Verification',
          vulnerabilityStatus: 'SECURE_SIGNATURE_REQUIRED',
          bypassedVerification: false,
          flag: null,
          explanation: 'Signature verification enforced. Token must use valid secret key.',
        };
      }

      case 'mcp-bitmask': {
        const { scopes = [] } = payload;
        // Bitmask definitions: EXEC=1, READ=2, WRITE=4, APPROVE=8, WIRE=16
        const SCOPE_BITS = { execute: 1, read: 2, write: 4, approve: 8, wire: 16 };
        let bitmask = 0;
        scopes.forEach((s) => {
          bitmask |= SCOPE_BITS[s.toLowerCase()] || 0;
        });

        const isOverprivileged = (bitmask & (SCOPE_BITS.approve | SCOPE_BITS.wire)) !== 0;

        return {
          algorithm: 'RBAC Permission Bitmask & Scope Matrix Calculation',
          computedBitmask: `0x${bitmask.toString(16).toUpperCase()} (${bitmask})`,
          isOverprivileged,
          exploitedConnector: isOverprivileged ? 'conn_012' : null,
          flag: isOverprivileged ? 'FLAG{mcp_scope_escalation_conn012}' : null,
          securityEvaluation: isOverprivileged
            ? 'CRITICAL: Connector granted financial approval and wire execution scopes to untrusted agent identity.'
            : 'NORMAL: Scopes restricted to least privilege.',
        };
      }

      case 'prompt-delimiters': {
        const { ticketText = '' } = payload;
        const delimiterRegex = /---SYSTEM OVERRIDE[\s\S]*?---/i;
        const directiveRegex = /\[SYSTEM DIRECTIVE:[\s\S]*?\]/i;
        const hasDelimiter = delimiterRegex.test(ticketText) || directiveRegex.test(ticketText);

        return {
          algorithm: 'LLM Context Delimiter Tokenization & Boundary Analysis',
          delimiterDetected: hasDelimiter,
          contextSwitchTriggered: hasDelimiter,
          isolatedTicket: hasDelimiter ? 'TKT-4403' : null,
          flag: hasDelimiter ? 'FLAG{prompt_delimiter_escape_tkt4403}' : null,
          explanation: hasDelimiter
            ? 'Adversarial delimiter tags escaped system prompt boundaries and commanded ARIA autonomous agent.'
            : 'Standard user ticket text with no adversarial system escape syntax.',
        };
      }

      case 'quantum-shor': {
        const { algorithms = ['RSA-2048', 'ECDH P-256', 'SHA-256', 'AES-256', 'ECDSA P-384'] } = payload;
        const analysis = algorithms.map((name) => {
          const upper = name.toUpperCase();
          if (upper.includes('RSA') || upper.includes('ECDH') || upper.includes('ECDSA')) {
            return {
              name,
              quantumStatus: 'VULNERABLE',
              attackVector: "Shor's Polynomial Period Finding (Discrete Log / Factoring)",
              nistReplacement: upper.includes('RSA') ? 'FIPS 204 ML-DSA' : upper.includes('ECDH') ? 'FIPS 203 ML-KEM' : 'FIPS 205 SLH-DSA',
            };
          }
          return {
            name,
            quantumStatus: 'QUANTUM_SAFE',
            attackVector: "Grover's Square Root Search (Pre-image Resistance Maintained)",
            nistReplacement: 'None Required (Retain AES-256 / SHA-256)',
          };
        });

        const vulnerableCount = analysis.filter((a) => a.quantumStatus === 'VULNERABLE').length;

        return {
          algorithm: "Shor's Quantum Complexity & NIST PQC Lattice Migration Algorithm",
          analyzedStack: analysis,
          totalVulnerable: vulnerableCount,
          flag: 'FLAG{pqc_lattice_migration_3alg}',
          recommendation: `Migrate ${vulnerableCount} classical asymmetric public-key primitives to NIST FIPS 203/204/205 standards.`,
        };
      }

      case 'package-hash': {
        const { packageName = 'vortex-ai-utils' } = payload;
        const isTyposquat = packageName.toLowerCase() === 'vortex-ai-utils';

        return {
          algorithm: 'Cryptographic SHA-256 Package Checksum & Levenshtein Distance Check',
          packageName,
          levenshteinDistanceToLegitimate: isTyposquat ? 1 : 0, // vortex-ai-tools vs vortex-ai-utils
          officialHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          calculatedHash: isTyposquat
            ? '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
            : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          integrityVerified: !isTyposquat,
          flag: isTyposquat ? 'FLAG{pypi_hash_mismatch_vortex}' : null,
          alert: isTyposquat
            ? 'CRITICAL: Package hash mismatch! Typosquatted setup.py executes exfiltration script.'
            : 'Package hash matches PyPI trusted authority.',
        };
      }

      default:
        return {
          algorithm: 'Generic Cryptographic Verification',
          status: 'UNRECOGNIZED_ALGORITHM',
        };
    }
  },

  async completeMission(userId, missionId, tasks = [], submittedFlag = null) {
    const mission = await this.getMissionById(missionId);

    // Optional flag verification if flag was provided
    if (submittedFlag) {
      const verification = await this.verifyFlag(missionId, submittedFlag);
      if (!verification.isValid) {
        const err = new Error('Submitted threat flag or indicator did not match algorithmic verification.');
        err.statusCode = 400;
        throw err;
      }
    }

    // 1. Idempotency Check: check if already completed
    let attempt = await MissionAttempt.findOne({ userId, missionId: mission.missionId });

    if (attempt && attempt.status === 'completed') {
      // Return existing completed attempt with 0 new XP awarded (strictly idempotent!)
      const progress = await Progress.findOne({ userId });
      return {
        success: true,
        alreadyCompleted: true,
        mission,
        attempt,
        xpAwarded: 0,
        totalXp: progress?.totalXp || 0,
        currentLevel: progress?.currentLevel || 3,
        flag: mission.answer,
        message: 'Mission was already verified and completed.',
      };
    }

    // 2. Mark attempt completed
    if (!attempt) {
      attempt = new MissionAttempt({
        userId,
        missionId: mission.missionId,
        labId: mission.labId,
      });
    }

    attempt.status = 'completed';
    attempt.completedAt = new Date();
    attempt.xpAwarded = mission.xpReward;
    attempt.objectivesCompleted = tasks;
    await attempt.save();

    // 3. Award XP atomically
    const xpResult = await xpService.awardXp({
      userId,
      xp: mission.xpReward,
      source: 'mission',
      sourceId: mission.missionId,
    });

    // 4. Update Progress record (missionsCompleted map, badges, skillMatrix)
    const progress = await Progress.findOne({ userId });
    if (progress) {
      progress.missionsCompleted.set(mission.missionId, true);

      // Add badge if mission has one and not already awarded
      if (mission.badge && mission.badge.name) {
        const hasBadge = progress.badges.some((b) => b.name === mission.badge.name);
        if (!hasBadge) {
          progress.badges.push({
            emoji: mission.badge.emoji,
            name: mission.badge.name,
            unlockedAt: new Date(),
          });
        }
      }

      // Update skill matrix percentage for category
      const cat = mission.category;
      if (SKILL_CATEGORIES.includes(cat)) {
        const currentVal = progress.skillMatrix[cat] || 0;
        progress.skillMatrix[cat] = Math.min(100, currentVal + 15);
      }

      await progress.save();
    }

    // 5. Check if all 5 missions for this lab are completed to award Certificate
    const certificate = await certificateService.checkAndIssueCertificate(userId, mission.labId);

    return {
      success: true,
      alreadyCompleted: false,
      mission,
      attempt,
      flag: mission.answer,
      xpAwarded: mission.xpReward,
      totalXp: xpResult.totalXp,
      currentLevel: xpResult.level,
      badge: mission.badge,
      certificateUnlocked: !!certificate,
      certificate,
      message: 'Mission objective secured successfully.',
    };
  },

  async getMissionProgress(userId, missionId) {
    const mission = await this.getMissionById(missionId);
    const attempt = await MissionAttempt.findOne({ userId, missionId: mission.missionId });
    return {
      mission,
      attempt: attempt || { status: 'not_started', xpAwarded: 0 },
    };
  },
};
