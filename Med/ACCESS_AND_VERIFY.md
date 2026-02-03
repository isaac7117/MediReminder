# 🚀 Acceso y Verificación de la Aplicación

Guía paso a paso para acceder a la aplicación y verificar que todo está funcionando correctamente.

---

## 📱 ACCESO A LA APLICACIÓN

### URL Principal
```
🌐 http://localhost:5173
```

### Abrir en Navegador
1. Abre tu navegador web favorito (Chrome, Firefox, Safari, Edge)
2. Copia y pega: `http://localhost:5173`
3. Presiona Enter
4. ¡Verás la página de login!

### Si No Funciona
- ✅ Primero verifica que ambos servidores estén corriendo
- ✅ Abre [Verificación de Servidores](#verificar-que-los-servidores-corren)

---

## ✅ VERIFICAR QUE LOS SERVIDORES CORREN

### Ver Backend (Puerto 5000)
```bash
curl http://localhost:5000/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Ver Frontend (Puerto 5173)
```bash
curl http://localhost:5173
```

**Resultado esperado:** HTML de la aplicación (mucho código)

### Terminal Alternative
Si usas Windows PowerShell:
```powershell
Test-NetConnection -ComputerName localhost -Port 5000
Test-NetConnection -ComputerName localhost -Port 5173
```

**Resultado esperado:**
```
TcpTestSucceeded : True
```

---

## 🎯 PRIMEROS PASOS EN LA APP

### 1️⃣ Crear Cuenta
```
URL: http://localhost:5173/register
Email: tunombre@ejemplo.com
Contraseña: Segura123!
Confirmar: Segura123!
```

**Qué pasa:**
- Tu cuenta se crea en MongoDB
- Se hashea tu contraseña con bcrypt
- Recibes un token JWT

### 2️⃣ Iniciar Sesión
```
URL: http://localhost:5173/login
Email: tunombre@ejemplo.com
Contraseña: Segura123!
```

**Qué pasa:**
- Tu contraseña se verifica
- Se emite un token JWT
- Se guarda en localStorage
- Serás redirigido al dashboard

### 3️⃣ Ver Dashboard
```
URL: http://localhost:5173/dashboard
```

**Verás:**
- Número total de medicamentos
- Recordatorios pendientes
- Estadísticas de adherencia
- Gráficos de actividad

### 4️⃣ Agregar Medicamento
```
Vínculo: Click en "Agregar Medicamento" en el dashboard
```

**Datos necesarios:**
```
Nombre: Ibuprofeno
Dosis: 400 mg
Frecuencia: Cada 6 horas
Descripción: Para dolor de cabeza
Horario:
  - 08:00
  - 14:00
  - 20:00
  - 02:00 (opcional)
```

### 5️⃣ Ver Recordatorios
```
URL: http://localhost:5173/reminders
```

**Verás:**
- Lista de recordatorios pendientes
- Botones: Tomar / Omitir
- Histórico de acciones

### 6️⃣ Probar Tomar/Omitir Medicamento
```
Haz click en "Tomar" o "Omitir"
```

**Qué pasa:**
- Se registra en la base de datos
- Se actualiza tu adherencia
- El recordatorio se marca como completado

---

## 🗄️ VERIFICAR BASE DE DATOS

### Ver MongoDB Atlas Directamente
```
Abre: https://account.mongodb.com/account/login
Email: Tu email de MongoDB Atlas
```

**En el Dashboard:**
1. Selecciona tu cluster: `cluster0`
2. Abre la tab `Collections`
3. Verás tres colecciones:
   - `User`
   - `Medication`
   - `Reminder`

### Usar Prisma Studio
```bash
npx prisma studio
```

**Resultado:**
- Abre http://localhost:5555 automáticamente
- Puedes ver y editar datos visualmente
- CRUD completo desde la UI

**Verificar datos:**
1. Haz login en http://localhost:5173
2. Abre Prisma Studio: `npx prisma studio`
3. Mira User → verás tu usuario creado
4. Mira Medication → verás lo que agregaste
5. Mira Reminder → verás los recordatorios generados

---

## 🧪 PRUEBAS FUNCIONALES

### Test 1: Autenticación ✓
```bash
# Registrarse
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Resultado esperado: Token JWT
```

### Test 2: Obtener Perfil ✓
```bash
# Cambiar TOKEN con el token de arriba
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"

# Resultado esperado: Tu perfil
```

### Test 3: Crear Medicamento ✓
```bash
curl -X POST http://localhost:5000/api/medications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name":"Aspirina",
    "dosage":"500mg",
    "frequency":"cada 8 horas",
    "description":"Para dolor",
    "schedule":[
      {"time":"08:00","days":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]}
    ]
  }'

# Resultado esperado: Medicamento creado
```

### Test 4: Obtener Medicamentos ✓
```bash
curl -X GET http://localhost:5000/api/medications \
  -H "Authorization: Bearer TOKEN"

# Resultado esperado: Lista de tus medicamentos
```

### Test 5: Obtener Recordatorios ✓
```bash
curl -X GET http://localhost:5000/api/reminders \
  -H "Authorization: Bearer TOKEN"

# Resultado esperado: Lista de recordatorios
```

---

## 📊 MONITOREAR SERVIDORES EN TIEMPO REAL

### Terminal 1: Monitorear Backend
```bash
# Ir a carpeta del backend
cd server

