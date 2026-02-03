import { Router } from 'express';
import { createMedicationsFromRecipe, createMedicationWithReminders } from '../controllers/auto-medication.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Proteger todas las rutas
router.use(authMiddleware);

// Crear medicamentos automáticamente desde receta analizada
router.post('/from-recipe', createMedicationsFromRecipe);

// Crear medicamento con recordatorios
router.post('/with-reminders', createMedicationWithReminders);

export default router;
