import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('[OpenAI] ⚠️ OPENAI_API_KEY no configurada en .env');
} else {
  console.log('[OpenAI] ✅ OPENAI_API_KEY configurada');
}

const openai = new OpenAI({
  apiKey: apiKey || '',
});

export interface OpenAIMedicationResult {
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

export const getOcrSystemPrompt = (): string => {
  return `Eres un EXPERTO FARMACÉUTICO y especialista en OCR. Debes extraer información de recetas médicas en español, incluso si la letra es difícil.

REGLAS:
1) Responde ÚNICAMENTE con JSON válido (sin markdown).
2) NUNCA respondas "No legible" si puedes inferir.
3) Si falta duración o dosis, usa el estándar razonable.
4) Nombres de medicamentos en MAYÚSCULAS.
5) Incluye forma farmacéutica si es evidente (TABLETAS, CAPSULAS, JARABE, etc.).

FORMATO:
{
  "medications": [
    {
      "name": "NOMBRE COMPLETO",
      "dosage": "cantidad y unidad",
      "frequency": "descripción legible",
      "frequencyValue": número,
      "frequencyType": "daily",
      "frequencyTimes": ["HH:MM"],
      "duration": "X días",
      "durationDays": número,
      "instructions": "instrucciones completas",
      "indication": "para qué condición"
    }
  ],
  "patientName": "nombre del paciente",
  "doctorName": "nombre del doctor",
  "date": "fecha",
  "diagnosis": "diagnóstico",
  "confidence": "high"
}`;
};

export const analyzePrescriptionTextWithOpenAI = async (ocrText: string, modelOverride?: string): Promise<OpenAIMedicationResult> => {
  try {
    console.log('[OpenAI] 🧠 Analizando texto OCR con modelo fine-tuned...');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY no está configurada');
    }

    const model = modelOverride || process.env.OPENAI_FT_MODEL_ID || 'gpt-4o-mini';
    const trimmedText = ocrText?.slice(0, 8000) || '';

    if (!trimmedText) {
      throw new Error('Texto OCR vacío');
    }

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: getOcrSystemPrompt() },
        { role: 'user', content: `TEXTO OCR:\n${trimmedText}\n\nDevuelve solo JSON en el formato indicado.` }
      ],
      max_tokens: 2048,
      temperature: 0.1,
    });

    const responseText = response.choices[0]?.message?.content || '';
    console.log('[OpenAI] 📝 Respuesta OCR texto:', responseText.substring(0, 300));

    let parsedResult: OpenAIMedicationResult;

    try {
      let cleanedResponse = responseText
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
        parsedResult.rawText = ocrText;
      } else {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
    } catch (parseError) {
      console.error('[OpenAI] ❌ Error al parsear JSON (texto OCR):', parseError);
      throw parseError;
    }

    parsedResult.medications = normalizeMedications(parsedResult.medications);
    console.log('[OpenAI] ✅ Análisis OCR texto completado');
    return parsedResult;
  } catch (error: any) {
    console.error('[OpenAI] ❌ Error OCR texto:', error.message);
    throw new Error(`Error al analizar texto OCR con OpenAI: ${error.message}`);
  }
};

