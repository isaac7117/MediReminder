# 🤖 Integración con Google Gemini AI

## ¿Qué se implementó?

Se integró **Google Gemini 1.5 Flash** para:
- 📸 Analizar recetas médicas con IA avanzada
- 🤖 Extraer automáticamente medicamentos, dosis, frecuencias
- 🚀 Crear medicamentos y recordatorios de forma **100% automática**
- 📝 Interpretar instrucciones y duraciones naturales

## 🔑 Obtener API Key de Google Gemini

### Paso 1: Crear Proyecto en Google Cloud
1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Haz clic en **"Create API Key"**
3. Copia la API Key generada

### Paso 2: Agregar API Key al Proyecto
1. Abre `server/.env`
2. Reemplaza `tu_api_key_aqui` con tu API Key:
```env
GEMINI_API_KEY=AIzaSyD1234567890...
```

### Paso 3: Reinicia el Servidor
```bash
cd server
npm run dev
```

## 📊 Flujo de Funcionamiento

### 1️⃣ Usuario sube receta
```
[Usuario carga imagen de receta]
          ↓
[Frontend: Envía al servidor]
```

### 2️⃣ Servidor analiza con Gemini
```
[Backend recibe imagen]
          ↓
[Convierte a Base64]
          ↓
[Envía a API de Gemini]
          ↓
[Gemini extrae:]
   - Nombre del medicamento
   - Dosis exacta
   - Frecuencia (ej: "2 veces al día" → 2 times daily)
   - Duración (ej: "7 días")
   - Instrucciones especiales
   - Datos del paciente y doctor
```

### 3️⃣ Frontend muestra datos extraídos
```
[Muestra resultado en tabla legible]
   📋 Medicamento: Amoxicilina
   💊 Dosis: 500mg
   ⏰ Frecuencia: 3 veces al día
   📅 Duración: 7 días
   
[Usuario puede revisar o editar]
```

### 4️⃣ ✨ Crear automáticamente
```
[Usuario hace clic en "✨ Crear automáticamente"]
          ↓
[Medicamentos se crean en BD]
          ↓
[Recordatorios se programan automáticamente]
   - Mañana: 09:00
   - Tarde: 14:00
   - Noche: 21:00
          ↓
[Usuario recibe notificación de éxito]
```

## 🎯 Casos de Uso

### ✅ Funciona bien con:
- Recetas claras y bien fotografiadas
- Texto legible en la imagen
- Formatos estándar de medicamentos
- Instrucciones en español e inglés

### ⚠️ Limitaciones:
- Imágenes borrosas pueden afectar precisión
- Medicamentos genéricos o muy nuevos pueden no reconocerse
- Formatos inusuales requieren revisión manual

## 📱 Interfaz de Usuario

### Componentes Nuevos

#### 1. Scanner con Gemini
- Ubicación: `/scanner`
- Funcionalidad:
  - Carga de imagen (click o drag-and-drop)
  - Análisis en tiempo real
  - Visualización de medicamentos detectados
  - Botón "✨ Crear automáticamente"

#### 2. Auto-creación
- Crea múltiples medicamentos a la vez
- Genera recordatorios para cada horario
- Notificación de éxito al usuario
- Limpia automáticamente después

## 🔧 API Endpoints

### Análisis de Receta
```http
POST /api/ocr/scan
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- prescription: [archivo imagen]

Response:
{
  "message": "Receta escaneada y analizada exitosamente",
  "data": {
    "medications": [
      {
        "name": "Amoxicilina",
        "dosage": "500mg",
        "frequency": "3 veces al día",
        "frequencyValue": 3,
        "frequencyTimes": ["09:00", "14:00", "21:00"],
        "duration": "7 días",
        "instructions": "Con comida"
      }
    ]
  }
}
```

### Crear Medicamentos Automáticamente
```http
POST /api/auto-medications/from-recipe
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "medications": [
    {
      "name": "Amoxicilina",
      "dosage": "500mg",
      "frequencyType": "daily",
      "frequencyValue": 3,
      "frequencyTimes": ["09:00", "14:00", "21:00"],
      "startDate": "2026-01-23",
      "endDate": "2026-01-30",
      "isContinuous": false
    }
  ]
}

Response:
{
  "message": "1 medicamentos y 3 recordatorios creados automáticamente",
  "medications": [...],
  "reminders": [...],
  "count": {
    "medications": 1,
    "reminders": 3
  }
}
```

## 🐛 Debugging

### Ver logs de Gemini
```bash
# En la terminal del servidor verás:
[Gemini] 📋 Analizando receta con IA generativa...
[Gemini] 📝 Respuesta recibida: ...
[Gemini] 🔍 Extrayendo detalles de medicamentos...
[Gemini] ✅ Análisis completado
```

### Errores comunes

#### "GEMINI_API_KEY no configurada"
```
Solución: Agregar la API Key en server/.env
```

#### "No se encontró JSON válido"
```
Posibles causas:
1. Imagen muy borrosa
2. API key inválida o agotada
3. Problema con conexión a Gemini

Solución: Reintentar con otra receta
```

## 💰 Costos

**Google Gemini es GRATUITO** en tier libre:
- 60 solicitudes por minuto
- Suficiente para uso personal/pequeña clínica

Para más solicitudes, revisa: https://ai.google.dev/pricing

## 🚀 Próximas Mejoras

- [ ] Reconocimiento de interacciones medicamentosas
- [ ] Alertas de alergias configurables
- [ ] Exportación de reportes PDF
- [ ] Historial de recetas escaneadas
- [ ] Soporte para múltiples idiomas

## 📚 Documentación Oficial

- [Google Generative AI API](https://ai.google.dev/)
- [Gemini API Documentation](https://ai.google.dev/tutorials/python_quickstart)
- [Node.js SDK](https://www.npmjs.com/package/@google/generative-ai)

---

**Creado:** Enero 2026
**Última actualización:** Enero 23, 2026
**Status:** ✅ Completamente funcional
