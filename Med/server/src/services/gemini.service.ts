import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('[Gemini] ⚠️ GEMINI_API_KEY no configurada en .env');
} else {
  console.log('[Gemini] ✅ GEMINI_API_KEY configurada');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export interface MedicationData {
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
}

export interface GeminiMedicationResult {
  medications: MedicationData[];
  patientName?: string;
  doctorName?: string;
  date?: string;
  diagnosis?: string;
  rawText: string;
  confidence: 'high' | 'medium' | 'low';
}

export const analyzePrescriptionWithGemini = async (imagePath: string): Promise<GeminiMedicationResult> => {
  try {
    console.log('[Gemini]  Analizando receta con IA generativa...');

    // Leer imagen como base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Determinar tipo MIME
    const ext = path.extname(imagePath).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    if (ext === '.gif') mimeType = 'image/gif';
    if (ext === '.webp') mimeType = 'image/webp';

    const prompt = `Eres un experto farmacéutico y especialista en análisis de recetas médicas mexicanas y latinoamericanas.

TAREA CRÍTICA: Analiza esta imagen de receta médica y extrae TODOS los medicamentos presentes.

INSTRUCCIONES DETALLADAS:
1. BUSCA CUIDADOSAMENTE cada medicamento en la receta. Las recetas suelen tener múltiples medicamentos.
2. Cada línea que contenga un nombre de medicamento + dosis + instrucciones es UN medicamento separado.
3. Identifica patrones comunes en recetas médicas mexicanas:
   - "NOMBRE + MG/ML" = medicamento
   - "TOMAR/TOMAR UNA/TOMAR 1" = inicio de instrucciones
   - "CADA X HORAS/HRS" = frecuencia
   - "POR X DIAS/DURANTE X DIAS" = duración
   - "CAPSULAS/TABLETAS/JARABE/GOTAS/AMPULAS" = forma farmacéutica

CONVERSIÓN DE FRECUENCIAS:
- "cada 8 horas" o "cada 8 hrs" = 3 veces al día, frequencyValue=3, frequencyTimes=["08:00", "16:00", "00:00"]
- "cada 12 horas" o "cada 12 hrs" = 2 veces al día, frequencyValue=2, frequencyTimes=["08:00", "20:00"]
- "cada 24 horas" = 1 vez al día, frequencyValue=1, frequencyTimes=["08:00"]
- "cada 6 horas" = 4 veces al día, frequencyValue=4, frequencyTimes=["06:00", "12:00", "18:00", "00:00"]
- "cada 4 horas" = 6 veces al día
- "3 veces al día" = frequencyValue=3, frequencyTimes=["08:00", "14:00", "20:00"]
- "2 veces al día" = frequencyValue=2, frequencyTimes=["08:00", "20:00"]
- "1 vez al día" = frequencyValue=1, frequencyTimes=["08:00"]

CONVERSIÓN DE DURACIONES:
- "cinco dias" o "5 dias" = durationDays=5
- "dos dias" o "2 dias" = durationDays=2
- "una semana" = durationDays=7
- "dos semanas" = durationDays=14
- Si no especifica duración, usar durationDays=7 por defecto

EJEMPLO:
Si la receta dice:
"AMOBAY CAPSULAS DE 500 MG - TOMAR UNA CAPSULA CADA 8 HRS. DURANTE CINCO DIAS.
IBUPROFENO TABLETAS DE 400 MG - TOMAR UNA TABLETA CADA 12 HRS. POR DOS DIAS
DEXTROMETROFANO JARABE - TOMAR 5 ML CADA 8 HRS"

Debes extraer TRES medicamentos:
1. AMOBAY CAPSULAS 500 MG
2. IBUPROFENO TABLETAS 400 MG
3. DEXTROMETROFANO JARABE

RESPONDE ÚNICAMENTE EN JSON VÁLIDO (sin markdown, sin backticks, sin explicaciones):

{
  "medications": [
    {
      "name": "AMOBAY CAPSULAS 500 MG",
      "dosage": "1 cápsula de 500mg",
      "frequency": "cada 8 horas",
      "frequencyValue": 3,
      "frequencyType": "daily",
      "frequencyTimes": ["08:00", "16:00", "00:00"],
      "duration": "5 días",
      "durationDays": 5,
      "instructions": "Tomar una cápsula cada 8 horas",
      "indication": "Antibiótico"
    }
  ],
  "patientName": "nombre si aparece",
  "doctorName": "nombre si aparece", 
  "date": "fecha si aparece",
  "diagnosis": "diagnóstico si aparece",
  "confidence": "high"
}

REGLAS CRÍTICAS:
- Extrae ABSOLUTAMENTE TODOS los medicamentos de la receta
- Si hay 3 medicamentos, medications debe tener 3 objetos
- Nombres en MAYÚSCULAS
- frequencyTimes DEBE ser array de strings "HH:MM"
- durationDays DEBE ser número entero
- NO uses markdown ni backticks en la respuesta`;

    // Lista de modelos a probar en orden de preferencia (actualizados a los disponibles en 2026)
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest'
    ];
    
    let response;
    let lastError;
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`[Gemini] 🔄 Intentando con modelo: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8192,
          }
        });
        
        response = await model.generateContent([
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          prompt
        ]);
        
        console.log(`[Gemini] ✅ Modelo ${modelName} funcionó correctamente`);
        break; // Si llegamos aquí, el modelo funcionó
      } catch (e: any) {
        console.log(`[Gemini] ⚠️ Modelo ${modelName} falló: ${e.message?.substring(0, 100)}`);
        lastError = e;
      }
    }
    
    if (!response) {
      throw new Error(`Ningún modelo de Gemini disponible. Último error: ${lastError?.message}`);
    }

    const responseText = response.response.text();
    console.log('[Gemini] 📝 Respuesta raw de Gemini:', responseText);

    // Parsear JSON de la respuesta
    let parsedResult: GeminiMedicationResult;
    
    try {
      // Limpiar la respuesta de posibles caracteres extra y markdown
      let cleanedResponse = responseText
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
      
      console.log('[Gemini] 🧹 Respuesta limpia:', cleanedResponse.substring(0, 200));
      
      // Intentar extraer JSON de la respuesta
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
        parsedResult.rawText = responseText;
        
        console.log('[Gemini] ✅ JSON parseado correctamente');
        console.log('[Gemini] 📊 Medicamentos encontrados:', parsedResult.medications?.length || 0);
        
        // Log detallado de cada medicamento
        if (parsedResult.medications && parsedResult.medications.length > 0) {
          parsedResult.medications.forEach((med, idx) => {
            console.log(`[Gemini]   ${idx + 1}. ${med.name} | Dosis: ${med.dosage} | Frecuencia: ${med.frequency} | Duración: ${med.durationDays} días`);
          });
        }
      } else {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
    } catch (parseError) {
      console.error('[Gemini] ❌ Error al parsear JSON:', parseError);
      console.error('[Gemini] 📝 Respuesta completa que falló:', responseText);
      
      // Intentar extraer información básica del texto con regex si falla el JSON
      parsedResult = extractMedicationsFromRawText(responseText);
    }

    // Validar y normalizar datos
    parsedResult.medications = normalizeMedications(parsedResult.medications);

    console.log('[Gemini] ✅ Análisis completado');
    console.log('[Gemini] 📊 Total medicamentos procesados:', parsedResult.medications.length);

    return parsedResult;
  } catch (error: any) {
    console.error('[Gemini] ❌ Error fatal:', error);
    throw new Error(`Error al analizar receta con Gemini: ${error.message}`);
  }
};

// Función para normalizar medicamentos
function normalizeMedications(medications: MedicationData[] | undefined): MedicationData[] {
  if (!medications || !Array.isArray(medications)) {
    return [];
  }

  return medications.map(med => {
    // Calcular frequencyTimes basado en la frecuencia si no está definido correctamente
    let frequencyTimes = med.frequencyTimes;
    if (!Array.isArray(frequencyTimes) || frequencyTimes.length === 0) {
      frequencyTimes = calculateFrequencyTimes(med.frequency, med.frequencyValue);
    }

    // Validar y formatear horas
    frequencyTimes = frequencyTimes.map(time => {
      if (typeof time === 'string') {
        const match = time.match(/^(\d{1,2}):(\d{2})$/);
        if (match) {
          return `${match[1].padStart(2, '0')}:${match[2]}`;
        }
      }
      return '09:00';
    });

    // Calcular durationDays si no está definido
    let durationDays = med.durationDays;
    if (!durationDays || durationDays <= 0) {
      durationDays = parseDuration(med.duration);
    }

    return {
      name: (med.name || 'Medicamento').toUpperCase().trim(),
      dosage: med.dosage || 'Ver receta',
      frequency: med.frequency || 'Consultar médico',
      frequencyValue: Math.max(1, parseInt(String(med.frequencyValue)) || 1),
      frequencyType: (['daily', 'weekly', 'monthly'].includes(med.frequencyType) ? med.frequencyType : 'daily') as 'daily' | 'weekly' | 'monthly',
      frequencyTimes: frequencyTimes,
      duration: med.duration || '7 días',
      durationDays: Math.max(1, durationDays),
      instructions: med.instructions || '',
      indication: med.indication || ''
    };
  });
}

// Parsear duración del texto
function parseDuration(duration: string): number {
  if (!duration) return 7;
  
  const lower = duration.toLowerCase();
  
  // Buscar números
  const numMatch = lower.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1]);
    if (lower.includes('semana')) return num * 7;
    if (lower.includes('mes')) return num * 30;
    return num; // Asumir días
  }
  
  // Palabras escritas
  const words: Record<string, number> = {
    'uno': 1, 'un': 1, 'una': 1,
    'dos': 2,
    'tres': 3,
    'cuatro': 4,
    'cinco': 5,
    'seis': 6,
    'siete': 7,
    'ocho': 8,
    'nueve': 9,
    'diez': 10
  };

  for (const [word, num] of Object.entries(words)) {
    if (lower.includes(word)) {
      if (lower.includes('semana')) return num * 7;
      if (lower.includes('mes')) return num * 30;
      return num;
    }
  }

  return 7; // Default
}

// Calcular horarios basados en frecuencia
function calculateFrequencyTimes(frequency: string, frequencyValue: number): string[] {
  const freq = (frequency || '').toLowerCase();

  // Detectar "cada X horas"
  const hoursMatch = freq.match(/cada\s*(\d+)\s*h/i);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1]);
    const times: string[] = [];
    let currentHour = 8;
    const timesPerDay = Math.min(Math.floor(24 / hours), 6);
    
    for (let i = 0; i < timesPerDay; i++) {
      times.push(`${String(currentHour).padStart(2, '0')}:00`);
      currentHour = (currentHour + hours) % 24;
    }
    return times.length > 0 ? times : ['08:00'];
  }

  // Basado en frequencyValue
  const value = frequencyValue || 1;
  switch (value) {
    case 1: return ['08:00'];
    case 2: return ['08:00', '20:00'];
    case 3: return ['08:00', '14:00', '20:00'];
    case 4: return ['06:00', '12:00', '18:00', '00:00'];
    case 6: return ['06:00', '10:00', '14:00', '18:00', '22:00', '02:00'];
    default: return ['09:00'];
  }
}

// Fallback: extraer medicamentos del texto si falla el JSON
function extractMedicationsFromRawText(text: string): GeminiMedicationResult {
  console.log('[Gemini] 🔄 Intentando extraer medicamentos del texto raw...');
  
  const medications: MedicationData[] = [];
  
  // Patrones comunes de medicamentos en recetas mexicanas
  const medPatterns = [
    /([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]+)\s*(CÁPSULAS?|CAPSULAS?|TABLETAS?|JARABE|GOTAS|ÁMPULAS?|AMPULAS?|COMPRIMIDOS?)\s*(?:DE\s*)?(\d+\s*(?:MG|ML|G|UI)?)/gi,
    /([A-ZÁÉÍÓÚÑ]{4,})\s+(\d+\s*(?:MG|ML|G))/gi
  ];

  const lines = text.split(/[\n\r]+/);
  const foundNames = new Set<string>();

  for (const line of lines) {
    for (const pattern of medPatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const name = match[0].trim().toUpperCase();
        const shortName = name.substring(0, 15);
        
        if (name.length > 5 && !foundNames.has(shortName)) {
          foundNames.add(shortName);
          
          // Buscar frecuencia en la línea o siguiente
          let frequency = 'Consultar médico';
          let frequencyValue = 1;
          const freqMatch = line.match(/cada\s*(\d+)\s*h/i);
          if (freqMatch) {
            const hours = parseInt(freqMatch[1]);
            frequencyValue = Math.floor(24 / hours);
            frequency = `cada ${hours} horas`;
          }

          // Buscar duración
          let durationDays = 7;
          const durMatch = line.match(/(\d+)\s*d[ií]as?|durante\s*(\w+)\s*d[ií]as?|por\s*(\w+)\s*d[ií]as?/i);
          if (durMatch) {
            const numStr = durMatch[1] || durMatch[2] || durMatch[3];
            durationDays = parseDuration(numStr + ' días');
          }

          medications.push({
            name: name,
            dosage: 'Verificar en receta',
            frequency: frequency,
            frequencyValue: frequencyValue,
            frequencyType: 'daily',
            frequencyTimes: calculateFrequencyTimes(frequency, frequencyValue),
            duration: `${durationDays} días`,
            durationDays: durationDays,
            instructions: 'Por favor revisa la receta original',
            indication: ''
          });
        }
      }
    }
  }

  console.log('[Gemini] 📊 Medicamentos extraídos del texto:', medications.length);
  
  return {
    medications,
    rawText: text,
    confidence: 'low'
  };
}

export const extractMedicationDetails = (result: GeminiMedicationResult) => {
  console.log('[Gemini]  Extrayendo detalles de medicamentos...');
  return result.medications.map(med => ({
    name: med.name,
    dosage: med.dosage,
    frequencyType: med.frequencyType,
    frequencyValue: med.frequencyValue,
    frequencyTimes: med.frequencyTimes,
    startDate: new Date().toISOString().split('T')[0],
    endDate: med.durationDays 
      ? new Date(Date.now() + med.durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null,
    isContinuous: false,
    instructions: med.instructions
  }));
};
