import { Router } from 'express';
import { body } from 'express-validator';
import * as terminalController from '../controllers/terminal.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/session', terminalController.createSession);
router.post(
  '/command',
  [
    body('sessionId').trim().notEmpty().withMessage('sessionId is required'),
    body('command').isString().withMessage('command must be a string'),
  ],
  validateRequest,
  terminalController.executeCommand
);
router.get('/session/:id', terminalController.getSession);
router.post('/session/:id/close', terminalController.closeSession);

export default router;
