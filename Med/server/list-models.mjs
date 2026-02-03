const API_KEY = 'AIzaSyBVfQ8g1LqmC72aBrV0XQHfCnRCaxe3uwE';

async function listModels() {
  console.log('📋 Listando modelos disponibles...\n');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Error:', response.status, response.statusText);
      console.log('Detalles:', error);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Modelos disponibles:\n');
    
    if (data.models) {
      data.models.forEach(model => {
        console.log(`  - ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`    Métodos: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    }
  } catch (e) {
    console.log('❌ Error de red:', e.message);
  }
}

listModels();
