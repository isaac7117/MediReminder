# 🚀 Comandos Rápidos

## Iniciar la Aplicación

### Opción 1: Dos Terminales (Recomendado)

**Terminal 1 - Backend**:
```bash
cd server
node dist/server.js
```

**Terminal 2 - Frontend**:
```bash
cd client
npm run dev
```

Luego abre:
```
http://localhost:5173
```

### Opción 2: Una Terminal (Secuencial)

```bash
# Compilar backend
cd server
npm run build
node dist/server.js

# En otra terminal
cd client
npm run dev
```

---

## Desarrollo

### Ejecutar en modo desarrollo con auto-reload

**Backend** (si instalas nodemon):
```bash
cd server
npm run dev
```

**Frontend** (ya tiene auto-reload):
```bash
cd client
npm run dev
```

---

## Base de Datos

### Ver datos en interfaz gráfica
```bash
cd server
npx prisma studio
```
Se abre en: http://localhost:5555

### Empujar cambios del schema
```bash
cd server
npx prisma db push
```

### Generar cliente de Prisma
```bash
cd server
npx prisma generate
```

---

## Compilar para Producción

### Backend
```bash
cd server
npm run build
# Output: dist/server.js
```

### Frontend
```bash
cd client
npm run build
# Output: dist/ (archivos estáticos)
```

---

## Instalar Dependencias

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd client
npm install
```

---

## Limpiar e Instalar de Nuevo

### Backend
```bash
cd server
rm -r node_modules package-lock.json
npm install
npm run build
```

### Frontend
```bash
cd client
rm -r node_modules package-lock.json
npm install
```

---

## Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend | 5000 | http://localhost:5000 |
| Frontend | 5173 | http://localhost:5173 |
| Prisma Studio | 5555 | http://localhost:5555 |

---

## Variables de Entorno

### Backend (server/.env)
```
DATABASE_URL=mongodb+srv://lasday013_db_user:7flx7k4IbtVxMGhI@cluster0.fvkqujl.mongodb.net/medication_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
VAPID_PUBLIC_KEY=BCVAHkwoZ8UO_8nev6vBshXeM36NxYuL-6iflq_02LpkKC3lm5gSXrv8qrdHbP7qlXmXhH0Q8Z8sye2Swmd8NRQ
VAPID_PRIVATE_KEY=PXoyb3of6ONb6xOutrCol0TyjPMStvjdD9iHyWJYXQc
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env si es necesario)
```
VITE_API_URL=http://localhost:5000/api
```

---

## Debugging

### Ver logs del servidor
```bash
cd server
node dist/server.js 2>&1 | tee server.log
```

### Ver logs del cliente (navegador)
1. Abre http://localhost:5173
2. Presiona F12 (DevTools)
3. Ve a la pestaña "Console"

### Usar Prisma Studio para ver datos
```bash
cd server
npx prisma studio
```

---

## Errores Comunes

### "Port already in use"
```bash
# Encuentra el proceso
netstat -ano | findstr :5000  # o :5173

# Mata el proceso (Windows)
taskkill /PID <numero> /F

# En Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### "Cannot find module"
```bash
cd server
npm install
npm run build
```

### "MongoDB connection error"
1. Verifica que estés conectado a internet
2. Verifica tu IP en MongoDB Atlas
3. Verifica el DATABASE_URL

---

## Estructura de Carpetas

```
medication-reminder-app/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── dist/
│   │   └── server.js (compilado)
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   ├── dist/
│   │   └── (archivos compilados)
│   └── package.json
│
└── [documentación]
```

---

## Alias Útiles (Opcional)

Si usas PowerShell, puedes crear aliases:

```powershell
# Agregar a tu perfil de PowerShell
$PROFILE

# Añade:
Set-Alias start-med-app "cd 'c:\Users\eslas\OneDrive\Desktop\organiza-tech\medication-reminder-app'"
```

Luego:
```powershell
start-med-app
```

---

## Git (Si usas control de versiones)

```bash
# Iniciar repositorio
git init

# Configurar usuario
git config user.name "Tu Nombre"
git config user.email "tu@email.com"

# Crear .gitignore (ya existe)
# Agregar archivos
git add .

# Primer commit
git commit -m "Initial commit: Medication Reminder App"

# Ver cambios
git status
git log --oneline
```

---

## Deploy a Producción (Checklist)

### Antes de desplegar:
- [ ] Cambiar JWT_SECRET
- [ ] Cambiar NODE_ENV a "production"
- [ ] Verificar DATABASE_URL
- [ ] Generar nuevas VAPID keys
- [ ] Actualizar CORS_ORIGIN
- [ ] Compilar: `npm run build`
- [ ] Probar localmente

### Dónde desplegar:
- **Backend**: Heroku, Railway, AWS, DigitalOcean
- **Frontend**: Vercel, Netlify, AWS S3
- **Base de datos**: MongoDB Atlas (ya en la nube)

---

## Tips & Tricks

### Monitorear cambios en tiempo real
```bash
# Backend con nodemon
npm install -g nodemon
nodemon --exec ts-node src/server.ts

# Frontend (ya lo hace Vite automáticamente)
```

### Regenerar archivos
```bash
# Prisma
npx prisma generate

# TypeScript
npx tsc --noEmit
```

### Limpiar caché
```bash
# npm
npm cache clean --force
rm -r node_modules package-lock.json
npm install

# Prisma
rm -r node_modules/.prisma
npx prisma generate
```

---

## Soporte Rápido

| Problema | Solución |
|----------|----------|
| App no carga | Verifica http://localhost:5173 |
| 500 Error | Verifica logs del servidor |
| Base datos error | Verifica MongoDB Atlas conectividad |
| CSS roto | Limpia cache del navegador (Ctrl+Shift+R) |
| Notificaciones no funcionan | Verifica permisos del navegador |

---

**Última actualización**: 23 de Enero, 2026
