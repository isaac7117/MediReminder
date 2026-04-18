import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { analyzePrescriptionWithOpenAI, analyzePrescriptionTextWithOpenAI, getOcrSystemPrompt } from '../services/openai.service.js';
import { analyzePrescriptionWithGemini, extractMedicationDetails } from '../services/gemini.service.js';
import { analyzeWithTesseract } from '../services/tesseract-ocr.service.js';
import { runOcrFineTuningJob, refreshOcrTrainingJobs } from '../services/ocr-training.service.js';

type PrismaWithOcr = PrismaClient & {
  ocrTrainingSample: {
    create: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any[]>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
  ocrScanMetric: {
    create: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any[]>;
  };
  ocrTrainingJob: {
    findMany: (args: any) => Promise<any[]>;
  };
};

const prisma = new PrismaClient() as PrismaWithOcr;

export const scanPrescription = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'Archivo no enviado' });
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
        console.log(`[OCR] ✅ Análisis OpenAI completado - ${result.medications?.length || 0} medicamentos`);

        // Si OpenAI respondió pero no encontró medicamentos, descartar y probar otros
        if (!result.medications || result.medications.length === 0) {
          console.warn('[OCR] ⚠️ OpenAI devolvió 0 medicamentos, intentando otros métodos...');
          result = null;
        }
      } catch (openaiError: any) {
        console.error('[OCR] ❌ OpenAI falló:', {
          message: openaiError.message,
          status: openaiError.status || openaiError.statusCode,
          code: openaiError.code,
          type: openaiError.type,
          error: openaiError.error || undefined,
        });
      }
    } else {
      console.warn('[OCR] ⚠️ OPENAI_API_KEY no disponible en process.env');
    }

    // 2. Si OpenAI falla, no encontró meds, o no está disponible, intentar con Gemini
    if (!result && process.env.GEMINI_API_KEY) {
      try {
        console.log('[OCR] 🤖 Intentando con Gemini IA...');
        result = await analyzePrescriptionWithGemini(imagePath);
        method = 'Gemini IA';
        console.log(`[OCR] ✅ Análisis Gemini completado - ${result.medications?.length || 0} medicamentos`);

        if (!result.medications || result.medications.length === 0) {
          console.warn('[OCR] ⚠️ Gemini devolvió 0 medicamentos, intentando Tesseract...');
          result = null;
        }
      } catch (geminiError: any) {
        console.error('[OCR] ❌ Gemini falló:', {
          message: geminiError.message,
          status: geminiError.status || geminiError.statusCode,
          code: geminiError.code,
          errorDetails: geminiError.errorDetails || undefined,
        });
      }
    } else if (!result) {
      console.warn('[OCR] ⚠️ GEMINI_API_KEY no disponible en process.env');
    }

    // 3. Fallback: Tesseract OCR + refinamiento con texto
    if (!result) {
      try {
        console.log('[OCR] 📖 Usando Tesseract OCR como fallback...');
        const tesseractResult = await analyzeWithTesseract(imagePath);

        // Intentar refinar con OpenAI (modelo fine-tuned o base) sobre texto OCR
        const canRefine = tesseractResult.rawText?.length > 30 && process.env.OPENAI_API_KEY;
        if (canRefine) {
          try {
            const modelLabel = process.env.OPENAI_FT_MODEL_ID ? 'fine-tuned' : 'gpt-4o-mini';
            console.log(`[OCR] 🧠 Refinando con OpenAI ${modelLabel} (texto OCR)...`);
            const refined = await analyzePrescriptionTextWithOpenAI(tesseractResult.rawText);
            if (refined.medications && refined.medications.length > 0) {
              result = { ...refined, rawText: tesseractResult.rawText };
              method = `OpenAI ${modelLabel} (texto OCR)`;
              console.log(`[OCR] ✅ Refinamiento completado - ${result.medications.length} medicamentos`);
            } else {
              console.warn('[OCR] ⚠️ Refinamiento no encontró medicamentos, usando Tesseract puro');
              result = tesseractResult;
              method = 'Tesseract OCR';
            }
          } catch (refineError: any) {
            console.warn('[OCR] ⚠️ Refinamiento falló, usando Tesseract:', refineError.message);
            result = tesseractResult;
            method = 'Tesseract OCR';
          }
        } else {
          result = tesseractResult;
          method = 'Tesseract OCR';
        }

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

    try {
      await prisma.ocrScanMetric.create({
        data: {
          userId: userId || null,
          modelUsed: method,
          confidence: result.confidence || 'medium',
          medicationCount: result.medications.length || 0
        }
      });
    } catch (metricError) {
      console.warn('[OCR] ⚠️ No se pudo guardar métrica OCR:', metricError);
    }

    res.json(response);
  } catch (error: any) {
    console.error('[OCR] ❌ Error de procesamiento:', error);
    res.status(500).json({ 
      message: 'Error al procesar la imagen. Intenta con una receta más clara.',
      error: error.message 
    });
  }
};

