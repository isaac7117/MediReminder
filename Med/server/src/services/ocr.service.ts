import Tesseract from 'tesseract.js';

export interface OCRResult {
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  rawText: string;
}

export const processImageWithOCR = async (imagePath: string): Promise<OCRResult> => {
  try {
    console.log('[OCR Service] Iniciando OCR en:', imagePath);
    
    const result = await Tesseract.recognize(imagePath, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing') {
          console.log(`[OCR Service] Progreso: ${(m.progress * 100).toFixed(0)}%`);
        }
      }
    });

    const text = result.data.text;
    console.log('[OCR Service] Texto extraído (primeros 500 chars):', text.substring(0, 500));
    console.log('[OCR Service] Texto completo:', text);

    if (!text || text.trim().length < 5) {
      console.warn('[OCR Service] Texto muy corto o vacío');
      return {
        rawText: text,
        medicationName: undefined,
        dosage: undefined,
        frequency: undefined,
        duration: undefined,
        instructions: undefined
      };
    }

    const ocrResult: OCRResult = {
      rawText: text,
      medicationName: extractMedicationName(text),
      dosage: extractDosage(text),
      frequency: extractFrequency(text),
      duration: extractDuration(text),
      instructions: extractInstructions(text)
    };

    console.log('[OCR Service] Resultado final:', ocrResult);
    return ocrResult;
  } catch (error) {
    console.error('[OCR Service] Error fatal:', error);
    throw new Error(`Error al procesar imagen con OCR: ${error}`);
  }
};

const extractMedicationName = (text: string): string | undefined => {
  // Look for common medication name patterns
  const patterns = [
    // Look for patterns like "Medication: Aspirin"
    /(?:medication|medicamento|drug|medicine|fármaco|medicine)[\s:]*([^\n,]+)/i,
    // Look for pattern after "Rx" or prescription symbol
    /(?:rx|℞|prescription|receta)[\s:]*([^\n,]+)/i,
    // Look for capitalized word followed by dosage
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*(?:\d+\s*)?(?:mg|ml|g|tablet|capsule|comprimido|cápsula)/im,
    // Common medication patterns with numbers
    /\b([A-Z][a-z]+)\s*\d+\s*(?:mg|ml|g|iu)/,
    // Capitalized words at start of lines
    /^([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)?)\s*(?:\n|$)/im
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Filter out common non-medication words
      if (!/^(the|a|an|and|or|for|with|without|before|after|during|take|use|mg|ml|dose|por|para|del|de|RP)$/i.test(name) && name.length > 2) {
        console.log('[OCR] Medication found:', name);
        return name;
      }
    }
  }

  return undefined;
};

const extractDosage = (text: string): string | undefined => {
  const patterns = [
    // Pattern: "500 mg" or "500mg"
    /(\d+\.?\d*\s*(?:mg|ml|g|iu|unit|tablets?|capsule|drop|spray|cc|mcg|µg))\b/i,
    // Look for dosage labels
    /(?:dosage|dose|strength|dosis)[\s:]*([^\n]+?)(?:\n|$)/i,
    // Find numbers with units anywhere
    /(\d+\s*(?:mg|ml|g|iu|UI))/i,
    // Tablet/capsule format
    /(\d+\s*(?:tabletas?|cápsulas?|tablets?|capsules?))/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const dosage = match[1].trim();
      if (dosage.length < 50) { // Avoid very long matches
        console.log('[OCR] Dosage found:', dosage);
        return dosage;
      }
    }
  }

  return undefined;
};

const extractFrequency = (text: string): string | undefined => {
  const patterns = [
    // Patterns like "2 times daily" or "2 veces al día"
    /(\d+\s*(?:times?|veces|veces)\s*(?:daily|a day|per day|diarias|al día|por día))/i,
    // Pattern: "every X hours"
    /every\s+(\d+\s*(?:hours?|horas))/i,
    // Pattern with "cada"
    /cada\s+(\d+\s*(?:horas?|hours?))/i,
    // General frequency labels
    /(?:take|dose|frequency|frecuencia|cada)[\s:]*([^\n]+?)(?:times|veces|daily|diarias|hourly)/i,
    // Pattern: "una vez al día"
    /((?:una|dos|tres|four)\s*(?:vez|veces|times)\s*(?:al día|diarias|daily))/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const freq = match[1].trim();
      console.log('[OCR] Frequency found:', freq);
      return freq;
    }
  }

  return undefined;
};

const extractDuration = (text: string): string | undefined => {
  const patterns = [
    // Pattern: "for X days/weeks/months"
    /(?:for|durante|por|durante)\s+(\d+\s*(?:days?|weeks?|months?|años|years|día|días|semana|semanas|mes|meses))/i,
    // Pattern with "continue"
    /(?:continue|take|tomar|seguir)[\s:]*(\d+\s*(?:days?|weeks?|months?|días|semanas|meses))/i,
    // Duration labels
    /(?:duration|duración|tratamiento)[\s:]*([^\n]+?)(?:\n|$)/i,
    // Standalone duration
    /(\d+\s*(?:days?|weeks?|months?|días|semanas|meses))(?:\s*(?:treatment|therapy|tratamiento))?/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const duration = match[1].trim();
      if (duration.length < 50) {
        console.log('[OCR] Duration found:', duration);
        return duration;
      }
    }
  }

  return undefined;
};

const extractInstructions = (text: string): string | undefined => {
  const patterns = [
    // Look for instruction labels
    /(?:instructions?|instrucciones?|indicaciones)[\s:]*([^\n]+?)(?:\n|$)/i,
    // Pattern: "Take with/without food"
    /(?:take|use|tomar|usar)\s+(?:with|without|before|after|con|sin|antes|después)\s+([^\n.]+)/i,
    // Pattern with meals
    /(?:with|con)\s+(food|meals|comidas|alimentos)/i,
    // General instructions
    /(?:notes?|observaciones?|recomendaciones?)[\s:]*([^\n]+?)(?:\n|$)/i,
    // Any line that starts with capital letters that looks like instruction
    /^([A-Z][a-z\s]+(?:with|without|before|after|con|sin)\s+[^\n]{5,50})/im
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const instruction = match[1].trim();
      if (instruction.length > 3 && instruction.length < 200 && !/^(mg|ml|tablets?|capsules?|RP|RX)$/i.test(instruction)) {
        console.log('[OCR] Instruction found:', instruction);
        return instruction;
      }
    }
  }

  return undefined;
};
