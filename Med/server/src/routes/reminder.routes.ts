import { Router } from 'express';
import {
  getReminders,
  getTodayReminders,
  getUpcomingReminders,
  takeReminder,
  skipReminder,
  getAdherence,
  regenerateReminders
} from '../controllers/reminder.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getReminders);
router.get('/today', getTodayReminders);
router.get('/upcoming', getUpcomingReminders);
router.put('/:id/take', takeReminder);
router.put('/:id/skip', skipReminder);
router.get('/adherence/stats', getAdherence);
router.post('/regenerate', regenerateReminders);

export default router;
