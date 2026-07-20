import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateRemindersForMedication } from '../services/scheduler.service.js';

const prisma = new PrismaClient();


function parseDateSafe(dateInput: any): Date {
  if (!dateInput) return new Date();
  const str = String(dateInput);
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(`${str}T12:00:00Z`);
  }
  
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

export const createMedicationsFromRecipe = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { medications, careProfileId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ message: 'No hay medicamentos para crear' });
    }

    console.log(`[AUTO]  Creando ${medications.length} medicamentos automáticamente...`);

    const createdMedications: any[] = [];
    let totalReminders = 0;

    for (const med of medications) {
      try {
        // Crear medicamento
        const medication = await prisma.medication.create({
          data: {
            userId,
            name: med.name || 'Medicamento',
            dosage: med.dosage || '',
            instructions: med.instructions || '',
            startDate: parseDateSafe(med.startDate),
            endDate: med.endDate ? parseDateSafe(med.endDate) : null,
            isContinuous: med.isContinuous || false,
            frequencyType: med.frequencyType || 'daily',
            frequencyValue: med.frequencyValue || 1,
            frequencyTimes: med.frequencyTimes || ['09:00'],
            frequencyDays: med.frequencyDays || [],
            ...((med.careProfileId || careProfileId) ? { careProfileId: med.careProfileId || careProfileId } : {})
          }
        });

        createdMedications.push(medication);
        console.log(`[AUTO]  Medicamento creado: ${medication.name}`);

        // Generar recordatorios usando el scheduler timezone-aware
        try {
          await generateRemindersForMedication(
            medication.id,
            userId,
            medication.startDate,
            medication.endDate || undefined
          );
          console.log(`[AUTO]  Recordatorios generados para ${medication.name}`);
          // Count generated reminders
          const count = await prisma.reminder.count({ where: { medicationId: medication.id, status: 'pending' } });
          totalReminders += count;
        } catch (remErr: any) {
          console.error(`[AUTO]  Error generando recordatorios para ${medication.name}:`, remErr.message);
        }
      } catch (medError: any) {
        console.error(`[AUTO]  Error creando ${med.name}:`, medError.message);
      }
    }

    res.json({
      message: ` ${createdMedications.length} medicamentos y ${totalReminders} recordatorios creados automáticamente`,
      medications: createdMedications,
      count: {
        medications: createdMedications.length,
        reminders: totalReminders
      }
    });
  } catch (error: any) {
    console.error('[AUTO] Error fatal:', error);
    res.status(500).json({
      message: 'Error al crear medicamentos automáticamente',
      error: error.message
    });
  }
};

export const createMedicationWithReminders = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { name, dosage, instructions, startDate, endDate, isContinuous, frequencyType, frequencyValue, frequencyTimes, frequencyDays, careProfileId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!name) {
      return res.status(400).json({ message: 'El nombre del medicamento es requerido' });
    }

    console.log(`[AUTO]  Creando medicamento con recordatorios: ${name}`);

    // Crear medicamento
    const medication = await prisma.medication.create({
      data: {
        userId,
        name,
        dosage,
        instructions,
        startDate: parseDateSafe(startDate),
        endDate: endDate ? parseDateSafe(endDate) : null,
        isContinuous,
        frequencyType,
        frequencyValue,
        frequencyTimes,
        frequencyDays: frequencyDays || [],
        ...(careProfileId ? { careProfileId } : {})
      }
    });

    console.log(`[AUTO]  Medicamento creado: ${medication.name} (ID: ${medication.id})`);

    // Generar recordatorios usando el scheduler timezone-aware
    let reminderCount = 0;
    try {
      await generateRemindersForMedication(
        medication.id,
        userId,
        medication.startDate,
        medication.endDate || undefined
      );
      reminderCount = await prisma.reminder.count({ where: { medicationId: medication.id, status: 'pending' } });
      console.log(`[AUTO]  ${reminderCount} recordatorios generados para ${name}`);
    } catch (remErr: any) {
      console.error(`[AUTO]  Error generando recordatorios para ${name}:`, remErr.message);
    }

    res.json({
      message: ` Medicamento creado con ${reminderCount} recordatorios`,
      medication,
      reminders: reminderCount
    });
  } catch (error: any) {
    console.error('[AUTO] Error:', error);
    res.status(500).json({
      message: 'Error al crear medicamento',
      error: error.message
    });
  }
};
