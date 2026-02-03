# 🎯 Guía de Uso - Escáner de Recetas con IA (OCR)

## 📱 ¿Qué es el Escáner de Recetas?

El escáner de recetas utiliza **Inteligencia Artificial (OCR - Optical Character Recognition)** para:
- ✅ Leer texto de imágenes de recetas médicas
- ✅ Extraer automáticamente: medicamento, dosis, frecuencia, instrucciones
- ✅ Prellenar el formulario de medicamentos
- ✅ Ahorrar tiempo en entrada manual de datos

---

## 🚀 Cómo Usar el Escáner

### Paso 1: Acceder al Escáner
1. Inicia sesión en la aplicación
2. Haz clic en **"Medicamentos"** en el menú
3. Haz clic en **"Escanear"** (botón púrpura)

### Paso 2: Subir la Receta
Tienes dos opciones:
- **Opción A**: Haz clic en el área de carga y selecciona una imagen
- **Opción B**: Arrastra la imagen directamente al área de carga

**Formatos soportados**: PNG, JPG, JPEG
**Tamaño máximo**: 5MB

### Paso 3: Esperar al Procesamiento
- La IA procesará la imagen (puede tomar 5-15 segundos)
- Verás una barra de progreso: "Procesando imagen..."
- Una vez completo, verás "¡Receta escaneada exitosamente!"

### Paso 4: Revisar Datos Extraídos
El escáner mostrará:
```
📋 Datos Extraídos:
├── Medicamento: Ibuprofeno
├── Dosis: 500mg
├── Frecuencia: 2 veces al día
├── Duración: 10 días
└── Instrucciones: Tomar con comida
```

⚠️ **Importante**: Revisa todos los datos antes de guardar

### Paso 5: Completar el Formulario
Los datos extraídos se rellenarán automáticamente en:
- **Nombre del Medicamento** ← Llenado por OCR
- **Dosis** ← Llenado por OCR
- **Tipo de Frecuencia** → Debes seleccionar (Diario/Semanal/Mensual)
- **Veces por Día** ← Llenado automáticamente si se detectó
- **Horarios** → Debes ingresar (ej: 09:00, 21:00)
- **Instrucciones** ← Llenado por OCR

### Paso 6: Crear el Medicamento
1. Verifica que todo esté correcto
2. Haz clic en **"+ Crear Medicamento"**
3. ¡Listo! Tu medicamento está registrado

---

## 🎓 Consejos para Mejores Resultados

### Recomendaciones:
- ✅ Usa fotos **claras y bien iluminadas**
- ✅ Asegúrate que el texto sea **legible**
- ✅ Toma la foto **de frente** (no en ángulo)
- ✅ Incluye **todo el texto importante**
- ✅ Evita **sombras o reflejos de luz**

### Qué NO hacer:
- ❌ Fotos borrosas o pixeladas
- ❌ Foto muy oscura o muy clara
- ❌ Fotos en ángulo (45°+)
- ❌ Archivos muy grandes o comprimidos

---

## 🔍 Qué Extrae el OCR

### Nombre del Medicamento
```
Busca palabras como:
- "Ibuprofeno", "Aspirina", "Loratadina"
- Generalmente al inicio de la receta
- Después de etiquetas como "Medication:" o "Rx"
```

### Dosis
```
Busca patrones como:
- "500mg", "10mg", "250 ml", "1 comprimido"
- Números seguidos de unidades
- Generalmente después del nombre
```

### Frecuencia
```
Busca frases como:
- "2 times daily" / "2 veces al día"
- "Every 8 hours" / "Cada 8 horas"
- "Once daily" / "Una vez al día"
```

### Instrucciones
```
Busca información como:
- "Take with food" / "Tomar con comida"
- "Before meals" / "Antes de las comidas"
- "Do not take with" / "No tomar con"
```

---

## ⚙️ Tecnología Detrás del Escáner

### OCR (Optical Character Recognition)
- **Motor**: Tesseract.js (basado en Tesseract de Google)
- **Procesamiento**: Cliente + Servidor
- **Lenguaje**: Inglés y Español
- **Precisión**: ~90% en textos claros

