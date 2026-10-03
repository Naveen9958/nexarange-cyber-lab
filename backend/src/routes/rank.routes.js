import { Router } from 'express';
import * as rankController from '../controllers/rank.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/me', rankController.getMe);
router.get('/leaderboard', rankController.getLeaderboard);

export default router;
