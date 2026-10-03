import { Router } from 'express';
import * as certController from '../controllers/certificate.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', certController.getAll);
router.get('/:id', certController.getById);

export default router;