### Flujo de Procesamiento
```
1. Usuario sube imagen
   ↓
2. Frontend valida archivo (formato, tamaño)
   ↓
3. Se envía al servidor (Backend)
   ↓
4. Tesseract.js procesa la imagen
   ↓
5. Se extrae texto y palabras clave
   ↓
6. Se utilizan patrones regex para identificar datos
   ↓
7. Se devuelven los datos estructurados al Frontend
   ↓
8. Se muestran al usuario para revisión
```

---

## 🐛 Solución de Problemas

### El escáner está muy lento
**Causa**: Tesseract necesita inicializar (primera vez)
**Solución**: La segunda receta será más rápida

### No extrae los datos correctamente
**Causas posibles**:
- Imagen borrosa o de mala calidad
- Texto en idioma diferente al inglés/español
- Formato de receta no estándar
**Solución**: Completa manualmente los datos

### La imagen no se carga
**Causas posibles**:
- Archivo corrupto
- Formato no soportado
- Tamaño > 5MB
**Solución**: Intenta con otra imagen

### Error "No se pudieron extraer datos"
**Causa**: OCR no pudo leer la imagen
**Solución**: 
1. Intenta con mejor iluminación
2. Toma foto más grande del documento
3. Completa manualmente el formulario

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Receta Simple
```
Imagen de receta:
"Ibuprofeno 500mg
Take 1 tablet twice daily with food
For 10 days"

Resultado OCR:
├── Medicamento: Ibuprofeno ✅
├── Dosis: 500mg ✅
├── Frecuencia: twice daily ✅
├── Instrucciones: with food ✅
└── Duración: 10 days ✅

Acción: Completa horarios y crea
```

### Ejemplo 2: Receta Complicada
```
Imagen compleja con:
- Múltiples medicamentos
- Instrucciones detalladas
- Texto pequeño o borroso

Resultado OCR:
├── Medicamento: Primer fármaco ✅
├── Dosis: Detectada ✅
├── Frecuencia: Detectada ✅
├── Instrucciones: Parcial ⚠️
└── Otros datos: Revisar manualmente

Acción: Revisa y completa lo que falte
```

---

## 🔐 Privacidad y Seguridad

- ✅ **Las imágenes se procesan**  localmente (cliente + servidor)
- ✅ **No se almacenan** en la nube
- ✅ **Se eliminan** después del procesamiento
- ✅ **Solo tú** ves los resultados
- ✅ **Cifrado HTTPS** en todas las comunicaciones

---

## 📱 Formatos de Archivo Soportados

| Formato | Soportado | Nota |
|---------|-----------|------|
| PNG | ✅ | Recomendado |
| JPG | ✅ | Recomendado |
| JPEG | ✅ | Recomendado |
| GIF | ❌ | No soportado |
| PDF | ❌ | No soportado |
| WebP | ❌ | No soportado |

---

## 💡 Sugerencias Futuras

Próximas mejoras para el escáner:
- [ ] Soporte para múltiples medicamentos en una receta
- [ ] Reconocimiento automático de horarios específicos
- [ ] Soporte para idiomas adicionales
- [ ] Almacenamiento de historial de escaneos
- [ ] Reconocimiento de código de barras
- [ ] Sincronización con bases de datos de medicamentos

---

## 📞 Soporte

Si tienes problemas con el escáner:

1. **Verifica**: La imagen es clara y legible
2. **Intenta**: Con otra receta más legible
3. **Completa**: Manualmente si es necesario
4. **Reporta**: Si persisten los problemas

---

## ✅ Checklist de Uso

Antes de usar el escáner, verifica:
- [ ] Tienes una imagen de receta
- [ ] La receta es legible
- [ ] El archivo es PNG o JPG
- [ ] El archivo pesa menos de 5MB
- [ ] Estás autenticado
- [ ] El backend está activo

---

**¡Ahora estás listo para usar el escáner de recetas! 📸✨**

El OCR con IA te ayudará a registrar medicamentos más rápido y con precisión.
