import { Router } from 'express';
import { scanPrescription, getUserScans, submitOcrFeedback, exportOcrTrainingDataset, listOcrTrainingSamples, updateOcrTrainingSample, deleteOcrTrainingSample, getOcrMetrics, listOcrTrainingJobs, triggerOcrTrainingJob, refreshOcrTrainingJobsStatus } from '../controllers/ocr.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/scan', upload.single('prescription'), scanPrescription);
router.get('/scans', getUserScans);
router.post('/feedback', submitOcrFeedback);
router.get('/training-dataset', exportOcrTrainingDataset);
router.get('/admin/samples', listOcrTrainingSamples);
router.patch('/admin/samples/:id', updateOcrTrainingSample);
router.delete('/admin/samples/:id', deleteOcrTrainingSample);
router.get('/admin/metrics', getOcrMetrics);
router.get('/admin/training-jobs', listOcrTrainingJobs);
router.post('/admin/train', triggerOcrTrainingJob);
router.post('/admin/training-jobs/refresh', refreshOcrTrainingJobsStatus);

export default router;