const requireAdmin = (req: Request, res: Response): boolean => {
  const adminKey = req.headers['x-admin-key'];
  if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) {
    res.status(403).json({ message: 'No autorizado' });
    return false;
  }
  return true;
};

const redactSensitiveText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/(PACIENTE|NOMBRE|NOM|DR\.?|DRA\.?|DOCTOR|CEDULA|CÉDULA|FOLIO|TEL|TELEFONO|TELÉFONO).*/gi, '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '')
    .replace(/\b\d{2}[\/\-]\d{2}[\/\-]\d{2,4}\b/g, '')
    .replace(/\b\d{10,}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const submitOcrFeedback = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { rawText, modelOutput, correctedOutput, source, consent, language, imageHash } = req.body || {};

    if (!rawText || !correctedOutput) {
      return res.status(400).json({ message: 'rawText y correctedOutput son requeridos' });
    }

    if (!consent) {
      return res.json({ message: 'Feedback recibido sin consentimiento para entrenamiento.' });
    }

    const sanitizedText = redactSensitiveText(rawText);

    const sample = await prisma.ocrTrainingSample.create({
      data: {
        userId,
        source: source || 'unknown',
        ocrText: sanitizedText,
        modelOutput: modelOutput || null,
        correctedOutput,
        consent: true,
        includeInTraining: true,
        language: language || 'es',
        imageHash: imageHash || null,
      }
    });

    res.json({ message: 'Feedback guardado para entrenamiento', id: sample.id });
  } catch (error: any) {
    console.error('[OCR] ❌ Error guardando feedback:', error);
    res.status(500).json({ message: 'Error guardando feedback', error: error.message });
  }
};

export const exportOcrTrainingDataset = async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const limit = Math.min(parseInt(String(req.query.limit || '500')), 5000);
    const format = String(req.query.format || 'jsonl');

    const samples = await prisma.ocrTrainingSample.findMany({
      where: { consent: true, includeInTraining: true },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    if (format !== 'jsonl') {
      return res.json({ samples });
    }

    const systemPrompt = getOcrSystemPrompt();
    const lines = samples.map((sample: { ocrText: string; correctedOutput: unknown }) => {
      const message = {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `TEXTO OCR:\n${sample.ocrText}` },
          { role: 'assistant', content: JSON.stringify(sample.correctedOutput) }
        ]
      };
      return JSON.stringify(message);
    });

    res.setHeader('Content-Type', 'application/jsonl; charset=utf-8');
    res.send(lines.join('\n'));
  } catch (error: any) {
    console.error('[OCR] ❌ Error exportando dataset:', error);
    res.status(500).json({ message: 'Error exportando dataset', error: error.message });
  }
};

export const listOcrTrainingSamples = async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const limit = Math.min(parseInt(String(req.query.limit || '200')), 2000);
    const includeInTraining = req.query.includeInTraining;
    const consent = req.query.consent;

    const where: any = {};
    if (includeInTraining !== undefined) where.includeInTraining = includeInTraining === 'true';
    if (consent !== undefined) where.consent = consent === 'true';

    const samples = await prisma.ocrTrainingSample.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ samples });
  } catch (error: any) {
    res.status(500).json({ message: 'Error listando muestras', error: error.message });
  }
};

export const updateOcrTrainingSample = async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const sampleId = req.params.id;
    const { includeInTraining, correctedOutput } = req.body || {};

    const sample = await prisma.ocrTrainingSample.update({
      where: { id: sampleId },
      data: {
        includeInTraining: typeof includeInTraining === 'boolean' ? includeInTraining : undefined,
        correctedOutput: correctedOutput || undefined
      }
    });

    res.json({ sample });
  } catch (error: any) {
    res.status(500).json({ message: 'Error actualizando muestra', error: error.message });
  }
};

