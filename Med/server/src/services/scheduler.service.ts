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

/**
 * Convierte una fecha-string "YYYY-MM-DD" y hora "HH:MM" en una zona horaria
 * específica a un objeto Date en UTC.
 * Por ejemplo: dateStr="2026-02-17", timeStr="09:00", tz="America/Mexico_City"
 * → 2026-02-17T15:00:00.000Z (porque Mexico_City es UTC-6)
 */
function localTimeToUTC(dateStr: string, timeStr: string, timezone: string): Date {
  // Construir string como si fuera hora local en esa zona
  const [hours, minutes] = timeStr.split(':').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  // Usar Intl para calcular el offset de la zona horaria en una fecha específica
  const fakeDate = new Date(`${dateStr}T${pad(hours)}:${pad(minutes)}:00`);
  
  // Obtener la representación de la fecha en la zona horaria del usuario
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });

  // Encontrar el offset: crear una fecha UTC y ver cómo se muestra en la zona del usuario
  // Estrategia: iterar para encontrar el UTC que corresponde a la hora local deseada
  // Método directo: calcular offset usando la zona horaria
  const targetLocal = `${dateStr}T${pad(hours)}:${pad(minutes)}:00`;
  
  // Estimación inicial: asumir UTC y ajustar
  let utcEstimate = new Date(`${targetLocal}Z`);
  
  // Obtener cómo se ve la estimación UTC en la zona del usuario
  const parts = formatter.formatToParts(utcEstimate);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0';
  const localHour = parseInt(getPart('hour'));
  const localMinute = parseInt(getPart('minute'));
  const localDay = parseInt(getPart('day'));
  const localMonth = parseInt(getPart('month'));
  const localYear = parseInt(getPart('year'));
  
  // Calcular diferencia entre lo que queremos y lo que obtuvimos
  const wantedMs = new Date(`${targetLocal}Z`).getTime();
  const gotLocal = new Date(`${localYear}-${pad(localMonth)}-${pad(localDay)}T${pad(localHour)}:${pad(localMinute)}:00Z`).getTime();
  const offsetMs = gotLocal - wantedMs;
  
  // La hora UTC correcta es: estimación - offset
  return new Date(utcEstimate.getTime() - offsetMs);
}

/**
 * Obtiene la fecha "YYYY-MM-DD" en la zona horaria del usuario para un instante dado.
 */
function getLocalDateStr(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  return formatter.format(date); // Returns YYYY-MM-DD
}

/**
 * Obtiene el día de la semana (0=domingo) en la zona horaria del usuario.
 */
function getLocalDayOfWeek(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short'
  });
  const dayName = formatter.format(date);
  const days: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return days[dayName] ?? 0;
}

export const generateRemindersForMedication = async (
  medicationId: string,
  userId: string,
  startDate: Date,
  endDate?: Date
): Promise<void> => {
  try {
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId }
    });

    if (!medication) throw new Error('Medication not found');

    // Obtener timezone del usuario
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
    const timezone = user?.timezone || 'America/Mexico_City';

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
    await prisma.reminder.deleteMany({
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
    
    // Determinar la fecha de inicio en la zona del usuario
    const effectiveStart = startDate > now ? startDate : now;
    let currentDateStr = getLocalDateStr(effectiveStart, timezone);
    const endDateStr = getLocalDateStr(effectiveEndDate, timezone);

    console.log(`[Scheduler] Generando recordatorios para ${medication.name} desde ${currentDateStr} hasta ${endDateStr} (tz: ${timezone})`);

    // Iterar por días en la zona del usuario
    while (currentDateStr <= endDateStr) {
      if (medication.frequencyType === 'daily' || medication.frequencyType === 'custom') {
        for (const time of medication.frequencyTimes) {
          const reminderTime = localTimeToUTC(currentDateStr, time, timezone);

          if (reminderTime > now && reminderTime <= effectiveEndDate) {
            reminders.push({
              medicationId,
              userId,
              scheduledTime: reminderTime,
              status: 'pending'
            });
          }
        }
      } else if (medication.frequencyType === 'weekly') {
        const currentDow = getLocalDayOfWeek(
          localTimeToUTC(currentDateStr, '12:00', timezone), timezone
        );
        for (const day of medication.frequencyDays) {
          const daysUntilTarget = (day - currentDow + 7) % 7;
          // Calcular la fecha objetivo
          const baseDate = new Date(`${currentDateStr}T12:00:00Z`);
          baseDate.setDate(baseDate.getDate() + daysUntilTarget);
          const targetDateStr = getLocalDateStr(baseDate, timezone);

          for (const time of medication.frequencyTimes) {
            const reminderTime = localTimeToUTC(targetDateStr, time, timezone);

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
        // Avanzar 7 días
        const jumpDate = new Date(`${currentDateStr}T12:00:00Z`);
        jumpDate.setDate(jumpDate.getDate() + 7);
        currentDateStr = getLocalDateStr(jumpDate, timezone);
        continue;
      } else if (medication.frequencyType === 'hourly') {
        const hourInterval = medication.frequencyValue || 1;
        // 8am a 10pm en hora local del usuario
        let hourCursor = localTimeToUTC(currentDateStr, '08:00', timezone);
        const dayEnd = localTimeToUTC(currentDateStr, '22:00', timezone);

        while (hourCursor <= dayEnd && hourCursor <= effectiveEndDate) {
          if (hourCursor > now) {
            reminders.push({
              medicationId,
              userId,
              scheduledTime: new Date(hourCursor),
              status: 'pending'
            });
          }
          hourCursor = new Date(hourCursor.getTime() + hourInterval * 60 * 60 * 1000);
        }
      } else {
        console.warn(`[Scheduler] Tipo de frecuencia desconocido: ${medication.frequencyType}, tratando como diario`);
        for (const time of medication.frequencyTimes) {
          const reminderTime = localTimeToUTC(currentDateStr, time, timezone);

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
      // Avanzar un día
      const nextDay = new Date(`${currentDateStr}T12:00:00Z`);
      nextDay.setDate(nextDay.getDate() + 1);
      currentDateStr = getLocalDateStr(nextDay, timezone);
    }

    console.log(`[Scheduler] Creando ${reminders.length} recordatorios para ${medication.name}`);

    // Create reminders in batches
    const batchSize = 100;
    for (let i = 0; i < reminders.length; i += batchSize) {
      await prisma.reminder.createMany({
        data: reminders.slice(i, i + batchSize)
      });
    }
  } catch (error) {
    console.error(`[Scheduler] Error generando recordatorios para medicamento ${medicationId}:`, error);
    throw error;
  }
};

// Función para regenerar recordatorios de todos los medicamentos activos
export const regenerateAllReminders = async (): Promise<void> => {
  try {
    console.log('[Scheduler] 🔄 Regenerando recordatorios para todos los medicamentos activos...');
    
    // Obtener todos los medicamentos activos
    const activeMedications = await prisma.medication.findMany({
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
  } catch (error) {
    console.error('[Scheduler] Error en regeneración:', error);
    throw error;
  }
};

// Función para marcar recordatorios pasados como "perdidos"
export const markMissedReminders = async (): Promise<void> => {
  try {
    const now = new Date();
    // Dar un margen de 2 horas antes de marcar como perdido
    const cutoffTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const result = await prisma.reminder.updateMany({
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
  } catch (error) {
    console.error('[Scheduler] Error marcando recordatorios perdidos:', error);
    throw error;
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
