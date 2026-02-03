# 🧪 Guía de Testing - Funcionalidades en Español

## 1️⃣ Crear Medicamentos con Formulario en Español

### Pasos:
1. Abre http://localhost:5173
2. Haz clic en "Iniciar Sesión" (esquina superior derecha)
3. Usa credenciales de prueba o regístrate
4. Una vez dentro, haz clic en "Medicamentos" en el menú
5. Haz clic en "+ Agregar" (botón azul)
6. Completa el formulario en español:
   - **Nombre del Medicamento**: Ibuprofeno
   - **Dosis**: 500mg
   - **Tipo de Frecuencia**: Diario
   - **Veces por Día**: 2
   - **Horarios (HH:MM)**: 09:00, 21:00
   - **Fecha de Inicio**: 2026-01-23
   - Marca "Medicamento Continuo"
   - **Instrucciones**: Tomar con comida

7. Haz clic en "+ Crear Medicamento"
8. ✅ Deberías ver: "¡Medicamento creado exitosamente!"

---

## 2️⃣ Recibir Recordatorios en Español

### Verificar Recordatorios:
1. En el menú, haz clic en "Recordatorios"
2. Verás una lista con:
   - **Filtros en español**: "Todos", "Pendientes", "Tomados", "Perdidos"
   - **Medicamentos pendientes** listados
   
### Marcar Medicamento Tomado:
1. Haz clic en "Tomar Ahora" (botón verde)
2. ✅ Verás: "¡Recordatorio marcado como tomado!"
3. El estado cambió a "Tomado a las HH:MM"

### Omitir Recordatorio:
1. Haz clic en "Omitir" (botón gris)
2. ✅ Verás: "¡Recordatorio omitido!"
3. El estado cambió a "Omitido"

---

## 3️⃣ Navegar la Interfaz Completamente en Español

### Verificar Navegación:
1. **Barra Superior (Navbar)** muestra:
   - Logo "MediReminder"
   - Menú: "Panel de Control", "Medicamentos", "Recordatorios", "Escáner"
   - Usuario: Tu nombre completo
   - Botón: "Salir"

2. **Panel de Control** muestra:
   - Estadísticas:
     - "Medicamentos Activos"
     - "Recordatorios de Hoy"
     - "Tasa de Adherencia"
     - "Tomados Hoy"
   - Sección: "Medicamentos de Hoy"
   - Botones: "Agregar Medicamento", "Escanear Receta"

3. **Página de Medicamentos**:
   - Título: "Medicamentos"
   - Botones: "Escanear", "Agregar"
   - Filtros: "Activos", "Todos"
   - Tarjetas con: Nombre, Dosis, Frecuencia, Botones "Editar" y "Eliminar"

4. **Página de Recordatorios**:
   - Título: "Recordatorios de Medicamentos"
   - Filtros: "Todos", "Pendientes", "Tomados", "Perdidos"
   - Tarjetas con botones "Tomar Ahora" y "Omitir"

---

## 4️⃣ Agregar Nuevas Funcionalidades

La base está lista para agregar:

### A) Editar Medicamentos
```javascript
// Ya existe el componente MedicationCard con botón "Editar"
// Solo falta crear EditMedicationPage.tsx
```

### B) Historial de Medicamentos
```javascript
// Agregar ruta /medications/history
// Mostrar gráfico de adherencia
```

### C) Sincronización en Tiempo Real
```javascript
// WebSocket está configurado en server
// Agregar conexión en client para actualizaciones live
```

### D) Exportar Reportes
```javascript
// Crear endpoint POST /api/medications/export
// Generar PDF con pdfkit o similar
```

---

## 🧪 Casos de Prueba

### Test 1: Crear Medicamento Completo
- [ ] Navega a "Medicamentos" > "Agregar"
- [ ] Completa todos los campos obligatorios
- [ ] Haz clic en "Crear Medicamento"
- [ ] Verifica que aparece en la lista
- [ ] ✅ Esperado: Medicamento visible con todos sus datos

