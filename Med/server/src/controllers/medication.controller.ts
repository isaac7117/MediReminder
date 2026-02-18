import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateRemindersForMedication } from '../services/scheduler.service.js';

const prisma = new PrismaClient();

export const createMedication = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const {
      name,
      dosage,
      frequencyType,
      frequencyValue,
      frequencyTimes,
      frequencyDays,
      startDate,
      endDate,
      isContinuous,
      instructions,
      imageUrl,
      prescriptionImageUrl
    } = req.body;

    if (!name || !dosage || !frequencyType || !frequencyValue) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Obtener timezone del usuario
    const user = await prisma.user.findUnique({ where: { id: userId! }, select: { timezone: true } });
    const timezone = user?.timezone || 'America/Mexico_City';

    // Interpretar startDate/endDate como fecha local del usuario
    // Acepta strings "YYYY-MM-DD" o ISO strings
    const parseDateSafe = (d: any): Date => {
      if (!d) return new Date();
      const str = String(d);
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(`${str}T12:00:00Z`);
      const parsed = new Date(str);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    };
    const parsedStartDate = parseDateSafe(startDate);
    const parsedEndDate = endDate ? parseDateSafe(endDate) : null;

    const medication = await prisma.medication.create({
      data: {
        userId: userId!,
        name,
        dosage,
        frequencyType,
        frequencyValue,
        frequencyTimes: frequencyTimes || [],
        frequencyDays: frequencyDays || [],
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        isContinuous: isContinuous || false,
        instructions,
        imageUrl,
        prescriptionImageUrl
      }
    });

    // Generate reminders
    await generateRemindersForMedication(
      medication.id,
      userId!,
      parsedStartDate,
      parsedEndDate || undefined
    );

    res.status(201).json({
      message: 'Medication created successfully',
      medication
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMedications = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { active } = req.query;

    const whereCondition: any = { userId };
    if (active !== undefined) {
      whereCondition.active = active === 'true';
    }

    const medications = await prisma.medication.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ medications });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMedicationById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const medication = await prisma.medication.findFirst({
      where: { id, userId }
    });

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json({ medication });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMedication = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      name,
      dosage,
      frequencyType,
      frequencyValue,
      frequencyTimes,
      frequencyDays,
      endDate,
      isContinuous,
      instructions,
      imageUrl,
      prescriptionImageUrl,
      active
    } = req.body;

    const medication = await prisma.medication.findFirst({
      where: { id, userId }
    });

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    const updated = await prisma.medication.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(dosage !== undefined && { dosage }),
        ...(frequencyType !== undefined && { frequencyType }),
        ...(frequencyValue !== undefined && { frequencyValue }),
        ...(frequencyTimes !== undefined && { frequencyTimes }),
        ...(frequencyDays !== undefined && { frequencyDays }),
        ...(endDate !== undefined && { endDate: endDate ? (() => {
          const s = String(endDate);
          if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T12:00:00Z`);
          const d = new Date(s);
          return isNaN(d.getTime()) ? null : d;
        })() : null }),
        ...(isContinuous !== undefined && { isContinuous }),
        ...(instructions !== undefined && { instructions }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(prescriptionImageUrl !== undefined && { prescriptionImageUrl }),
        ...(active !== undefined && { active })
      }
    });

    // Regenerar recordatorios si cambiaron datos de frecuencia/horarios
    const scheduleChanged = frequencyType !== undefined || frequencyValue !== undefined || 
                            frequencyTimes !== undefined || frequencyDays !== undefined || 
                            endDate !== undefined || active !== undefined;
    if (scheduleChanged && updated.active) {
      try {
        await generateRemindersForMedication(
          updated.id,
          userId!,
          updated.startDate,
          updated.endDate || undefined
        );
      } catch (err) {
        console.warn('[Medication] Error regenerando recordatorios tras actualizar:', err);
      }
    }

    res.json({
      message: 'Medication updated successfully',
      medication: updated
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMedication = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const medication = await prisma.medication.findFirst({
      where: { id, userId }
    });

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    await prisma.medication.delete({
      where: { id }
    });

    res.json({ message: 'Medication deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
