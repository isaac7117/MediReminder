import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { analyzePrescriptionWithOpenAI } from '../services/openai.service.js';
import { analyzePrescriptionWithGemini, extractMedicationDetails } from '../services/gemini.service.js';
import { analyzeWithTesseract } from '../services/tesseract-ocr.service.js';

const prisma = new PrismaClient();

export const scanPrescription = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    console.log('[OCR] 📸 Procesando imagen:', imagePath);

    let result;
    let method = 'Desconocido';

    // 1. Intentar con OpenAI primero (mejor calidad)
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('[OCR] 🤖 Intentando con OpenAI GPT-4 Vision...');
        result = await analyzePrescriptionWithOpenAI(imagePath);
        method = 'OpenAI GPT-4 Vision';
        console.log('[OCR] ✅ Análisis OpenAI completado');
      } catch (openaiError: any) {
        console.warn('[OCR] ⚠️ OpenAI falló:', openaiError.message);
      }
    }

    // 2. Si OpenAI falla o no está disponible, intentar con Gemini
    if (!result && process.env.GEMINI_API_KEY) {
      try {
        console.log('[OCR] 🤖 Intentando con Gemini IA...');
        result = await analyzePrescriptionWithGemini(imagePath);
        method = 'Gemini IA';
        console.log('[OCR] ✅ Análisis Gemini completado');
      } catch (geminiError: any) {
        console.warn('[OCR] ⚠️ Gemini falló:', geminiError.message);
      }
    }

    // 3. Fallback final a Tesseract
    if (!result) {
      try {
        console.log('[OCR] 📖 Usando Tesseract OCR como fallback...');
        result = await analyzeWithTesseract(imagePath);
        method = 'Tesseract OCR';
        console.log('[OCR] ✅ Análisis Tesseract completado');
      } catch (tesseractError: any) {
        console.error('[OCR] ❌ Error con Tesseract:', tesseractError);
        throw tesseractError;
      }
    }

    // Formatear resultado para el frontend
    const response = {
      message: 'Receta escaneada y analizada exitosamente',
      method: method,
      data: {
        medicationName: result.medications[0]?.name || 'Medicamento detectado',
        dosage: result.medications[0]?.dosage || '',
        frequency: result.medications[0]?.frequency || '',
        duration: result.medications[0]?.duration || '',
        instructions: result.medications[0]?.instructions || '',
        rawText: result.rawText,
        // Incluir todos los medicamentos detectados
        medications: result.medications,
        patientName: result.patientName,
        doctorName: result.doctorName,
        date: result.date,
        diagnosis: result.diagnosis,
        confidence: result.confidence
      },
      fileName: req.file.filename,
      medicationCount: result.medications.length
    };

    console.log(`[OCR] 📊 Se encontraron ${result.medications.length} medicamentos usando ${method}`);
    res.json(response);
  } catch (error: any) {
    console.error('[OCR] ❌ Error de procesamiento:', error);
    res.status(500).json({ 
      message: 'Error al procesar la imagen. Intenta con una receta más clara.',
      error: error.message 
    });
  }
};

export const getUserScans = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Return empty list as we're not storing scan history
    res.json({
      scans: []
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
