import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { getOcrSystemPrompt } from './openai.service.js';

type PrismaWithOcr = PrismaClient & {
  ocrTrainingSample: {
    findMany: (args: any) => Promise<any[]>;
  };
  ocrTrainingJob: {
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any[]>;
  };
};

const prisma = new PrismaClient() as PrismaWithOcr;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

const getTrainingDir = (): string => {
  const dir = path.join(process.cwd(), 'uploads', 'ocr-training');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

export const buildOcrTrainingJsonl = (samples: Array<{ ocrText: string; correctedOutput: unknown }>): string => {
  const systemPrompt = getOcrSystemPrompt();
  return samples
    .map(sample => {
      const message = {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `TEXTO OCR:\n${sample.ocrText}` },
          { role: 'assistant', content: JSON.stringify(sample.correctedOutput) }
        ]
      };
      return JSON.stringify(message);
    })
    .join('\n');
};

export const runOcrFineTuningJob = async () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY no configurada');
  }

  const baseModel = process.env.OPENAI_FT_BASE_MODEL || 'gpt-4o-mini';
  const minSamples = parseInt(process.env.OCR_TRAINING_MIN_SAMPLES || '50');
  const maxSamples = parseInt(process.env.OCR_TRAINING_MAX_SAMPLES || '1000');

  const samples = await prisma.ocrTrainingSample.findMany({
    where: { consent: true, includeInTraining: true },
    take: maxSamples,
    orderBy: { createdAt: 'desc' }
  });

  if (samples.length < minSamples) {
    throw new Error(`Muestras insuficientes (${samples.length}/${minSamples})`);
  }

  const jsonl = buildOcrTrainingJsonl(samples.map((s: { ocrText: string; correctedOutput: unknown }) => ({ ocrText: s.ocrText, correctedOutput: s.correctedOutput })));
  const dir = getTrainingDir();
  const filePath = path.join(dir, `ocr_dataset_${Date.now()}.jsonl`);
  fs.writeFileSync(filePath, jsonl, 'utf8');

  const jobRecord = await prisma.ocrTrainingJob.create({
    data: {
      status: 'running',
      baseModel,
      sampleCount: samples.length,
      startedAt: new Date()
    }
  });

  try {
    const uploaded = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'fine-tune'
    });

    const fineTuneJob = await openai.fineTuning.jobs.create({
      model: baseModel,
      training_file: uploaded.id,
      suffix: 'medireminder-ocr'
    });

    const updated = await prisma.ocrTrainingJob.update({
      where: { id: jobRecord.id },
      data: {
        trainingFileId: uploaded.id,
        fineTuneJobId: fineTuneJob.id,
        status: fineTuneJob.status || 'running'
      }
    });

    return updated;
  } catch (error: any) {
    await prisma.ocrTrainingJob.update({
      where: { id: jobRecord.id },
      data: {
        status: 'failed',
        error: error?.message || 'Error desconocido',
        finishedAt: new Date()
      }
    });
    throw error;
  }
};

export const refreshOcrTrainingJobs = async () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY no configurada');
  }

  const jobs = await prisma.ocrTrainingJob.findMany({
    where: {
      fineTuneJobId: { not: null },
      status: { in: ['running', 'queued', 'validating'] }
    },
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  let updatedCount = 0;
  for (const job of jobs) {
    try {
      const remote = await openai.fineTuning.jobs.retrieve(job.fineTuneJobId as string);
      await prisma.ocrTrainingJob.update({
        where: { id: job.id },
        data: {
          status: remote.status || job.status,
          fineTunedModelId: remote.fine_tuned_model || job.fineTunedModelId || null,
          finishedAt: remote.status === 'succeeded' || remote.status === 'failed' ? new Date() : job.finishedAt
        }
      });
      updatedCount += 1;
    } catch (error) {
      // Ignore individual errors
    }
  }

  return updatedCount;
};