# Ver logs en tiempo real
npm run dev
```

**Verás:**
```
Server is running on port 5000
Environment: development
```

### Terminal 2: Monitorear Frontend
```bash
# Ir a carpeta del frontend
cd client

# Ver logs en tiempo real
npm run dev
```

**Verás:**
```
VITE v5.4.21 ready in XXXms
Local: http://localhost:5173/
```

### Terminal 3: Monitorear Base de Datos
```bash
# Abrir Prisma Studio
cd server
npx prisma studio
```

**Verás:**
- Dashboard de datos en http://localhost:5555
- Actualización en tiempo real de cambios

---

## 🔍 CHECKLIST DE VERIFICACIÓN

### ✅ Servidores Corriendo
- [ ] Backend responde en http://localhost:5000
- [ ] Frontend carga en http://localhost:5173
- [ ] No hay errores en las terminales

### ✅ Base de Datos
- [ ] MongoDB Atlas accesible
- [ ] Colecciones creadas: User, Medication, Reminder
- [ ] Índices creados correctamente

### ✅ Autenticación
- [ ] Puedo registrar una nueva cuenta
- [ ] Puedo iniciar sesión
- [ ] Aparezco en la colección User

### ✅ Funcionalidad
- [ ] Puedo agregar medicamentos
- [ ] Puedo ver medicamentos
- [ ] Puedo ver recordatorios
- [ ] Puedo marcar recordatorios como tomados
- [ ] Puedo omitir recordatorios

### ✅ Interfaz
- [ ] La UI carga correctamente
- [ ] Los botones responden
- [ ] Los formularios validan
- [ ] Los gráficos se muestran

---

## 🆘 PROBLEMAS COMUNES

### ❌ "Cannot GET /health"
**Problema:** Backend no está corriendo

**Solución:**
```bash
cd server
npm run dev
```

### ❌ "Connection refused on port 5173"
**Problema:** Frontend no está corriendo

**Solución:**
```bash
cd client
npm run dev
```

### ❌ "Cannot connect to MongoDB"
**Problema:** Conexión a MongoDB Atlas fallida

**Solución:**
1. Verifica tu string de conexión en server/.env
2. Revisa que el IP esté whitelisted en MongoDB Atlas
3. Verifica tu contraseña (sin caracteres especiales encoding)

### ❌ "Token is invalid"
**Problema:** JWT token expiró o es inválido

**Solución:**
```javascript
// Inicia sesión nuevamente
// El localStorage se limpiar automáticamente
```

### ❌ "CORS error"
**Problema:** El frontend no puede hablar con el backend

**Solución:**
- Asegúrate de que el backend está en http://localhost:5000
- Asegúrate de que el frontend está en http://localhost:5173

---

## 📈 MONITORING

### CPU y Memoria (Node.js)
```bash
# Instalar nodemon con modo debug
npm install -g nodemon

# Correr con monitor
nodemon --inspect dist/server.js
```

### Logs de Base de Datos
```bash
# Habilitar logs de Prisma
export DEBUG="prisma:*"
npm run dev
```

### Logs Detallados del Frontend
```bash
# En la consola del navegador (F12)
localStorage.setItem('DEBUG', '*')
```

---

## 🚀 PRÓXIMOS PASOS

### Después de Verificar que Todo Funciona

#### Opción 1: Probar Push Notifications
1. Abre DevTools (F12)
2. Ve a Application → Service Workers
3. Verifica que el service worker esté registrado
4. Permite notificaciones cuando el navegador lo pida

#### Opción 2: Probar OCR
1. Ve a Reminders
2. Click en "Scan Prescription"
3. Carga una imagen de una receta
4. Verifica que se extraiga el texto

#### Opción 3: Instalar como PWA
1. Click en el icono + en la barra de direcciones
2. "Instalar app"
3. Ábrede desde tu escritorio

#### Opción 4: Probar Offline
1. Abre la app en http://localhost:5173
2. Abre DevTools (F12)
3. Ve a Network
4. Marca "Offline"
5. Intenta navegar - algunas páginas funcionarán con cache

---

## 📞 PUERTOS EN USO

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 5000 | http://localhost:5000 |
| Prisma Studio | 5555 | http://localhost:5555 |

---

## 🔗 LINKS IMPORTANTES

| Recurso | Link |
|---------|------|
| App Frontend | http://localhost:5173 |
| API Backend | http://localhost:5000 |
| Base de Datos | https://account.mongodb.com |
| Prisma Studio | http://localhost:5555 |
| Login | http://localhost:5173/login |
| Register | http://localhost:5173/register |
| Dashboard | http://localhost:5173/dashboard |
| Medications | http://localhost:5173/medications |
| Reminders | http://localhost:5173/reminders |

---

## ✨ ¡LISTO!

Si llegas aquí sin errores, **¡tu aplicación está 100% funcional!**

### Próximas recomendaciones:
1. ✅ Lee [READY_TO_USE.md](./READY_TO_USE.md) para aprender todas las funciones
2. ✅ Lee [QUICK_COMMANDS.md](./QUICK_COMMANDS.md) para comandos útiles
3. ✅ Consulta [README.md](./README.md) para documentación técnica

---

**Versión**: 1.0
**Última actualización**: 23 de Enero, 2026
**Estado**: ✅ LISTO PARA PRODUCCIÓN

¡Disfruta tu aplicación! 🎉
