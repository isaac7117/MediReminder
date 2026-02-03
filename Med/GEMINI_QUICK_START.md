# 🚀 GUÍA RÁPIDA - Usar Gemini AI

## ⏱️ 2 Minutos para Configurar

### Paso 1: Obtener API Key (1 minuto)
1. Abre: https://aistudio.google.com/app/apikeys
2. Haz clic en **"Create API Key"**
3. Copia la key que aparece

### Paso 2: Configurar en el Proyecto (30 segundos)
1. Abre `server/.env`
2. Busca la línea: `GEMINI_API_KEY=tu_api_key_aqui`
3. Reemplaza `tu_api_key_aqui` con tu API Key
4. **Guarda el archivo (Ctrl+S)**

### Paso 3: Reiniciar Servidor (30 segundos)
```bash
# En la terminal del servidor:
# 1. Presiona Ctrl+C para detener
# 2. Ejecuta:
npm run dev
```

✅ **¡Listo!** Ya está configurado.

---

## 🧪 Prueba Rápida

### Test 1: Escanear una Receta
1. Abre http://localhost:5173
2. Ve a la sección **"Scanner"**
3. Sube una foto de una receta médica
4. Espera a que Gemini analice (5-10 segundos)
5. Verás los medicamentos detectados

### Test 2: Crear Automáticamente
1. Después de analizar, verás los medicamentos listados
2. Haz clic en el botón verde **"✨ Crear automáticamente"**
3. Espera 3-5 segundos
4. Verás un mensaje: `"✅ X medicamentos y Y recordatorios creados"`

### Test 3: Verificar en Medicamentos
1. Ve a la sección **"Medicamentos"**
2. Verás los medicamentos creados automáticamente
3. Haz clic en uno para ver sus recordatorios
4. Los recordatorios deben estar ya programados

---

## 📸 Ejemplo de Receta para Probar

Puedes usar cualquier foto de receta médica real. Las mejores son:
- ✅ Claras y bien iluminadas
- ✅ Texto legible
- ✅ Medicamentos en español o inglés

Si no tienes una receta, crea una de prueba con:
```
Dr. García - Receta
Paciente: Prueba

PARACETAMOL 500mg
1 comprimido cada 6 horas
Por 3 días

IBUPROFENO 200mg
1 comprimido cada 8 horas
Por 5 días
```

---

## 🔍 Qué Ocurre en Segundo Plano

### En el Servidor:
```
[Recibe imagen]
   ↓
[Convierte a Base64]
   ↓
[Envía a Gemini API]
   ↓
[Gemini analiza y responde con JSON]
   ↓
[Valida y formatea datos]
   ↓
[Devuelve al frontend]
```

### En el Frontend:
```
[Recibe JSON]
   ↓
[Muestra medicamentos en tabla]
   ↓
[Usuario revisa y hace clic en "Crear"]
   ↓
[Envía medicamentos al servidor]
   ↓
[Servidor crea en BD + recordatorios]
   ↓
[Muestra confirmación]
```

---

## ✨ Características Principales

### 1. Análisis Inteligente
- Detecta múltiples medicamentos en 1 receta
- Extrae dosis, frecuencias, duraciones
- Interpreta instrucciones naturales

### 2. Auto-Creación
- Crea medicamentos con 1 clic
- Genera recordatorios automáticos
- Configura horarios inteligentes

### 3. Sin Errores
- Validación en servidor
- Notificaciones amigables
- Recuperación ante errores

---

## 🐛 Troubleshooting

### Problema: "GEMINI_API_KEY no configurada"
```
Solución:
1. Abre server/.env
2. Verifica que GEMINI_API_KEY=AIzaSyD...
3. Sin espacios alrededor del =
4. Sin comillas
```

### Problema: "No se encontró JSON válido"
```
Posibles causas:
- API Key inválida o agotada
- Imagen muy borrosa
- Problema de conexión a Google

Solución:
- Reintentar con otra receta más clara
- Verificar la API Key
```

### Problema: No detecta medicamentos
```
Soluciones:
1. Usa imágenes más claras
2. Medicamentos comunes funcionan mejor
3. Texto debe ser legible
4. Considera revisar manualmente
```

### Problema: Se crean medicamentos duplicados
```
Solución:
- Esto no debería ocurrir
- Si pasa, edita o elimina duplicados manualmente
- Reporta el error
```

---

## 📊 Métricas Esperadas

| Métrica | Esperado |
|---------|----------|
| Tiempo análisis | 5-10 seg |
| Precisión | 90-95% |
| Medicamentos detectados | 1-10+ |
| Recordatorios creados | Auto según frecuencia |
| API calls/minuto | Máx 60 (ilimitado en tier gratuito) |

---

## 💰 Costo

**¡GRATUITO!** 🎉

Google Gemini ofrece:
- Primer 1 millón de tokens: **GRATIS**
- Suficiente para 1000+ recetas al mes
- Sin tarjeta de crédito necesaria

---

## 🎓 Cómo Funciona Gemini

Google Gemini es un modelo de IA multimodal que:
1. **Procesa imágenes** - Lee y entiende fotos
2. **Extrae información** - Identifica medicamentos
3. **Interpreta contexto** - Entiende "2 veces al día"
4. **Genera JSON** - Estructura los datos
5. **Actúa rápido** - Responde en segundos

---

## 📱 Flujo Visual Completo

```
USUARIO
   │
   ├─→ 1️⃣ Carga receta
   │        ↓
   └─→ 2️⃣ Espera análisis
        ↓
    3️⃣ Ve medicamentos
        ↓
    4️⃣ Hace clic "Crear"
        ↓
    5️⃣ Sistema crea todo
        ↓
    6️⃣ Confirmación ✅
        ↓
    7️⃣ Medicamentos listos
        ↓
    8️⃣ Recordatorios activos 🔔
```

---

## 🔗 Próximos Pasos

Después de usar Gemini:
1. ✅ Los medicamentos están en tu lista
2. ✅ Los recordatorios están programados
3. ✅ Recibirás notificaciones en los horarios
4. ✅ Puedes editar medicamentos si necesitas
5. ✅ Puedes agregar más medicamentos manualmente

---

## 📞 Soporte

Si algo no funciona:
1. Verifica que la API Key esté en `.env`
2. Reinicia el servidor
3. Recarga el navegador (F5)
4. Intenta con otra imagen de receta
5. Revisa los logs del servidor (terminal)

---

## ✅ Checklist de Configuración

- [ ] Obtuve API Key de Gemini
- [ ] Agregué la key a `server/.env`
- [ ] Reinicié el servidor
- [ ] Fui a http://localhost:5173
- [ ] Probé el scanner
- [ ] Probé crear automáticamente
- [ ] Verifiqué que medicamentos se crearon
- [ ] Probé que recordatorios están activos

---

**¡Listo para usar! 🚀**

Para más detalles técnicos, ver: `GEMINI_INTEGRATION.md`
Para resumen de implementación, ver: `GEMINI_IMPLEMENTATION_SUMMARY.md`
