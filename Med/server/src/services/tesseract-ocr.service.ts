import Tesseract from 'tesseract.js';
import * as fs from 'fs';

export interface TesseractOCRResult {
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    frequencyValue: number;
    frequencyType: 'daily' | 'weekly' | 'monthly';
    frequencyTimes: string[];
    duration: string;
    durationDays?: number;
    instructions: string;
    indication?: string;
  }>;
  patientName?: string;
  doctorName?: string;
  date?: string;
  diagnosis?: string;
  rawText: string;
  confidence: 'high' | 'medium' | 'low';
}

// Base de datos de medicamentos comunes en México
const KNOWN_MEDICATIONS: { [key: string]: { type: string; indication: string } } = {
  'AMOBAY': { type: 'Antibiótico', indication: 'Infecciones bacterianas' },
  'AMOXICILINA': { type: 'Antibiótico', indication: 'Infecciones bacterianas' },
  'IBUPROFENO': { type: 'Antiinflamatorio/Analgésico', indication: 'Dolor e inflamación' },
  'PARACETAMOL': { type: 'Analgésico/Antipirético', indication: 'Dolor y fiebre' },
  'DEXTROMETORFANO': { type: 'Antitusivo', indication: 'Tos seca' },
  'NAPROXENO': { type: 'Antiinflamatorio', indication: 'Dolor e inflamación' },
  'OMEPRAZOL': { type: 'Antiácido', indication: 'Gastritis/Reflujo' },
  'METFORMINA': { type: 'Antidiabético', indication: 'Diabetes tipo 2' },
  'LOSARTAN': { type: 'Antihipertensivo', indication: 'Presión arterial alta' },
  'CIPROFLOXACINO': { type: 'Antibiótico', indication: 'Infecciones bacterianas' },
  'AZITROMICINA': { type: 'Antibiótico', indication: 'Infecciones respiratorias' },
  'LORATADINA': { type: 'Antihistamínico', indication: 'Alergias' },
  'RANITIDINA': { type: 'Antiácido', indication: 'Gastritis' },
  'DICLOFENACO': { type: 'Antiinflamatorio', indication: 'Dolor muscular' },
  'KETOROLACO': { type: 'Analgésico', indication: 'Dolor intenso' },
  'CLONAZEPAM': { type: 'Ansiolítico', indication: 'Ansiedad' },
  'ALPRAZOLAM': { type: 'Ansiolítico', indication: 'Ansiedad' },
  'METOCLOPRAMIDA': { type: 'Antiemético', indication: 'Náuseas/Vómito' },
  'BUTILHIOSCINA': { type: 'Antiespasmódico', indication: 'Cólicos' },
};

