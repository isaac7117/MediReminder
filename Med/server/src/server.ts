import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendNotificationToSubscriptions, sendPushNotification } from './services/notification.service.js';
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

// Track which reminders have already been notified in this server session
// Cleared on restart — which is good: after cold start we re-check recent reminders
const notifiedReminderIds = new Set<string>();

// Cron Job: Check reminders every minute and send notifications
// Looks back 5 minutes to catch reminders missed during server sleep/cold-start
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
    const oneMinuteLater = new Date(now.getTime() + 60000);

    // Get pending reminders from the last 5 minutes AND next 1 minute
    const reminders = await prisma.reminder.findMany({
      where: {
        status: 'pending',
        scheduledTime: {
          gte: fiveMinutesAgo,
          lte: oneMinuteLater
        }
      },
      include: {
        medication: true,
        user: true
      }
    });

    // Filter out already-notified reminders (within this session)
    const toNotify = reminders.filter(r => !notifiedReminderIds.has(r.id));

    if (toNotify.length > 0) {
      console.log(`[Cron] 🔔 ${toNotify.length} recordatorios para notificar (${reminders.length - toNotify.length} ya enviados)`);
    }

    for (const reminder of toNotify) {
      const user = reminder.user;
      const med = reminder.medication;
      const scheduledTime = new Date(reminder.scheduledTime);
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

        try {
          const results = await Promise.allSettled(
            user.pushSubscriptions.map((sub: string) => {
              return sendPushNotification(sub, {
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
              });
            })
          );

          // Clean up expired/invalid subscriptions
          const validSubs: string[] = [];
          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              validSubs.push(user.pushSubscriptions[index]);
            } else {
              console.warn(`[Cron] ⚠️ Push falló para suscripción ${index}:`, (result as PromiseRejectedResult).reason?.statusCode || (result as PromiseRejectedResult).reason?.message);
            }
          });

          // Update subscriptions if any were invalid
          if (validSubs.length < user.pushSubscriptions.length) {
            await prisma.user.update({
              where: { id: user.id },
              data: { pushSubscriptions: validSubs }
            });
            console.log(`[Cron] 🧹 Limpiadas ${user.pushSubscriptions.length - validSubs.length} suscripciones inválidas para ${user.email}`);
          }

          // Mark as notified in memory to avoid re-sending within this session
          notifiedReminderIds.add(reminder.id);

          console.log(`[Cron] ✅ Notificación enviada: ${med.name} → ${user.email}`);
        } catch (pushError: any) {
          console.error(`[Cron] ❌ Error enviando push para ${med.name}:`, pushError.message);
        }
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
    // Clean up notified set — remove entries older than 10 minutes to prevent memory leak
    // Since we can't track timestamps in a Set, just clear it every hour; the 5-min window handles re-sends
    notifiedReminderIds.clear();
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

// Keep-alive: self-ping every 10 minutes to prevent Render free tier from sleeping
cron.schedule('*/10 * * * *', async () => {
  const serverUrl = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL;
  if (!serverUrl || process.env.NODE_ENV !== 'production') return;
  try {
    const res = await fetch(`${serverUrl}/health`);
    console.log(`[Keep-alive] ✅ Self-ping → ${res.status}`);
  } catch (err: any) {
    console.error(`[Keep-alive] ❌ Self-ping failed:`, err.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // On startup: regenerate reminders in case server was down (cold start catch-up)
  if (process.env.NODE_ENV === 'production') {
    setTimeout(async () => {
      try {
        console.log('[Startup] 🔄 Cold-start: regenerando recordatorios...');
        await regenerateAllReminders();
        console.log('[Startup] ✅ Recordatorios regenerados tras cold start');
      } catch (error) {
        console.error('[Startup] Error regenerando recordatorios:', error);
      }
    }, 5000); // Wait 5s for DB connection to be ready
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
