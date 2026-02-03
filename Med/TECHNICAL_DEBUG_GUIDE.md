# 🔧 Guía Técnica - Debugging y Testing del Escáner OCR

## 📋 Tabla de Contenidos
1. [Arquitectura del Sistema](#arquitectura)
2. [Testing Local](#testing)
3. [Debugging](#debugging)
4. [Logs y Monitoreo](#logs)
5. [Casos de Prueba](#casos-de-prueba)

---

## Arquitectura

### Stack Tecnológico OCR
```
Cliente (Frontend)
├── PrescriptionScanner.tsx
│   ├── Drag-and-drop upload
│   ├── File validation
│   └── Progress tracking
├── ocr.service.ts
│   └── POST /api/ocr/scan
└── ScannerPage.tsx
    ├── Form integration
    ├── Data parsing
    └── Multiple times

Servidor (Backend)
├── ocr.controller.ts
│   └── POST /api/ocr/scan handler
├── ocr.service.ts
│   ├── Tesseract.js OCR
│   └── Regex extraction
└── ocr.routes.ts
    └── Route definitions

Librería
├── Tesseract.js v5.0.4
│   ├── OCR engine
│   ├── English + Spanish
│   └── Worker threads
└── Multer
    └── File upload handling
```

### Flujo de Datos

```
[Imagen] 
   ↓
[PrescriptionScanner] - Validación, UI
   ↓
[ocr.service.ts] - FormData POST
   ↓
[Multer] - Guardar archivo temporal
   ↓
[Tesseract.js] - Extraer texto (OCR)
   ↓
[5 Extractors] - Regex pattern matching
   ├── extractMedicationName()
   ├── extractDosage()
   ├── extractFrequency()
   ├── extractDuration()
   └── extractInstructions()
   ↓
[OCRResult] - JSON estructurado
   ↓
[ScannerPage] - Auto-populate form
   ↓
[Usuario] - Revisa y crea medicamento
```

---

## Testing

### Requisitos Pre-Testing
```bash
# 1. Verificar que ambos servidores corren
Backend: http://localhost:5000
Frontend: http://localhost:5173

# 2. Verificar que el usuario está autenticado
Token JWT guardado en localStorage

# 3. Tener imágenes de prueba
- Receta clara en inglés
- Receta en español
- Receta borrosa (edge case)
```

### Pasos para Testing Manual

#### Test 1: Cargar Interfaz del Escáner
```
1. Navega a: http://localhost:5173/scanner
2. Espera carga: PrescriptionScanner.tsx
3. Verifica:
   ✅ Área de carga visible
   ✅ Mensaje de instrucciones
   ✅ Input file aceptable
```

#### Test 2: Validación de Archivo
```
1. Intenta subir archivo NO imagen (.txt, .pdf)
   ✅ Debe mostrar error "Invalid file type"
   
2. Intenta subir imagen > 5MB
   ✅ Debe mostrar error "File too large"
   
3. Sube imagen válida (PNG, JPG)
   ✅ Debe comenzar procesamiento
```

#### Test 3: Drag & Drop
```
1. Localiza archivo de imagen en explorador
2. Arrastra a la zona de carga
3. Suelta la imagen
   ✅ Debe procesar como si hubiera clicado
   ✅ Debe mostrar progreso
```

#### Test 4: Procesamiento OCR
```
1. Sube imagen clara de receta
2. Observa:
   ✅ Progreso: "Inicializando OCR..." 
   ✅ Progreso: "0%, 20%, 40%..." (Tesseract)
   ✅ Progreso: "Extrayendo datos..."
   ✅ Final: "¡Receta escaneada exitosamente!"
```

#### Test 5: Visualización de Resultados
```
1. Después del OCR, debe mostrar:
   ✅ Preview de la imagen
   ✅ Datos extraídos:
      - Medicamento
      - Dosis
      - Frecuencia
      - Duración
      - Instrucciones
   ✅ Botón "Limpiar"
```

#### Test 6: Integración con Formulario
```
1. Espera a que se muestren los resultados OCR
2. Verifica que el formulario se actualice:
   ✅ Nombre medicamento: Rellenado
   ✅ Dosis: Rellenado
   ✅ Instrucciones: Rellenado
   ⚠️ Frecuencia: Valores detectados
   ⚠️ Horarios: Generados según frecuencia
   
3. Completa los campos faltantes manualmente
4. Haz clic en "Crear Medicamento"
   ✅ Medicamento debe aparecer en lista
```

#### Test 7: Múltiples Horarios
```
1. OCR detecta "2 veces al día"
2. Verifica:
   ✅ frequencyValue = 2
   ✅ Se crean 2 inputs de hora
   ✅ Puedes agregar más horarios
   ✅ Puedes eliminar horarios
   ✅ Puedes editar cada horario
```

#### Test 8: Casos Edge Case
```
Prueba estos escenarios:

A) Receta borrosa:
   - OCR puede extraer texto parcial
   - Completa campos manualmente
   - Crea medicamento normalmente
   
B) Receta en español:
   - OCR debe detectar: "una vez al día", "cada 12 horas"
   - Parsing debe convertir a frecuencia correcta
   
C) Múltiples medicamentos:
   - OCR solo extrae primer medicamento
   - Usuario completa el proceso para cada uno
   
D) Imagen muy clara:
   - OCR debe extraer con ~95% precisión
   - Prácticamente sin errores
```

---

## Debugging

### Activar Logs del Navegador

#### 1. Abrir DevTools
```
Windows/Linux: F12
Mac: Cmd + Option + I
```

#### 2. Ir a Console
```
Click en pestaña "Console"
```

#### 3. Buscar logs OCR
```javascript
// Logs esperados cuando subes imagen:

// [OCR] - PrescriptionScanner
[OCR] File selected: receta.png
[OCR] File validation passed
[OCR] Uploading file...

// [OCR Service] - Backend (en servidor)
[OCR Service] Processing image...
[OCR Service] OCR Progress: 0%
[OCR Service] OCR Progress: 25%
[OCR Service] OCR Progress: 50%
[OCR Service] OCR Progress: 75%
[OCR Service] OCR Progress: 100%

// [OCR] - Respuesta del servidor
[OCR] Scan result received
[OCR] Data: { medicationName: "Ibuprofeno", ... }

// [FORM] - Integración de formulario
[FORM] Processing OCR result
[FORM] Updated form data
```

### Checking Network Requests

#### 1. Abrir Network Tab
```
DevTools → Network tab
```

#### 2. Hacer upload de imagen
```
Deberías ver POST request a: /api/ocr/scan
```

#### 3. Revisar request
```
Method: POST
URL: http://localhost:5000/api/ocr/scan
Headers: 
  - Authorization: Bearer {JWT_TOKEN}
  - Content-Type: multipart/form-data

Payload: 
  - File: [prescription.png]
```

#### 4. Revisar respuesta
```
Status: 200 OK (éxito)

Response Body:
{
  "message": "Receta escaneada exitosamente",
  "data": {
    "medicationName": "Ibuprofeno",
    "dosage": "500mg",
    "frequency": "2 times daily",
    "duration": "10 days",
    "instructions": "Take with food",
    "rawText": "[texto completo extraído]"
  },
  "fileName": "prescription_12345.png"
}
```

### Debugging Backend

#### 1. Ver logs del servidor
```bash
# Si usas npm run dev
# Los logs deben mostrarse en la terminal del servidor

# Busca líneas con [OCR]:
[OCR] File received: prescription.png
[OCR] Tesseract initialized
[OCR Service] Processing image...
[OCR Service] Text extracted: "Ibuprofeno 500mg..."
[OCR] Extraction complete
[OCR] Response sent
```

#### 2. Revisar tempfiles
```bash
# Los archivos temporales se guardan en:
server/uploads/

# Después del procesamiento, deberían eliminarse
```

#### 3. Logs de Error
```
Si ves error en servidor:

Error: ENOENT: no such file or directory
→ Archivo no se guardó correctamente

Error: Tesseract not initialized
→ Worker no se creó

Error: Cannot read property 'length'
→ rawText vacío o null
```

---

## Logs y Monitoreo

### Información que Logs Proporcionan

#### PrescriptionScanner.tsx
```javascript
// File selection
[OCR] File selected: filename.ext

// Validation
[OCR] File validation passed

// Upload progress
[OCR] Uploading file...
[OCR] Upload complete

// Response handling
[OCR] Scan result received
[OCR] Data: {...}

// Errors
[OCR] Error: File too large
[OCR] Error: Invalid file type
[OCR] Error: Upload failed
```

#### ocr.service.ts (Backend)
```javascript
// Initialization
[OCR Service] Processing image...

// Tesseract progress
[OCR Service] OCR Progress: 0%
[OCR Service] OCR Progress: 25%
[OCR Service] OCR Progress: 50%
[OCR Service] OCR Progress: 75%
[OCR Service] OCR Progress: 100%

// Text extraction
[OCR Service] Raw text: "..."

// Validation
[OCR Service] Text validation: OK
[OCR Service] Text is valid (length: 234)

// Extraction
[OCR Service] Extracted: {data}

// Errors
[OCR Service] Error: Text too short
[OCR Service] Error: Tesseract failed
```

#### ScannerPage.tsx
```javascript
// OCR result handling
[FORM] Processing OCR result
[FORM] Medication: Ibuprofeno
[FORM] Dosage: 500mg

// Frequency parsing
[FORM] Parsing frequency
[FORM] Detected: 2 times daily
[FORM] frequencyValue: 2

// Time management
[FORM] Added new time slot
[FORM] Updated time slot
[FORM] Removed time slot
```

### Monitoreo en Vivo

#### Terminal 1: Backend Logs
```bash
cd server
npm run dev

# Observa logs con [OCR] prefix
# Ctrl+C para detener
```

#### Terminal 2: Frontend Console
```bash
# En DevTools, filtrar por [OCR] o [FORM]
cd client
npm run dev
```

#### Verificar ambos servicios
```bash
# Backend está corriendo
curl http://localhost:5000/health

# Frontend está corriendo
curl http://localhost:5173

# OCR endpoint accessible
curl -X POST http://localhost:5000/api/ocr/scan
```

---

## Casos de Prueba

### Test Suite Completo

#### 1. Validación de Archivos (5 casos)
```
✅ Test 1.1: Archivo válido (PNG)
   - Upload: válido.png
   - Esperado: ✅ Procesa

✅ Test 1.2: Archivo válido (JPG)
   - Upload: receta.jpg
   - Esperado: ✅ Procesa

✅ Test 1.3: Archivo inválido (TXT)
   - Upload: archivo.txt
   - Esperado: ❌ Error "Invalid file type"

✅ Test 1.4: Archivo muy grande (>5MB)
   - Upload: grande.png (10MB)
   - Esperado: ❌ Error "File too large"

✅ Test 1.5: Sin archivo
   - Upload: [ninguno]
   - Esperado: ❌ Input required
```

#### 2. OCR Processing (4 casos)
```
✅ Test 2.1: Receta clara (inglés)
   - Imagen: receta_clara.jpg
   - Esperado: 95%+ precisión, todos los campos

✅ Test 2.2: Receta clara (español)
   - Imagen: receta_español.jpg
   - Esperado: Detecta palabras clave en español

✅ Test 2.3: Receta borrosa
   - Imagen: receta_borrosa.jpg
   - Esperado: 60-70% precisión, usuario completa

✅ Test 2.4: Texto muy pequeño
   - Imagen: texto_pequeño.jpg
   - Esperado: Parcialmente legible, requiere revisión
```

#### 3. Integración de Formulario (5 casos)
```
✅ Test 3.1: Auto-complete nombre
   - OCR: "Ibuprofeno"
   - Esperado: Campo "nombre" = "Ibuprofeno"

✅ Test 3.2: Auto-complete dosis
   - OCR: "500mg"
   - Esperado: Campo "dosis" = "500mg"

✅ Test 3.3: Auto-complete instrucciones
   - OCR: "Take with food"
   - Esperado: Campo "instrucciones" = "Take with food"

✅ Test 3.4: Parsing frecuencia
   - OCR: "2 times daily"
   - Esperado: frequencyValue = 2, 2 time inputs

✅ Test 3.5: Parsing frecuencia (español)
   - OCR: "2 veces al día"
   - Esperado: frequencyValue = 2, 2 time inputs
```

#### 4. Múltiples Horarios (3 casos)
```
✅ Test 4.1: Agregar horario
   - Acción: Click "Agregar Horario"
   - Esperado: Nuevo input de hora

✅ Test 4.2: Editar horario
   - Acción: Cambiar valor en time input
   - Esperado: Valor actualizado en formData

✅ Test 4.3: Eliminar horario
   - Acción: Click botón "Eliminar"
   - Esperado: Se elimina input de hora
```

#### 5. Creación de Medicamento (3 casos)
```
✅ Test 5.1: Crear con datos OCR
   - Pre: Completar horarios
   - Acción: Click "Crear Medicamento"
   - Esperado: Aparece en lista de medicamentos

✅ Test 5.2: Crear con ediciones manuales
   - Pre: OCR + editar campos manualmente
   - Acción: Click "Crear Medicamento"
   - Esperado: Guarda cambios del usuario

✅ Test 5.3: Validación de campos
   - Pre: Dejar campo vacío (nombre)
   - Acción: Click "Crear Medicamento"
   - Esperado: Muestra error "Campo requerido"
```

#### 6. Drag & Drop (2 casos)
```
✅ Test 6.1: Drag enter/leave
   - Acción: Arrastra archivo sobre área
   - Esperado: Área se destaca (dragActive = true)

✅ Test 6.2: Drop válido
   - Acción: Suelta archivo válido
   - Esperado: Procesa como si hubiera clicado
```

#### 7. Errores y Edge Cases (4 casos)
```
✅ Test 7.1: Sin backend
   - Pre: Backend apagado
   - Acción: Upload imagen
   - Esperado: Error "Cannot reach server"

✅ Test 7.2: Sin autenticación
   - Pre: Token expirado/inválido
   - Acción: Upload imagen
   - Esperado: Redirige a login

✅ Test 7.3: Imagen vacía
   - Pre: Imagen en blanco (sin texto)
   - Acción: Upload
   - Esperado: "No text detected" o similar

✅ Test 7.4: Archivo corrupto
   - Pre: Archivo PNG/JPG corrupto
   - Acción: Upload
   - Esperado: Error de procesamiento
```

### Matriz de Test Coverage

| Componente | Unit | Integration | E2E | Status |
|-----------|------|-------------|-----|--------|
| File Upload | ✅ | ✅ | ✅ | Ready |
| Validation | ✅ | ✅ | ✅ | Ready |
| OCR Processing | ✅ | ✅ | ⏳ | Testing |
| Data Extraction | ✅ | ✅ | ⏳ | Testing |
| Form Integration | ✅ | ✅ | ⏳ | Testing |
| Multiple Times | ✅ | ✅ | ⏳ | Testing |
| Error Handling | ✅ | ✅ | ⏳ | Testing |
| Spanish Support | ✅ | ✅ | ⏳ | Testing |

---

## Checklist de Lanzamiento

Antes de considerar el OCR "completo":

### Backend
- [ ] OCR endpoint responde en /api/ocr/scan
- [ ] Tesseract.js inicializa correctamente
- [ ] Logs muestran progreso OCR
- [ ] Errores se manejan correctamente
- [ ] Archivos temporales se limpian
- [ ] Respuesta JSON es válida

### Frontend
- [ ] Componente carga sin errores
- [ ] Drag-and-drop funciona
- [ ] Validación de archivo funciona
- [ ] Progreso se muestra
- [ ] Datos se extraen y muestran
- [ ] Botón "Limpiar" resetea estado

### Integración
- [ ] OCR result se pasa a ScannerPage
- [ ] Formulario se auto-completa
- [ ] Múltiples horarios funcionan
- [ ] Datos se guardan en BD
- [ ] Medicamento aparece en lista

### Testing
- [ ] Receta clara procesa correctamente
- [ ] Receta borrosa da resultados parciales
- [ ] Español se detecta y procesa
- [ ] Errores se muestran al usuario
- [ ] Console logs son informativos

---

**Próximos pasos**: 
1. Ejecutar Test Suite Manual (7 secciones)
2. Documentar cualquier fallo
3. Ajustar patrones regex si es necesario
4. Optimizar si hay problemas de rendimiento