export const deleteOcrTrainingSample = async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const sampleId = req.params.id;
    await prisma.ocrTrainingSample.delete({ where: { id: sampleId } });
    res.json({ message: 'Muestra eliminada' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error eliminando muestra', error: error.message });
  }
};

export const getOcrMetrics = async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const limit = Math.min(parseInt(String(req.query.limit || '1000')), 5000);
    const metrics = await prisma.ocrScanMetric.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const confidenceScore = (c: string) => (c === 'high' ? 0.9 : c === 'medium' ? 0.6 : 0.3);
    const summary: Record<string, { count: number; avgConfidence: number; avgMeds: number }> = {};

    for (const m of metrics) {
      const key = m.modelUsed || 'Desconocido';
      if (!summary[key]) summary[key] = { count: 0, avgConfidence: 0, avgMeds: 0 };
      summary[key].count += 1;
      summary[key].avgConfidence += confidenceScore(m.confidence || 'medium');
      summary[key].avgMeds += m.medicationCount || 0;
    }

    Object.values(summary).forEach(s => {
      s.avgConfidence = s.count ? Number((s.avgConfidence / s.count).toFixed(2)) : 0;
      s.avgMeds = s.count ? Number((s.avgMeds / s.count).toFixed(2)) : 0;
    });

    res.json({ total: metrics.length, byModel: summary });
  } catch (error: any) {
    res.status(500).json({ message: 'Error obteniendo métricas', error: error.message });
  }
};

export const listOcrTrainingJobs = async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const jobs = await prisma.ocrTrainingJob.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ jobs });
  } catch (error: any) {
    res.status(500).json({ message: 'Error listando jobs', error: error.message });
  }
};

export const triggerOcrTrainingJob = async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const job = await runOcrFineTuningJob();
    res.json({ message: 'Job de entrenamiento iniciado', job });
  } catch (error: any) {
    res.status(500).json({ message: 'Error iniciando entrenamiento', error: error.message });
  }
};

export const ocrDiagnostics = async (_req: Request, res: Response) => {
  const diag: Record<string, any> = {
    timestamp: new Date().toISOString(),
    envKeys: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `set (${process.env.OPENAI_API_KEY.substring(0, 8)}...${process.env.OPENAI_API_KEY.slice(-4)})` : 'NOT SET',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `set (${process.env.GEMINI_API_KEY.substring(0, 8)}...${process.env.GEMINI_API_KEY.slice(-4)})` : 'NOT SET',
      OPENAI_FT_MODEL_ID: process.env.OPENAI_FT_MODEL_ID ? 'set' : 'NOT SET',
    },
    tests: {} as Record<string, any>,
  };

  // Test OpenAI (text + vision)
  if (process.env.OPENAI_API_KEY) {
    try {
      const testOpenAI = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const r = await testOpenAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Responde solo: OK' }],
        max_tokens: 5,
      });
      diag.tests.openai = { status: 'OK', response: r.choices[0]?.message?.content };
    } catch (e: any) {
      diag.tests.openai = { status: 'FAIL', message: e.message, code: e.status || e.code };
    }

    // Vision test: send a tiny 1x1 white PNG with text overlay request
    try {
      const testOpenAI = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      // Minimal 1x1 white PNG in base64
      const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const r = await testOpenAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image in one word.' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${tinyPng}` } },
          ],
        }],
        max_tokens: 10,
      });
      diag.tests.openaiVision = { status: 'OK', response: r.choices[0]?.message?.content };
    } catch (e: any) {
      diag.tests.openaiVision = { status: 'FAIL', message: e.message, code: e.status || e.code };
    }
  }

  // Test Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const r = await model.generateContent('Responde solo: OK');
      diag.tests.gemini = { status: 'OK', response: r.response.text() };
    } catch (e: any) {
      diag.tests.gemini = { status: 'FAIL', message: e.message, code: e.status || e.code };
    }
  }

  console.log('[OCR] 🔍 Diagnóstico:', JSON.stringify(diag, null, 2));
  res.json(diag);
};

export const refreshOcrTrainingJobsStatus = async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const updated = await refreshOcrTrainingJobs();
    res.json({ message: 'Jobs actualizados', updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error actualizando jobs', error: error.message });
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