// Función para limpiar y normalizar texto
const normalizeText = (text: string): string => {
  return text
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s\d.,-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Función para extraer frecuencia del texto
const extractFrequency = (text: string): { frequency: string; frequencyValue: number; frequencyTimes: string[] } => {
  const normalizedText = text.toUpperCase();
  
  // Patrones de frecuencia
  if (/CADA\s*4\s*H(ORA|RS)?/i.test(normalizedText)) {
    return { frequency: 'cada 4 horas', frequencyValue: 6, frequencyTimes: ['06:00', '10:00', '14:00', '18:00', '22:00', '02:00'] };
  }
  if (/CADA\s*6\s*H(ORA|RS)?/i.test(normalizedText)) {
    return { frequency: 'cada 6 horas', frequencyValue: 4, frequencyTimes: ['06:00', '12:00', '18:00', '00:00'] };
  }
  if (/CADA\s*8\s*H(ORA|RS)?/i.test(normalizedText)) {
    return { frequency: 'cada 8 horas', frequencyValue: 3, frequencyTimes: ['08:00', '16:00', '00:00'] };
  }
  if (/CADA\s*12\s*H(ORA|RS)?/i.test(normalizedText)) {
    return { frequency: 'cada 12 horas', frequencyValue: 2, frequencyTimes: ['08:00', '20:00'] };
  }
  if (/CADA\s*24\s*H(ORA|RS)?|UNA\s*VEZ\s*AL\s*DIA/i.test(normalizedText)) {
    return { frequency: 'una vez al día', frequencyValue: 1, frequencyTimes: ['08:00'] };
  }
  if (/3\s*VECES|TRES\s*VECES/i.test(normalizedText)) {
    return { frequency: '3 veces al día', frequencyValue: 3, frequencyTimes: ['08:00', '14:00', '20:00'] };
  }
  if (/2\s*VECES|DOS\s*VECES/i.test(normalizedText)) {
    return { frequency: '2 veces al día', frequencyValue: 2, frequencyTimes: ['08:00', '20:00'] };
  }
  
  return { frequency: '1 vez al día', frequencyValue: 1, frequencyTimes: ['09:00'] };
};

// Función para extraer duración del texto
const extractDuration = (text: string): { duration: string; durationDays: number } => {
  const normalizedText = text.toUpperCase();
  
  // Buscar patrones de duración
  const daysMatch = normalizedText.match(/(\d+)\s*DIAS?/i) || 
                    normalizedText.match(/DURANTE\s*(\d+)/i) ||
                    normalizedText.match(/POR\s*(\d+)\s*DIAS?/i);
  
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    return { duration: `${days} días`, durationDays: days };
  }
  
  // Palabras numéricas
  if (/CINCO\s*DIAS?/i.test(normalizedText)) return { duration: '5 días', durationDays: 5 };
  if (/CUATRO\s*DIAS?/i.test(normalizedText)) return { duration: '4 días', durationDays: 4 };
  if (/TRES\s*DIAS?/i.test(normalizedText)) return { duration: '3 días', durationDays: 3 };
  if (/DOS\s*DIAS?/i.test(normalizedText)) return { duration: '2 días', durationDays: 2 };
  if (/UNA?\s*SEMANA/i.test(normalizedText)) return { duration: '7 días', durationDays: 7 };
  if (/DOS\s*SEMANAS?/i.test(normalizedText)) return { duration: '14 días', durationDays: 14 };
  
  return { duration: '7 días', durationDays: 7 };
};

