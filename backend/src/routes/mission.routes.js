import { Router } from 'express';
import * as missionController from '../controllers/mission.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', missionController.getAll);
router.get('/:id', missionController.getById);
router.post('/:id/start', missionController.start);
router.post('/:id/complete', missionController.complete);
router.get('/:id/progress', missionController.getProgress);

export default router;
