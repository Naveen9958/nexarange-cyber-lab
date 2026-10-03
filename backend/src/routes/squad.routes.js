import { Router } from 'express';
import * as squadController from '../controllers/squad.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', squadController.getSquad);

export default router;
