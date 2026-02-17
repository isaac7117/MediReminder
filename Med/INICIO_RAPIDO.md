# 🚀 INICIO RÁPIDO - MediReminder

## ¡BIENVENIDO! 🎉

Tu aplicación está **100% lista** para usar. Interfaz completa en español con todas las funcionalidades.

---

## ⚡ Pasos para Iniciar

### 1. Abre DOS terminales PowerShell

**Terminal 1 - Backend:**
```powershell
cd server
npm run dev
```
✅ Deberías ver: `Server is running on port 5000`

**Terminal 2 - Frontend:**
```powershell
cd client
npm run dev
```
✅ Deberías ver: `Local: http://localhost:5173/`

### 2. Abre tu navegador
```
http://localhost:5173
```

---

## 📝 Primera Vez - Pasos Básicos

### 1. Crear Cuenta
1. Haz clic en **"Crear Cuenta"**
2. Completa el formulario:
   - **Nombre**: Tu nombre completo
   - **Correo**: tu@email.com
   - **Contraseña**: Mínimo 8 caracteres (1 mayúscula, 1 minúscula, 1 número)
   - **Confirmar Contraseña**: Repite la contraseña
3. Haz clic en **"Crear Cuenta"**
4. ✅ Serás redirigido automáticamente al panel

### 2. Agregar Tu Primer Medicamento
1. Haz clic en **"Medicamentos"** en el menú
2. Haz clic en **"+ Agregar"**
3. Completa el formulario:
   - **Nombre**: Ej: "Ibuprofeno"
   - **Dosis**: Ej: "500mg"
   - **Frecuencia**: "Diario"
   - **Veces por Día**: 2
   - **Horarios**: 09:00, 21:00
   - **Fecha de Inicio**: Hoy
   - Marca **"Medicamento Continuo"** si no tiene fin
4. Haz clic en **"+ Crear Medicamento"**
5. ✅ Verás: "¡Medicamento creado exitosamente!"

### 3. Ver y Gestionar Recordatorios
1. Haz clic en **"Recordatorios"** en el menú
2. Verás todos tus medicamentos programados
3. Cuando tomes un medicamento:
   - Haz clic en **"Tomar Ahora"** (botón verde)
   - ✅ Verás: "¡Recordatorio marcado como tomado!"
4. Para omitir:
   - Haz clic en **"Omitir"** (botón gris)

---

## 🎯 Funcionalidades Disponibles

### Panel de Control
- Estadísticas generales (medicamentos activos, recordatorios, adherencia)
- Próximo medicamento a tomar
- Medicamentos de hoy
- Gráfico de adherencia semanal

### Medicamentos
- Crear nuevos medicamentos
- Ver lista completa
- Editar medicamentos existentes
- Eliminar medicamentos
- Subir imágenes

### Recordatorios
- Ver todos los recordatorios
- Filtrar por estado (Todos, Pendientes, Tomados, Perdidos)
- Marcar como tomado
- Omitir recordatorio
- Ver historial

### Escáner OCR (Recetas)
- Subir foto de receta médica
- Extracción automática de datos
- Auto-completar formulario de medicamento
- Soporta JPG y PNG

---

## 🔧 Comandos Útiles

### Reiniciar Servidores
```powershell
# Detener: Ctrl + C en cada terminal
# Iniciar nuevamente:
cd server
npm run dev

# En otra terminal:
cd client
npm run dev
```

### Ver Base de Datos (Prisma Studio)
```powershell
cd server
npx prisma studio
```
Se abrirá en: http://localhost:5555

### Resetear Base de Datos (si hay problemas)
```powershell
cd server
npx prisma migrate reset
npx prisma migrate dev
```

---

## 🐛 Solución de Problemas

### Error: "Puerto 5000 ya está en uso"
```powershell
netstat -ano | findstr :5000
taskkill /PID <número-del-pid> /F
```

### Error: "No se puede conectar a la base de datos"
1. Verifica que PostgreSQL/MongoDB esté corriendo
2. Revisa tu archivo `.env` en `/server`
3. Ejecuta: `npx prisma migrate dev`

### Los recordatorios no aparecen
- Asegúrate de que el medicamento tenga horarios configurados
- Verifica que la fecha de inicio sea hoy o anterior
- Recarga la página (F5)

### El OCR no funciona
- Verifica que la imagen sea JPG o PNG
- Asegúrate de que la receta tenga texto legible
- Revisa que GEMINI_API_KEY esté configurada (opcional pero mejora resultados)

---

## 📚 Más Información

Para documentación detallada, consulta:

- **[README_ES.md](README_ES.md)** - Documentación principal en español
- **[GUIA_COMPLETA.md](GUIA_COMPLETA.md)** - Guía técnica completa

---

## 🎉 ¡Listo para Usar!

Tu aplicación **MediReminder** está 100% operativa y en español.

**¡No olvides tomar tus medicamentos a tiempo!** 💊⏰

---

**Última actualización:** Febrero 2026
