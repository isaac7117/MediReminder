import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendNotificationToSubscriptions, sendPushNotification } from './services/notification.service.js';
import { regenerateAllReminders, markMissedReminders } from './services/scheduler.service.js';
import { runOcrFineTuningJob, refreshOcrTrainingJobs, loadLatestFineTunedModel } from './services/ocr-training.service.js';
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

// Notification diagnostics (no auth for debugging)
app.get('/api/notifications/diagnostics', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60 * 60000);
    const windowEnd = new Date(now.getTime() + 60 * 60000);

    // Use select instead of include to avoid orphaned relation errors
    const pendingReminders = await prisma.reminder.findMany({
      where: {
        status: 'pending',
        scheduledTime: { gte: windowStart, lte: windowEnd }
      },
      select: { id: true, userId: true, medicationId: true, scheduledTime: true, status: true },
      take: 20
    });

    // Resolve users and medications individually to handle orphans
    const enriched = await Promise.all(pendingReminders.map(async (r) => {
      const user = await prisma.user.findUnique({ where: { id: r.userId }, select: { email: true, pushSubscriptions: true, timezone: true } }).catch(() => null);
      const med = await prisma.medication.findUnique({ where: { id: r.medicationId }, select: { name: true } }).catch(() => null);
      return {
        id: r.id,
        medication: med?.name || `ORPHAN (medId: ${r.medicationId})`,
        scheduledTime: r.scheduledTime.toISOString(),
        userEmail: user?.email || `ORPHAN (userId: ${r.userId})`,
        userTimezone: user?.timezone || 'unknown',
        pushSubscriptions: user?.pushSubscriptions?.length || 0,
        alreadyNotified: notifiedReminderIds.has(r.id),
        orphaned: !user || !med,
      };
    }));

    const totalPending = await prisma.reminder.count({ where: { status: 'pending' } });
    const totalActive = await prisma.medication.count({ where: { active: true } });

    res.json({
      serverTime: now.toISOString(),
      notifiedIdsCount: notifiedReminderIds.size,
      vapidConfigured: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
      totalPendingReminders: totalPending,
      totalActiveMedications: totalActive,
      orphanedInWindow: enriched.filter(r => r.orphaned).length,
      remindersInWindow: enriched
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Track which reminders have already been notified in this server session
// Cleared on restart — which is good: after cold start we re-check recent reminders
const notifiedReminderIds = new Set<string>();

/**
 * Sends push notifications for pending reminders within a time window.
 * Shared by the cron job and the cold-start catch-up.
 */
async function sendPendingNotifications(lookbackMinutes: number, lookaheadMinutes: number) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - lookbackMinutes * 60000);
  const windowEnd = new Date(now.getTime() + lookaheadMinutes * 60000);

  // First, get reminder IDs only (no joins that can fail on orphaned records)
  const reminderIds = await prisma.reminder.findMany({
    where: {
      status: 'pending',
      scheduledTime: {
        gte: windowStart,
        lte: windowEnd
      }
    },
    select: { id: true, userId: true, medicationId: true, scheduledTime: true }
  });

  if (reminderIds.length === 0) {
    const minuteMark = now.getMinutes();
    if (minuteMark % 5 === 0) {
      console.log(`[Cron] \u{1F50D} Ventana ${windowStart.toISOString()} \u2192 ${windowEnd.toISOString()} | 0 recordatorios pendientes | notifiedIds: ${notifiedReminderIds.size}`);
    }
    return 0;
  }

  const toProcess = reminderIds.filter(r => !notifiedReminderIds.has(r.id));
  if (toProcess.length === 0) return 0;

  let notifiedCount = 0;

  for (const rem of toProcess) {
    try {
      const user = await prisma.user.findUnique({ where: { id: rem.userId } });
      const medication = await prisma.medication.findUnique({ where: { id: rem.medicationId } });

      // Clean up orphaned reminder
      if (!user || !medication) {
        console.warn(`[Cron] \u{1F9F9} Eliminando recordatorio hu\u00e9rfano ${rem.id} (user: ${!!user}, med: ${!!medication})`);
        await prisma.reminder.delete({ where: { id: rem.id } }).catch(() => {});
        notifiedReminderIds.add(rem.id);
        continue;
      }

      const scheduledTime = new Date(rem.scheduledTime);
      const userTz = user.timezone || 'America/Mexico_City';
      const timeStr = scheduledTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: userTz });

      if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
        const bodyParts = [
          `\u{1F48A} ${medication.dosage}`,
          `\u{1F550} Hora programada: ${timeStr}`,
        ];
        if (medication.instructions) {
          bodyParts.push(`\u{1F4CB} ${medication.instructions}`);
        }

        const results = await Promise.allSettled(
          user.pushSubscriptions.map((sub: string) => {
            return sendPushNotification(sub, {
              title: `Es hora de tomar: ${medication.name}`,
              body: bodyParts.join('\n'),
              tag: `reminder-${rem.id}`,
              data: {
                type: 'medication-reminder',
                reminderId: rem.id,
                medicationId: medication.id,
                medicationName: medication.name,
                dosage: medication.dosage,
                instructions: medication.instructions || '',
                scheduledTime: rem.scheduledTime.toISOString(),
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
            console.warn(`[Cron] \u26a0\ufe0f Push fall\u00f3 para suscripci\u00f3n ${index}:`, (result as PromiseRejectedResult).reason?.statusCode || (result as PromiseRejectedResult).reason?.message);
          }
        });

        if (validSubs.length < user.pushSubscriptions.length) {
          await prisma.user.update({
            where: { id: user.id },
            data: { pushSubscriptions: validSubs }
          });
          console.log(`[Cron] \u{1F9F9} Limpiadas ${user.pushSubscriptions.length - validSubs.length} suscripciones inv\u00e1lidas para ${user.email}`);
        }

        notifiedReminderIds.add(rem.id);
        notifiedCount++;
        console.log(`[Cron] \u2705 Notificaci\u00f3n enviada: ${medication.name} \u2192 ${user.email}`);
      } else {
        notifiedReminderIds.add(rem.id);
      }
    } catch (pushError: any) {
      console.error(`[Cron] \u274c Error procesando recordatorio ${rem.id}:`, pushError.message);
      notifiedReminderIds.add(rem.id);
    }
  }

  return notifiedCount;
}

// Cron Job: Check reminders every minute and send notifications
cron.schedule('* * * * *', async () => {
  try {
    const count = await sendPendingNotifications(5, 1);
    if (count > 0) {
      console.log(`[Cron] ✅ Ciclo completado: ${count} notificados`);
    }
  } catch (error) {
    console.error('[Cron] Error in reminder notification job:', error);
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // On startup: regenerate reminders AND send missed notifications (cold start catch-up)
  if (process.env.NODE_ENV === 'production') {
    setTimeout(async () => {
      try {
        // Load latest fine-tuned OCR model from DB if available
        await loadLatestFineTunedModel();

        console.log('[Startup] 🔄 Cold-start: regenerando recordatorios...');
        await regenerateAllReminders();
        console.log('[Startup] ✅ Recordatorios regenerados tras cold start');

        // Send notifications for any reminders missed during redeploy (up to 30 min back)
        console.log('[Startup] 🔔 Enviando notificaciones pendientes tras reinicio...');
        const sent = await sendPendingNotifications(30, 5);
        console.log(`[Startup] ✅ Catch-up completado: ${sent} notificaciones enviadas`);
      } catch (error) {
        console.error('[Startup] Error en cold-start catch-up:', error);
      }
    }, 5000); // Wait 5s for DB connection to be ready
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
