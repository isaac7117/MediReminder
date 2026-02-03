import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBVfQ8g1LqmC72aBrV0XQHfCnRCaxe3uwE';
const genAI = new GoogleGenerativeAI(API_KEY);

async function testWithFullError() {
  console.log('🔍 Probando API de Gemini con detalles completos...\n');
  console.log('API Key:', API_KEY.substring(0, 10) + '...');
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Responde solo con la palabra: funciona');
    console.log('✅ ÉXITO:', result.response.text());
  } catch (e) {
    console.log('❌ ERROR COMPLETO:');
    console.log('Mensaje:', e.message);
    console.log('Status:', e.status);
    console.log('StatusText:', e.statusText);
    if (e.errorDetails) {
      console.log('Detalles:', JSON.stringify(e.errorDetails, null, 2));
    }
  }
}

testWithFullError();