export const analyzePrescriptionWithOpenAI = async (imagePath: string): Promise<OpenAIMedicationResult> => {
  try {
    console.log('[OpenAI] 🤖 Analizando receta con GPT-4 Vision...');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY no está configurada');
    }

    // Leer imagen como base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Determinar tipo MIME
    const ext = path.extname(imagePath).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    if (ext === '.gif') mimeType = 'image/gif';
    if (ext === '.webp') mimeType = 'image/webp';

    const prompt = `Eres un EXPERTO FARMACÉUTICO Y ESPECIALISTA EN OCR con décadas de experiencia leyendo recetas médicas mexicanas y latinoamericanas, incluyendo recetas MANUSCRITAS con letra de doctor difícil de leer.

CONTEXTO: Los doctores tienen letra difícil de leer. Debes usar tu conocimiento farmacéutico para INFERIR y DEDUCIR información cuando no sea 100% legible.

TAREA CRÍTICA: Analiza esta imagen de receta médica y extrae ABSOLUTAMENTE TODA la información posible.

=== INSTRUCCIONES DE EXTRACCIÓN ===

1. MEDICAMENTOS: Identifica CADA medicamento. Busca:
   - Nombres comerciales mexicanos comunes: Tempra, Tylenol, Advil, Motrin, Amoxil, Augmentin, Bactrim, etc.
   - Genéricos: Paracetamol, Ibuprofeno, Amoxicilina, Naproxeno, Omeprazol, Metformina, etc.
   - Jarabes para tos: Dextrometorfano, Ambroxol, Bromhexina, etc.
   - Antibióticos: Amobay, Ampicilina, Cefalexina, Azitromicina, etc.

2. DOSIS: Busca números seguidos de mg, ml, g, mcg, UI
   - Si ves "500" cerca de un medicamento, probablemente es "500 mg"
   - Para jarabes busca "5 ml", "10 ml", "1 cucharada"

3. FRECUENCIA: Interpreta abreviaturas médicas:
   - "c/8h", "c/8hrs", "cada 8h" = cada 8 horas
   - "c/12h" = cada 12 horas
   - "c/24h", "QD", "OD" = una vez al día
   - "BID" = 2 veces al día
   - "TID" = 3 veces al día
   - "QID" = 4 veces al día
   - "PRN" = según sea necesario

4. DURACIÓN: Busca:
   - "x 5 días", "por 5 días", "durante 5 días"
   - "x 1 semana" = 7 días
   - "x 10 días", "x 14 días"
   - Si no especifica, usa el estándar según el tipo de medicamento:
     * Antibióticos: 7-10 días
     * Antiinflamatorios: 3-5 días
     * Jarabes para tos: 5-7 días

5. INDICACIÓN: Deduce basándote en el medicamento:
   - Antibióticos → "Infección bacteriana"
   - Ibuprofeno/Naproxeno → "Dolor e inflamación"
   - Paracetamol → "Dolor y fiebre"
   - Dextrometorfano → "Tos"
   - Omeprazol → "Protector gástrico"
   - Ambroxol → "Expectorante"

=== CONVERSIÓN DE FRECUENCIAS ===
- "cada 4 horas" = frequencyValue: 6, frequencyTimes: ["06:00", "10:00", "14:00", "18:00", "22:00", "02:00"]
- "cada 6 horas" = frequencyValue: 4, frequencyTimes: ["06:00", "12:00", "18:00", "00:00"]
- "cada 8 horas" = frequencyValue: 3, frequencyTimes: ["08:00", "16:00", "00:00"]
- "cada 12 horas" = frequencyValue: 2, frequencyTimes: ["08:00", "20:00"]
- "cada 24 horas" o "una vez al día" = frequencyValue: 1, frequencyTimes: ["08:00"]

=== FORMATO DE RESPUESTA ===
RESPONDE ÚNICAMENTE CON JSON VÁLIDO (sin markdown, sin backticks, sin explicaciones):

{
  "medications": [
    {
      "name": "NOMBRE COMPLETO DEL MEDICAMENTO (incluir forma farmacéutica)",
      "dosage": "cantidad y unidad (ej: 500 mg, 5 ml)",
      "frequency": "descripción legible (ej: cada 8 horas)",
      "frequencyValue": número_de_tomas_por_día,
      "frequencyType": "daily",
      "frequencyTimes": ["HH:MM", "HH:MM"],
      "duration": "X días",
      "durationDays": número,
      "instructions": "instrucciones completas de cómo tomar",
      "indication": "para qué condición se receta"
    }
  ],
  "patientName": "nombre del paciente",
  "doctorName": "nombre del doctor con título",
  "date": "fecha de la receta",
  "diagnosis": "diagnóstico si aparece",
  "confidence": "high"
}

=== REGLAS CRÍTICAS ===
1. NUNCA respondas "No legible" si puedes INFERIR la información del contexto
2. Si el medicamento es conocido, DEDUCE la indicación aunque no esté escrita
3. Si la duración no está clara, USA EL ESTÁNDAR para ese tipo de medicamento
4. Si la dosis no es clara pero el medicamento sí, USA LA DOSIS ESTÁNDAR
5. Nombres de medicamentos SIEMPRE en MAYÚSCULAS
6. Incluye la forma farmacéutica en el nombre (TABLETAS, CAPSULAS, JARABE, etc.)
7. Si ves letra manuscrita difícil, usa tu conocimiento para interpretar`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',  // GPT-4 con visión
      messages: [
        {
          role: 'system',
          content: 'Eres un experto farmacéutico con 30 años de experiencia leyendo recetas médicas manuscritas. Tienes la habilidad especial de interpretar letra de doctor y conoces todos los medicamentos comerciales y genéricos de México y Latinoamérica. SIEMPRE debes inferir información faltante basándote en tu conocimiento farmacéutico.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.1,
    });

    const responseText = response.choices[0]?.message?.content || '';
    console.log('[OpenAI] 📝 Respuesta recibida:', responseText.substring(0, 300));

    // Parsear JSON de la respuesta
    let parsedResult: OpenAIMedicationResult;

    try {
      // Limpiar la respuesta de posibles caracteres extra
      let cleanedResponse = responseText
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      // Intentar extraer JSON
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
        parsedResult.rawText = responseText;

        console.log('[OpenAI] ✅ JSON parseado correctamente');
        console.log('[OpenAI] 📊 Medicamentos encontrados:', parsedResult.medications?.length || 0);

        // Log detallado
        if (parsedResult.medications && parsedResult.medications.length > 0) {
          parsedResult.medications.forEach((med, idx) => {
            console.log(`[OpenAI]   ${idx + 1}. ${med.name} | ${med.dosage} | ${med.frequency} | ${med.durationDays} días`);
          });
        }
      } else {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
    } catch (parseError) {
      console.error('[OpenAI] ❌ Error al parsear JSON:', parseError);
      throw parseError;
    }

    // Normalizar datos
    parsedResult.medications = normalizeMedications(parsedResult.medications);

    console.log('[OpenAI] ✅ Análisis completado exitosamente');
    return parsedResult;

  } catch (error: any) {
    console.error('[OpenAI] ❌ Error:', error.message);
    throw new Error(`Error al analizar receta con OpenAI: ${error.message}`);
  }
};

// Función para normalizar medicamentos
function normalizeMedications(medications: any[]): any[] {
  if (!medications || !Array.isArray(medications)) {
    return [];
  }

  return medications.map(med => {
    // Asegurar que frequencyTimes sea un array válido
    let frequencyTimes = med.frequencyTimes;
    if (!Array.isArray(frequencyTimes) || frequencyTimes.length === 0) {
      const freqValue = med.frequencyValue || 1;
      if (freqValue === 1) frequencyTimes = ['08:00'];
      else if (freqValue === 2) frequencyTimes = ['08:00', '20:00'];
      else if (freqValue === 3) frequencyTimes = ['08:00', '16:00', '00:00'];
      else if (freqValue === 4) frequencyTimes = ['06:00', '12:00', '18:00', '00:00'];
      else frequencyTimes = ['08:00'];
    }

    return {
      ...med,
      name: med.name?.toUpperCase() || 'MEDICAMENTO',
      frequencyType: med.frequencyType || 'daily',
      frequencyValue: med.frequencyValue || 1,
      frequencyTimes,
      durationDays: med.durationDays || 7,
      duration: med.duration || '7 días',
    };
  });
}
