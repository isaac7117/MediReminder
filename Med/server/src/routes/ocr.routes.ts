import { Router } from 'express';
import { scanPrescription, getUserScans } from '../controllers/ocr.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/scan', upload.single('prescription'), scanPrescription);
router.get('/scans', getUserScans);

export default router;
