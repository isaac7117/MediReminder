import { Router } from 'express';
import {
  createMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  deleteMedication
} from '../controllers/medication.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createMedication);
router.get('/', getMedications);
router.get('/:id', getMedicationById);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);

export default router;
