import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getDashboardData);

export default router;
