import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { THEMES } from '../utils/constants.js';

const router = Router();

router.use(requireAuth);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

router.get('/settings', userController.getSettings);
router.patch(
  '/settings',
  [
    body('themePreference')
      .isIn(THEMES)
      .withMessage(`Theme must be one of: ${THEMES.join(', ')}`),
  ],
  validateRequest,
  userController.updateSettings
);

export default router;
