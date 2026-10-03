import { Router } from 'express';
import * as statsController from '../controllers/stats.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/overview', statsController.getOverview);
router.get('/skills', statsController.getSkills);
router.get('/xp-history', statsController.getXpHistory);
router.get('/session', statsController.getSessionStats);

export default router;
