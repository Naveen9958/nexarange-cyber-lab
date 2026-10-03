import { TerminalSession } from '../models/TerminalSession.js';
import { TerminalCommand } from '../models/TerminalCommand.js';
import { ALLOWED_TERMINAL_COMMANDS, SIMULATED_COMMAND_RESPONSES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export const terminalService = {
  /**
   * Create or return an active safe simulated terminal session
   */
  async createSession(userId, labId = 1) {
    // Generate simulated session ID
    const sessionId = `NR-SES-${Math.floor(100000 + Math.random() * 900000)}`;

    const session = await TerminalSession.create({
      sessionId,
      userId,
      labId,
      status: 'active',
      startedAt: new Date(),
      lastActivityAt: new Date(),
    });

    return session;
  },

  /**
   * Get an existing terminal session with ownership verification
   */
  async getSession(userId, sessionId) {
    const session = await TerminalSession.findOne({
      $or: [{ sessionId }, { _id: sessionId.match(/^[0-9a-fA-F]{24}$/) ? sessionId : null }],
      userId,
    });

    if (!session) {
      const err = new Error('Terminal session not found or unauthorized.');
      err.statusCode = 404;
      throw err;
    }

    return session;
  },

  /**
   * Close a terminal session
   */
  async closeSession(userId, sessionId) {
    const session = await this.getSession(userId, sessionId);
    session.status = 'closed';
    session.closedAt = new Date();
    await session.save();
    return { success: true, message: 'Terminal session closed securely.' };
  },

  /**
   * Execute safe simulated command
   * ZERO REAL SHELL EXECUTION. Whitelist only.
   */
  async executeCommand(userId, sessionId, rawCommand, operatorMeta = {}) {
    const session = await this.getSession(userId, sessionId);

    if (session.status !== 'active') {
      const err = new Error('Terminal session is closed. Please start a new session.');
      err.statusCode = 400;
      throw err;
    }

    const command = (rawCommand || '').trim();
    const lowerCmd = command.toLowerCase();

    // Check against strict whitelist
    const isAllowed = ALLOWED_TERMINAL_COMMANDS.includes(lowerCmd);

    // Record command in audit trail
    await TerminalCommand.create({
      sessionId: session.sessionId,
      userId,
      command,
      allowed: isAllowed,
      timestamp: new Date(),
    });

    // Update session telemetry
    session.commandCount += 1;
    session.lastActivityAt = new Date();
    await session.save();

    if (!isAllowed) {
      logger.warn('Simulated terminal rejected unauthorized / non-whitelisted command', {
        userId,
        sessionId: session.sessionId,
        command,
      });

      return {
        sessionId: session.sessionId,
        command,
        allowed: false,
        output: `bash: ${command.split(' ')[0]}: command not recognized. Simulation terminal only accepts whitelisted utilities. Type "help" for allowed commands.`,
        lines: [
          {
            text: `bash: ${command.split(' ')[0]}: command not recognized. Simulation terminal only accepts whitelisted utilities. Type "help" for allowed commands.`,
            cls: 'err',
          },
        ],
      };
    }

    // Generate safe simulated response
    let responseText = SIMULATED_COMMAND_RESPONSES[lowerCmd] || '';

    // Dynamic identity interpolation for whoami & status
    if (lowerCmd === 'whoami') {
      const opName = operatorMeta.name || 'Operator';
      const opCallsign = operatorMeta.callsign || '0xOPERATOR';
      const opRole = operatorMeta.role || 'AI Security Analyst';
      const opClearance = operatorMeta.clearance || 'TS/SCI-AI';
      responseText = `Operator: ${opCallsign} (${opName})\nRole: ${opRole}\nClearance: ${opClearance}\nEnvironment: nexarange-kali-sandbox (Simulated Enclave)`;
    } else if (lowerCmd === 'status') {
      const opName = operatorMeta.name || 'Operator';
      const opCallsign = operatorMeta.callsign || '0xOPERATOR';
      responseText = `[ENCLAVE TELEMETRY STATUS]
  ● Security Enclave: LAB-01-SECURE
  ● Host: nexarange-kali (Linux 6.1.0-kali9-amd64)
  ● Operator: ${opCallsign} (${opName}) (Clearance: TS/SCI-AI)
  ● Tunnel: WireGuard mTLS / AES-256-GCM
  ● Threat Mitigation Engine: ARMED
  ● Active Defense Daemons: 4 running (auth-mon, mcp-audit, k8s-watch, net-sentry)`;
    }

    // Format output lines with appropriate styling classes for frontend
    const lines = responseText ? responseText.split('\n').map((line) => {
      let cls = '';
      if (line.includes('⚠') || line.includes('MALICIOUS') || line.includes('HIGH RISK') || line.includes('[!]')) {
        cls = 'warn';
      } else if (line.includes('●') || line.includes('[INITIATING') || line.includes('[SCAN COMPLETE]')) {
        cls = 'info';
      }
      return { text: line, cls };
    }) : [];

    return {
      sessionId: session.sessionId,
      command,
      allowed: true,
      output: responseText,
      lines,
    };
  },
};
