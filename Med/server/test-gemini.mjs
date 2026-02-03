import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBVfQ8g1LqmC72aBrV0XQHfCnRCaxe3uwE';
const genAI = new GoogleGenerativeAI(API_KEY);

const modelsToTest = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'models/gemini-2.0-flash',
  'models/gemini-1.5-flash'
];

async function testModels() {
  console.log('🔍 Probando modelos de Gemini...\n');
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`📡 Probando: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Di "hola" en español');
      console.log(`✅ ${modelName} FUNCIONA: ${result.response.text().substring(0, 50)}\n`);
      return modelName; // Retornar el primer modelo que funcione
    } catch (e) {
      console.log(`❌ ${modelName} FALLÓ: ${e.message.substring(0, 80)}\n`);
    }
  }
  
  console.log('❌ Ningún modelo funcionó');
  return null;
}

testModels();
