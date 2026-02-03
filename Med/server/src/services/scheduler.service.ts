import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Número máximo de días para generar recordatorios por adelantado
const MAX_DAYS_AHEAD = 7;

export interface ReminderSchedule {
  reminderId: string;
  medicationId: string;
  userId: string;
  scheduledTime: Date;
}

export const generateRemindersForMedication = async (
  medicationId: string,
  userId: string,
  startDate: Date,
  endDate?: Date
): Promise<void> => {
  const prismaClient = new PrismaClient();

  try {
    const medication = await prismaClient.medication.findUnique({
      where: { id: medicationId }
    });

    if (!medication) throw new Error('Medication not found');

    // Calcular la fecha límite para generar recordatorios
    const now = new Date();
    const maxFutureDate = new Date(now.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);
    
    // Si hay fecha de fin del medicamento, usar la menor entre esa y los 7 días
    let effectiveEndDate: Date;
    if (endDate) {
      effectiveEndDate = endDate < maxFutureDate ? endDate : maxFutureDate;
    } else if (medication.endDate) {
      effectiveEndDate = medication.endDate < maxFutureDate ? medication.endDate : maxFutureDate;
    } else {
      effectiveEndDate = maxFutureDate;
    }

    // Solo eliminar recordatorios FUTUROS pendientes para este medicamento
    await prismaClient.reminder.deleteMany({
      where: {
        medicationId,
        userId,
        status: 'pending',
        scheduledTime: {
          gte: now
        }
      }
    });

    const reminders: any[] = [];
    let currentDate = new Date(startDate > now ? startDate : now);
    currentDate.setHours(0, 0, 0, 0);

    console.log(`[Scheduler] Generando recordatorios para ${medication.name} desde ${currentDate.toISOString()} hasta ${effectiveEndDate.toISOString()}`);

    while (currentDate <= effectiveEndDate) {
      if (medication.frequencyType === 'daily') {
        for (const time of medication.frequencyTimes) {
          const [hours, minutes] = time.split(':').map(Number);
          const reminderTime = new Date(currentDate);
          reminderTime.setHours(hours, minutes, 0, 0);

          // Solo crear recordatorios futuros
          if (reminderTime > now && reminderTime <= effectiveEndDate) {
            reminders.push({
              medicationId,
              userId,
              scheduledTime: reminderTime,
              status: 'pending'
            });
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (medication.frequencyType === 'weekly') {
        for (const day of medication.frequencyDays) {
          const daysUntilTarget = (day - currentDate.getDay() + 7) % 7;
          const targetDate = new Date(currentDate);
          targetDate.setDate(targetDate.getDate() + daysUntilTarget);

          for (const time of medication.frequencyTimes) {
            const [hours, minutes] = time.split(':').map(Number);
            const reminderTime = new Date(targetDate);
            reminderTime.setHours(hours, minutes, 0, 0);

            if (reminderTime > now && reminderTime <= effectiveEndDate) {
              reminders.push({
                medicationId,
                userId,
                scheduledTime: reminderTime,
                status: 'pending'
              });
            }
          }
        }
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (medication.frequencyType === 'hourly') {
        for (let i = 0; i < medication.frequencyValue * 24; i++) {
          const reminderTime = new Date(currentDate);
          reminderTime.setHours(reminderTime.getHours() + medication.frequencyValue);

          if (reminderTime > now && reminderTime <= effectiveEndDate) {
            reminders.push({
              medicationId,
              userId,
              scheduledTime: reminderTime,
              status: 'pending'
            });
          }
        }
        break;
      }
    }

    console.log(`[Scheduler] Creando ${reminders.length} recordatorios para ${medication.name}`);

    // Create reminders in batches
    const batchSize = 100;
    for (let i = 0; i < reminders.length; i += batchSize) {
      await prismaClient.reminder.createMany({
        data: reminders.slice(i, i + batchSize)
      });
    }
  } finally {
    await prismaClient.$disconnect();
  }
};

// Función para regenerar recordatorios de todos los medicamentos activos
export const regenerateAllReminders = async (): Promise<void> => {
  const prismaClient = new PrismaClient();

  try {
    console.log('[Scheduler] 🔄 Regenerando recordatorios para todos los medicamentos activos...');
    
    // Obtener todos los medicamentos activos
    const activeMedications = await prismaClient.medication.findMany({
      where: {
        active: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      }
    });

    console.log(`[Scheduler] Encontrados ${activeMedications.length} medicamentos activos`);

    for (const medication of activeMedications) {
      try {
        await generateRemindersForMedication(
          medication.id,
          medication.userId,
          medication.startDate
        );
      } catch (error) {
        console.error(`[Scheduler] Error regenerando recordatorios para ${medication.name}:`, error);
      }
    }

    console.log('[Scheduler] ✅ Regeneración de recordatorios completada');
  } finally {
    await prismaClient.$disconnect();
  }
};

// Función para marcar recordatorios pasados como "perdidos"
export const markMissedReminders = async (): Promise<void> => {
  const prismaClient = new PrismaClient();

  try {
    const now = new Date();
    // Dar un margen de 2 horas antes de marcar como perdido
    const cutoffTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const result = await prismaClient.reminder.updateMany({
      where: {
        status: 'pending',
        scheduledTime: {
          lt: cutoffTime
        }
      },
      data: {
        status: 'missed'
      }
    });

    if (result.count > 0) {
      console.log(`[Scheduler] Marcados ${result.count} recordatorios como perdidos`);
    }
  } finally {
    await prismaClient.$disconnect();
  }
};

export const getUpcomingReminders = async (
  userId: string,
  hours: number = 24
): Promise<ReminderSchedule[]> => {
  const prisma = new PrismaClient();

  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        status: 'pending',
        scheduledTime: {
          gte: now,
          lte: futureDate
        }
      },
      orderBy: {
        scheduledTime: 'asc'
      }
    });

    return reminders.map((r: any) => ({
      reminderId: r.id,
      medicationId: r.medicationId,
      userId: r.userId,
      scheduledTime: r.scheduledTime
    }));
  } finally {
    await prisma.$disconnect();
  }
};
