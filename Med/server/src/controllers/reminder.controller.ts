import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendNotificationToSubscriptions } from '../services/notification.service.js';
import { regenerateAllReminders, generateRemindersForMedication } from '../services/scheduler.service.js';

const prisma = new PrismaClient();

/** Convierte medianoche local a UTC */
function localMidnightToUTC(dateStr: string, timezone: string): Date {
  const utcEstimate = new Date(`${dateStr}T00:00:00Z`);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(utcEstimate);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0';
  const pad = (n: number) => String(n).padStart(2, '0');
  const localH = parseInt(getPart('hour'));
  const localM = parseInt(getPart('minute'));
  const localD = parseInt(getPart('day'));
  const localMo = parseInt(getPart('month'));
  const localY = parseInt(getPart('year'));
  const wantedMs = utcEstimate.getTime();
  const gotLocalMs = new Date(`${localY}-${pad(localMo)}-${pad(localD)}T${pad(localH)}:${pad(localM)}:00Z`).getTime();
  const offsetMs = gotLocalMs - wantedMs;
  return new Date(utcEstimate.getTime() - offsetMs);
}

export const getReminders = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { status, startDate, endDate } = req.query;

    const whereCondition: any = { userId };

    if (status) {
      whereCondition.status = status;
    }

    if (startDate || endDate) {
      whereCondition.scheduledTime = {};
      if (startDate) whereCondition.scheduledTime.gte = new Date(startDate as string);
      if (endDate) whereCondition.scheduledTime.lte = new Date(endDate as string);
    }

    const reminders = await prisma.reminder.findMany({
      where: whereCondition,
      include: {
        medication: true
      },
      orderBy: { scheduledTime: 'asc' }
    });

    res.json({ reminders });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTodayReminders = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Obtener timezone del usuario para calcular "hoy" correctamente
    const user = await prisma.user.findUnique({ where: { id: userId! }, select: { timezone: true } });
    const timezone = user?.timezone || 'America/Mexico_City';
    
    // Calcular inicio y fin del día en la zona horaria del usuario
    const now = new Date();
    const todayLocalStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    
    // Crear medianoche local del usuario en UTC
    const todayStart = localMidnightToUTC(todayLocalStr, timezone);
    const tomorrow = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const today = todayStart;

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        scheduledTime: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        medication: true
      },
      orderBy: { scheduledTime: 'asc' }
    });

    res.json({ reminders });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUpcomingReminders = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { hours = '24' } = req.query;

    const parsedHours = parseInt(hours as string);
    if (isNaN(parsedHours) || parsedHours < 1 || parsedHours > 168) {
      return res.status(400).json({ message: 'Parámetro hours inválido (1-168)' });
    }

    const now = new Date();
    const futureDate = new Date(now.getTime() + parsedHours * 60 * 60 * 1000);

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        status: 'pending',
        scheduledTime: {
          gte: now,
          lte: futureDate
        }
      },
      include: {
        medication: true
      },
      orderBy: { scheduledTime: 'asc' }
    });

    res.json({ reminders });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const takeReminder = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { notes } = req.body;

    const reminder = await prisma.reminder.findFirst({
      where: { id, userId }
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.status !== 'pending') {
      return res.status(400).json({ message: `No se puede marcar como tomado un recordatorio con estado '${reminder.status}'` });
    }

    const updated = await prisma.reminder.update({
      where: { id },
      data: {
        status: 'taken',
        takenAt: new Date(),
        notes
      },
      include: {
        medication: true
      }
    });

    res.json({
      message: 'Reminder marked as taken',
      reminder: updated
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const skipReminder = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const reminder = await prisma.reminder.findFirst({
      where: { id, userId }
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.status !== 'pending') {
      return res.status(400).json({ message: `No se puede omitir un recordatorio con estado '${reminder.status}'` });
    }

    const updated = await prisma.reminder.update({
      where: { id },
      data: {
        status: 'skipped',
        notes: reason
      },
      include: {
        medication: true
      }
    });

    res.json({
      message: 'Reminder skipped',
      reminder: updated
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdherence = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { days = '7' } = req.query;

    const daysBack = parseInt(days as string);
    if (isNaN(daysBack) || daysBack < 1 || daysBack > 365) {
      return res.status(400).json({ message: 'Parámetro days inválido (1-365)' });
    }

    // Obtener timezone del usuario
    const user = await prisma.user.findUnique({ where: { id: userId! }, select: { timezone: true } });
    const timezone = user?.timezone || 'America/Mexico_City';

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        scheduledTime: {
          gte: startDate
        }
      }
    });

    const total = reminders.length;
    const taken = reminders.filter((r: any) => r.status === 'taken').length;
    const missed = reminders.filter((r: any) => r.status === 'missed').length;
    const skipped = reminders.filter((r: any) => r.status === 'skipped').length;

    const adherenceRate = total > 0 ? (taken / total) * 100 : 0;

    // Group by date using user's timezone
    const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
    const dailyStats: Record<string, any> = {};
    reminders.forEach((reminder: any) => {
      const date = dateFormatter.format(new Date(reminder.scheduledTime));
      if (!dailyStats[date]) {
        dailyStats[date] = { date, taken: 0, missed: 0, skipped: 0, total: 0 };
      }
      dailyStats[date].total++;
      if (reminder.status === 'taken') dailyStats[date].taken++;
      else if (reminder.status === 'missed') dailyStats[date].missed++;
      else if (reminder.status === 'skipped') dailyStats[date].skipped++;
    });

    res.json({
      adherenceRate,
      total,
      taken,
      missed,
      skipped,
      days: daysBack,
      dailyStats: Object.values(dailyStats)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Regenerar todos los recordatorios (limpia los existentes y crea nuevos para 7 días)
export const regenerateReminders = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    console.log(`[Reminders] 🔄 Usuario ${userId} solicitó regenerar recordatorios`);

    // Eliminar todos los recordatorios pendientes del usuario
    const deleted = await prisma.reminder.deleteMany({
      where: {
        userId,
        status: 'pending'
      }
    });

    console.log(`[Reminders] 🗑️ Eliminados ${deleted.count} recordatorios pendientes`);

    // Obtener medicamentos activos del usuario
    const medications = await prisma.medication.findMany({
      where: {
        userId,
        active: true
      }
    });

    // Regenerar recordatorios para cada medicamento
    for (const medication of medications) {
      await generateRemindersForMedication(
        medication.id,
        userId!,
        medication.startDate
      );
    }

    // Obtener el nuevo conteo
    const newCount = await prisma.reminder.count({
      where: {
        userId,
        status: 'pending'
      }
    });

    res.json({
      message: 'Recordatorios regenerados exitosamente',
      deletedCount: deleted.count,
      newCount,
      medicationsProcessed: medications.length
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
