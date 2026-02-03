import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMedicationsFromRecipe = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { medications } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ message: 'No hay medicamentos para crear' });
    }

    console.log(`[AUTO] 💊 Creando ${medications.length} medicamentos automáticamente...`);

    const createdMedications = [];
    const createdReminders = [];

    for (const med of medications) {
      try {
        // Crear medicamento
        const medication = await prisma.medication.create({
          data: {
            userId,
            name: med.name || 'Medicamento',
            dosage: med.dosage || '',
            instructions: med.instructions || '',
            startDate: new Date(med.startDate || new Date()),
            endDate: med.endDate ? new Date(med.endDate) : null,
            isContinuous: med.isContinuous || false,
            frequencyType: med.frequencyType || 'daily',
            frequencyValue: med.frequencyValue || 1,
            frequencyTimes: med.frequencyTimes || ['09:00'],
            frequencyDays: med.frequencyDays || []
          }
        });

        createdMedications.push(medication);
        console.log(`[AUTO] ✅ Medicamento creado: ${medication.name}`);

        // Crear recordatorios automáticamente
        if (med.frequencyTimes && Array.isArray(med.frequencyTimes)) {
          const startDate = new Date(med.startDate || new Date());
          
          for (const timeStr of med.frequencyTimes) {
            // Parsear la hora (formato HH:MM)
            const [hours, minutes] = timeStr.split(':').map(Number);
            
            // Crear DateTime combinando la fecha con la hora
            const scheduledTime = new Date(startDate);
            scheduledTime.setHours(hours, minutes, 0, 0);
            
            const reminder = await prisma.reminder.create({
              data: {
                medicationId: medication.id,
                userId,
                scheduledTime: scheduledTime,
                status: 'pending'
              }
            });

            createdReminders.push(reminder);
            console.log(`[AUTO] 🔔 Recordatorio creado para ${medication.name} a las ${timeStr}`);
          }
        }
      } catch (medError: any) {
        console.error(`[AUTO] ❌ Error creando ${med.name}:`, medError.message);
      }
    }

    res.json({
      message: `✅ ${createdMedications.length} medicamentos y ${createdReminders.length} recordatorios creados automáticamente`,
      medications: createdMedications,
      reminders: createdReminders,
      count: {
        medications: createdMedications.length,
        reminders: createdReminders.length
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
    const { name, dosage, instructions, startDate, endDate, isContinuous, frequencyType, frequencyValue, frequencyTimes, frequencyDays } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!name) {
      return res.status(400).json({ message: 'El nombre del medicamento es requerido' });
    }

    console.log(`[AUTO] 💊 Creando medicamento con recordatorios: ${name}`);

    // Crear medicamento
    const medication = await prisma.medication.create({
      data: {
        userId,
        name,
        dosage,
        instructions,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isContinuous,
        frequencyType,
        frequencyValue,
        frequencyTimes,
        frequencyDays: frequencyDays || []
      }
    });

    console.log(`[AUTO] ✅ Medicamento creado: ${medication.name} (ID: ${medication.id})`);

    // Crear recordatorios
    const reminders = [];
    if (frequencyTimes && Array.isArray(frequencyTimes)) {
      const medStartDate = new Date(startDate);
      
      for (const timeStr of frequencyTimes) {
        // Parsear la hora (formato HH:MM)
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        // Crear DateTime combinando la fecha con la hora
        const scheduledTime = new Date(medStartDate);
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        const reminder = await prisma.reminder.create({
          data: {
            medicationId: medication.id,
            userId,
            scheduledTime: scheduledTime,
            status: 'pending'
          }
        });

        reminders.push(reminder);
        console.log(`[AUTO] 🔔 Recordatorio creado para ${name} a las ${timeStr}`);
      }
    }

    res.json({
      message: `✅ Medicamento creado con ${reminders.length} recordatorios`,
      medication,
      reminders
    });
  } catch (error: any) {
    console.error('[AUTO] Error:', error);
    res.status(500).json({
      message: 'Error al crear medicamento',
      error: error.message
    });
  }
};