// Función para parsear medicamentos del texto extraído
const parseMedicationsFromText = (text: string): Array<any> => {
  const medications: Array<any> = [];
  const normalizedText = normalizeText(text);
  const lines = text.split('\n').filter(line => line.trim().length > 3);
  
  console.log('[Tesseract] 🔍 Buscando medicamentos en texto normalizado...');
  
  // Buscar medicamentos conocidos en el texto
  for (const [medName, medInfo] of Object.entries(KNOWN_MEDICATIONS)) {
    // Buscar el nombre del medicamento en el texto
    const regex = new RegExp(`(${medName}[A-Z]*)[^\\n]*`, 'gi');
    const matches = normalizedText.match(regex);
    
    if (matches) {
      for (const match of matches) {
        // Buscar la línea completa que contiene este medicamento
        const lineWithMed = lines.find(line => 
          normalizeText(line).includes(medName)
        ) || match;
        
        // Extraer dosis (buscar mg, ml, g, etc.)
        const dosageMatch = lineWithMed.match(/(\d+)\s*(MG|ML|G|MCG)/i);
        const dosage = dosageMatch ? `${dosageMatch[1]} ${dosageMatch[2].toLowerCase()}` : 'Según indicación';
        
        // Extraer forma farmacéutica
        let forma = '';
        if (/CAPSUL/i.test(lineWithMed)) forma = 'CAPSULAS';
        else if (/TABLET/i.test(lineWithMed)) forma = 'TABLETAS';
        else if (/JARABE/i.test(lineWithMed)) forma = 'JARABE';
        else if (/GOTAS/i.test(lineWithMed)) forma = 'GOTAS';
        else if (/AMPOL|INYEC/i.test(lineWithMed)) forma = 'INYECTABLE';
        
        // Buscar instrucciones en líneas cercanas
        const lineIndex = lines.findIndex(line => normalizeText(line).includes(medName));
        let instructionText = lineWithMed;
        if (lineIndex >= 0 && lineIndex < lines.length - 1) {
          // Incluir la siguiente línea si parece ser instrucciones
          const nextLine = lines[lineIndex + 1] || '';
          if (/TOMAR|CADA|HORA|DIA|VECES/i.test(nextLine)) {
            instructionText += ' ' + nextLine;
          }
        }
        
        const freqInfo = extractFrequency(instructionText);
        const durInfo = extractDuration(instructionText);
        
        // Evitar duplicados
        const medFullName = `${medName}${forma ? ' ' + forma : ''}${dosageMatch ? ' ' + dosageMatch[1] + ' ' + dosageMatch[2].toUpperCase() : ''}`;
        if (!medications.find(m => m.name.includes(medName))) {
          medications.push({
            name: medFullName.trim(),
            dosage: dosage,
            frequency: freqInfo.frequency,
            frequencyValue: freqInfo.frequencyValue,
            frequencyType: 'daily',
            frequencyTimes: freqInfo.frequencyTimes,
            duration: durInfo.duration,
            durationDays: durInfo.durationDays,
            instructions: `Tomar ${freqInfo.frequency} durante ${durInfo.duration}`,
            indication: medInfo.indication
          });
        }
      }
    }
  }
  
  // Si no encontramos medicamentos conocidos, buscar patrones genéricos
  if (medications.length === 0) {
    console.log('[Tesseract] ⚠️ No se encontraron medicamentos conocidos, buscando patrones genéricos...');
    
    // Patrones para medicamentos genéricos
    const genericPatterns = [
      /([A-Z]{3,}(?:\s+[A-Z]+)?)\s+(?:CAPSUL|TABLET|JARABE|GOTAS)?\s*(?:DE\s+)?(\d+)\s*(MG|ML|G)/gi,
      /([A-Z]{4,})\s+(\d+)\s*(MG|ML)/gi
    ];
    
    for (const pattern of genericPatterns) {
      let match;
      while ((match = pattern.exec(normalizedText)) !== null) {
        const name = match[1].trim();
        // Filtrar palabras comunes que no son medicamentos
        if (!/^(TOMAR|CADA|DURANTE|DOCTOR|PACIENTE|RECETA|CEDULA|FECHA)$/.test(name)) {
          if (!medications.find(m => m.name.includes(name))) {
            medications.push({
              name: `${name} ${match[2]} ${match[3].toUpperCase()}`,
              dosage: `${match[2]} ${match[3].toLowerCase()}`,
              frequency: '1 vez al día',
              frequencyValue: 1,
              frequencyType: 'daily',
              frequencyTimes: ['09:00'],
              duration: '7 días',
              durationDays: 7,
              instructions: 'Según indicaciones médicas',
              indication: 'Revisar con médico'
            });
          }
        }
      }
    }
  }

  // Si aún no se encontraron medicamentos, crear uno genérico
  if (medications.length === 0) {
    console.log('[Tesseract] ⚠️ No se pudieron identificar medicamentos automáticamente');
    medications.push({
      name: 'Medicamento no identificado',
      dosage: 'Revisa manualmente',
      frequency: '1 vez al día',
      frequencyValue: 1,
      frequencyType: 'daily',
      frequencyTimes: ['09:00'],
      duration: '7 días',
      durationDays: 7,
      instructions: 'Por favor revisa la receta manualmente',
      indication: 'No se pudo extraer automáticamente'
    });
  }

  return medications;
};

export const analyzeWithTesseract = async (imagePath: string): Promise<TesseractOCRResult> => {
  try {
    console.log('[Tesseract] 📸 Analizando imagen con OCR Tesseract...');

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Archivo no encontrado: ${imagePath}`);
    }

    // Usar Tesseract para OCR con configuración optimizada
    const { data: { text, confidence } } = await Tesseract.recognize(imagePath, 'spa+eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`[Tesseract] 📊 Progreso: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    console.log('[Tesseract] 📝 Texto extraído (primeros 500 chars):', text.substring(0, 500));
    console.log('[Tesseract] 📊 Confianza OCR:', confidence);

    // Parsear medicamentos del texto
    const medications = parseMedicationsFromText(text);

    console.log('[Tesseract] ✅ Análisis completado');
    console.log('[Tesseract] 📊 Medicamentos encontrados:', medications.length);
    medications.forEach((med, i) => {
      console.log(`[Tesseract]   ${i + 1}. ${med.name} - ${med.frequency} - ${med.duration}`);
    });

    return {
      medications,
      rawText: text,
      confidence: confidence > 70 ? 'high' : confidence > 50 ? 'medium' : 'low'
    };
  } catch (error: any) {
    console.error('[Tesseract] ❌ Error:', error);
    throw new Error(`Error al analizar con Tesseract: ${error.message}`);
  }
};