### Test 2: Marcar Recordatorio Tomado
- [ ] Ve a "Panel de Control"
- [ ] Localiza un recordatorio pendiente
- [ ] Haz clic en "Yo lo Tomé"
- [ ] ✅ Esperado: Estado cambia a "Tomado a las HH:MM"

### Test 3: Ver Adherencia
- [ ] Ve a "Recordatorios"
- [ ] Filtra por "Todos"
- [ ] Ve en la barra derecha "Adherencia (7 días)"
- [ ] ✅ Esperado: Muestra porcentaje y estadísticas

### Test 4: Navegación Completa
- [ ] Haz clic en cada sección del menú
- [ ] Verifica que los títulos estén en español
- [ ] Verifica que los botones tengan texto español
- [ ] ✅ Esperado: Todo en español sin errores

### Test 5: Formularios de Validación
- [ ] Intenta crear medicamento sin nombre
- [ ] ✅ Esperado: "El nombre del medicamento es requerido"
- [ ] Intenta registrarse con contraseña débil
- [ ] ✅ Esperado: Mensaje sobre requisitos de contraseña

---

## 📊 Verificación de Datos

### Medicamentos Creados
```sql
SELECT * FROM Medication ORDER BY createdAt DESC LIMIT 5;
```

### Recordatorios Pendientes
```sql
SELECT * FROM Reminder WHERE status = 'pending' ORDER BY scheduledTime;
```

### Adherencia por Usuario
```sql
SELECT 
  u.fullName,
  COUNT(r.id) as total_reminders,
  SUM(CASE WHEN r.status = 'taken' THEN 1 ELSE 0 END) as taken,
  ROUND(SUM(CASE WHEN r.status = 'taken' THEN 1 ELSE 0 END) * 100.0 / COUNT(r.id), 2) as adherence_rate
FROM Reminder r
JOIN Medication m ON r.medicationId = m.id
JOIN User u ON m.userId = u.id
GROUP BY u.id, u.fullName;
```

---

## 🐛 Solución de Problemas

### Puerto 5000 ya está en uso
```powershell
# Encontrar proceso
netstat -ano | findstr :5000

# Matar proceso
taskkill /PID <PID> /F

# Reiniciar backend
npm run dev
```

### Puerto 5173 ya está en uso
```powershell
# Encontrar proceso
netstat -ano | findstr :5173

# Matar proceso
taskkill /PID <PID> /F

# Reiniciar frontend
npm run dev
```

### Medicamento no se crea
```
1. Abre DevTools (F12)
2. Ve a "Console" para ver errores
3. Ve a "Network" para ver respuesta de API
4. Verifica que backend está corriendo (npm run dev en /server)
5. Verifica que hay token de autenticación en localStorage
```

### Recordatorios no aparecen
```
1. Verifica que hay medicamentos creados
2. Verifica que las horas ya pasaron para hoy
3. Intenta crear un medicamento con hora futura
4. Recarga la página para sincronizar
```

---

## 📱 URLs Principales

| Página | URL | Estado |
|--------|-----|--------|
| Inicio | http://localhost:5173 | ✅ Público |
| Login | http://localhost:5173/login | ✅ Público |
| Registro | http://localhost:5173/register | ✅ Público |
| Dashboard | http://localhost:5173/dashboard | 🔒 Protegido |
| Medicamentos | http://localhost:5173/medications | 🔒 Protegido |
| Agregar Med | http://localhost:5173/medications/new | 🔒 Protegido |
| Recordatorios | http://localhost:5173/reminders | 🔒 Protegido |
| Escáner | http://localhost:5173/scanner | 🔒 Protegido |

---

## ✅ Checklist Final

- [ ] Backend ejecutándose sin errores
- [ ] Frontend compilando sin errores
- [ ] Página de inicio carga correctamente
- [ ] Puedo crear una cuenta
- [ ] Puedo iniciar sesión
- [ ] Puedo crear un medicamento
- [ ] Puedo ver medicamentos en la lista
- [ ] Puedo ver recordatorios
- [ ] Puedo marcar recordatorios como tomados
- [ ] Todo el texto está en español
- [ ] No hay errores en la consola

---

**Si todo funciona correctamente, ¡tu aplicación está lista para usar! 🎉**
