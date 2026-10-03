import { Router } from 'express';
import * as labController from '../controllers/lab.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', labController.getAll);
router.get('/:id', labController.getById);
router.post('/:id/start', labController.start);
router.post('/:id/complete', labController.complete);
router.get('/:id/progress', labController.getProgress);

export default router;
