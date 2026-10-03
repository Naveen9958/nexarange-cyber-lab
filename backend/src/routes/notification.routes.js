import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', notificationController.getAll);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
