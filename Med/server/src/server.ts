import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendNotificationToSubscriptions } from './services/notification.service.js';
import { regenerateAllReminders, markMissedReminders } from './services/scheduler.service.js';
import { runOcrFineTuningJob, refreshOcrTrainingJobs } from './services/ocr-training.service.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import medicationRoutes from './routes/medication.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import ocrRoutes from './routes/ocr.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import autoMedicationRoutes from './routes/auto-medication.routes.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Exact match
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow all Vercel preview URLs for the project
    if (origin.endsWith('.vercel.app') && allowedOrigins.some(o => o.endsWith('.vercel.app'))) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auto-medications', autoMedicationRoutes);

// Test endpoint - no auth required
app.post('/api/test-create', (req: Request, res: Response) => {
  console.log('[TEST] Received POST /test-create');
  console.log('[TEST] Body:', req.body);
  console.log('[TEST] Auth header:', req.headers.authorization);
  res.json({ message: 'Test endpoint working', received: req.body });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Cron Job: Check reminders every minute and send notifications
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const oneMinuteLater = new Date(now.getTime() + 60000);

    // Get all pending reminders for the next minute
    const reminders = await prisma.reminder.findMany({
      where: {
        status: 'pending',
        scheduledTime: {
          gte: now,
          lte: oneMinuteLater
        }
      },
      include: {
        medication: true,
        user: true
      }
    });

    for (const reminder of reminders) {
      const user = reminder.user;
      const med = reminder.medication;
      const scheduledTime = new Date(reminder.scheduledTime);
      // Obtener la zona horaria del usuario para formatear la hora correctamente
      const userTz = user.timezone || 'America/Mexico_City';
      const timeStr = scheduledTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: userTz });

      if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
        const bodyParts = [
          `💊 ${med.dosage}`,
          `🕐 Hora programada: ${timeStr}`,
        ];
        if (med.instructions) {
          bodyParts.push(`📋 ${med.instructions}`);
        }

        await sendNotificationToSubscriptions(
          user.pushSubscriptions,
          {
            title: `Es hora de tomar: ${med.name}`,
            body: bodyParts.join('\n'),
            tag: `reminder-${reminder.id}`,
            data: {
              type: 'medication-reminder',
              reminderId: reminder.id,
              medicationId: med.id,
              medicationName: med.name,
              dosage: med.dosage,
              instructions: med.instructions || '',
              scheduledTime: reminder.scheduledTime.toISOString(),
              apiBaseUrl: process.env.SERVER_URL || `http://localhost:${PORT}`
            }
          }
        );
      }
    }
  } catch (error) {
    console.error('Error in reminder cron job:', error);
  }
});

// Cron Job: Mark missed reminders (1 hour after scheduled time)
cron.schedule('0 * * * *', async () => {
  try {
    await markMissedReminders();
  } catch (error) {
    console.error('Error in missed reminder cron job:', error);
  }
});

// Cron Job: Regenerar recordatorios cada día a las 00:05 (después de medianoche)
cron.schedule('5 0 * * *', async () => {
  try {
    console.log('[Cron] 🔄 Regenerando recordatorios diarios...');
    await regenerateAllReminders();
  } catch (error) {
    console.error('Error in daily reminder regeneration:', error);
  }
});

// Cron Job: Entrenamiento OCR automático (si está habilitado)
const ocrTrainingCron = process.env.OCR_TRAINING_CRON || '15 3 * * *';
cron.schedule(ocrTrainingCron, async () => {
  if (process.env.OCR_TRAINING_AUTO_ENABLED !== 'true') return;
  try {
    console.log('[Cron] 🤖 Iniciando entrenamiento OCR automático...');
    await runOcrFineTuningJob();
  } catch (error) {
    console.error('Error in OCR training cron job:', error);
  }
});

// Cron Job: Refrescar estado de jobs de fine-tuning
cron.schedule('*/30 * * * *', async () => {
  if (!process.env.OPENAI_API_KEY) return;
  try {
    await refreshOcrTrainingJobs();
  } catch (error) {
    console.error('Error refreshing OCR training jobs:', error);
  }
});

// Cron Job: También regenerar recordatorios cada 6 horas para mantenerlos actualizados
cron.schedule('0 */6 * * *', async () => {
  try {
    console.log('[Cron] 🔄 Verificando y regenerando recordatorios...');
    await regenerateAllReminders();
  } catch (error) {
    console.error('Error in reminder check cron job:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
