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

    const medication = await prisma.medication.create({
      data: {
        userId: userId!,
        name,
        dosage,
        frequencyType,
        frequencyValue,
        frequencyTimes: frequencyTimes || [],
        frequencyDays: frequencyDays || [],
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
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
      new Date(startDate),
      endDate ? new Date(endDate) : undefined
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
        ...(name && { name }),
        ...(dosage && { dosage }),
        ...(frequencyType && { frequencyType }),
        ...(frequencyValue && { frequencyValue }),
        ...(frequencyTimes && { frequencyTimes }),
        ...(frequencyDays && { frequencyDays }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(isContinuous !== undefined && { isContinuous }),
        ...(instructions && { instructions }),
        ...(imageUrl && { imageUrl }),
        ...(prescriptionImageUrl && { prescriptionImageUrl }),
        ...(active !== undefined && { active })
      }
    });

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
