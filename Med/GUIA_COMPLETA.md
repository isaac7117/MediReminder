# 📖 GUÍA COMPLETA - MediReminder

Documentación técnica completa del sistema de gestión de medicamentos.

---

## 📑 Tabla de Contenidos

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Instalación Detallada](#instalación-detallada)
3. [Configuración](#configuración)
4. [API Backend](#api-backend)
5. [Componentes Frontend](#componentes-frontend)
6. [Sistema OCR](#sistema-ocr)
7. [Notificaciones](#notificaciones)
8. [Base de Datos](#base-de-datos)
9. [Testing](#testing)
10. [Despliegue](#despliegue)

---

## 🏗️ Arquitectura del Sistema

### Diagrama General

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (React)                       │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │Dashboard │  │ Medicam. │  │ Scanner  │   │
│  │ Register │  │  Stats   │  │ Reminders│  │   OCR    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Context API (Auth, Notifications)           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Services (API, Axios)                    │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP/REST
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                    SERVIDOR (Express)                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   Meds   │  │Reminders │  │   OCR    │   │
│  │ Controller│  │Controller│  │Controller│  │Controller│   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
│        │             │              │             │         │
│  ┌─────▼────────────▼──────────────▼─────────────▼────┐    │
│  │              Services Layer                         │    │
│  │  ├─ AuthService                                     │    │
│  │  ├─ MedicationService                               │    │
│  │  ├─ ReminderService                                 │    │
│  │  ├─ OCRService (Tesseract)                          │    │
│  │  ├─ GeminiService (AI OCR)                          │    │
│  │  └─ NotificationService                             │    │
│  └────────────────────┬────────────────────────────────┘    │
└───────────────────────┼─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL/MongoDB)              │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Meds    │  │Reminders │  │  Notif   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Tecnologías por Capa

#### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite 5
- **Routing**: React Router DOM v6
- **Estado**: Context API + Hooks
- **Estilos**: Tailwind CSS 3
- **Gráficos**: Recharts
- **OCR Cliente**: Tesseract.js
- **HTTP**: Axios

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Auth**: JWT + Bcrypt
- **OCR Servidor**: Tesseract.js + Gemini AI
- **Jobs**: node-cron
- **Push**: web-push

#### Base de Datos
- **Opción 1**: PostgreSQL 14+ (Recomendado)
- **Opción 2**: MongoDB 5+

---

## 🔧 Instalación Detallada

### Requisitos del Sistema

```bash
Node.js:     >= 18.0.0
npm:         >= 9.0.0
PostgreSQL:  >= 14.0 (o MongoDB >= 5.0)
RAM:         >= 4GB
Disk:        >= 2GB libres
```

### Paso 1: Clonar Repositorio

```bash
git clone <tu-repositorio-url>
cd MediReminder/Med
```

### Paso 2: Configurar Backend

```bash
cd server
npm install
```

**Dependencias principales instaladas:**
- express: Framework web
- @prisma/client: ORM
- jsonwebtoken: JWT auth
- bcrypt: Hash passwords
- tesseract.js: OCR
- @google/generative-ai: Gemini AI
- multer: Upload files
- node-cron: Scheduled tasks
- web-push: Push notifications

### Paso 3: Configurar Base de Datos

**Opción A: PostgreSQL**

```bash
# Crear base de datos
createdb medireminder

# Configurar .env
DATABASE_URL="postgresql://usuario:password@localhost:5432/medireminder"

# Ejecutar migraciones
npx prisma migrate dev --name init
npx prisma generate
```

**Opción B: MongoDB**

```bash
# .env
DATABASE_URL="mongodb://localhost:27017/medireminder"

# Ejecutar setup
npx prisma db push
npx prisma generate
```

### Paso 4: Configurar Frontend

```bash
cd ../client
npm install
```

**Dependencias principales instaladas:**
- react: UI library
- react-router-dom: Routing
- tailwindcss: Styles
- axios: HTTP client
- recharts: Charts
- tesseract.js: OCR
- lucide-react: Icons

### Paso 5: Configurar Variables de Entorno

**Backend (.env):**
```env
# Base de datos
DATABASE_URL="postgresql://localhost:5432/medireminder"

# JWT Secret (genera uno con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET="tu-secreto-super-seguro-de-64-caracteres-minimo"

# Puerto
PORT=5000

# Gemini API (Opcional)
GEMINI_API_KEY="tu-gemini-api-key"

# Web Push (Opcional)
VAPID_PUBLIC_KEY="tu-vapid-public-key"
VAPID_PRIVATE_KEY="tu-vapid-private-key"
VAPID_SUBJECT="mailto:tu-email@ejemplo.com"
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=tu-gemini-api-key-opcional
```

---

## 🔌 API Backend

### Autenticación

#### POST /api/auth/register
Registrar nuevo usuario

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }
}
```

#### POST /api/auth/login
Iniciar sesión

**Request:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }
}
```

### Medicamentos

#### GET /api/medications
Obtener todos los medicamentos del usuario

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Ibuprofeno",
    "dosage": "500mg",
    "frequency": "DAILY",
    "times": ["09:00", "21:00"],
    "instructions": "Tomar con comida",
    "startDate": "2026-01-01",
    "endDate": null,
    "active": true
  }
]
```

#### POST /api/medications
Crear medicamento

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Ibuprofeno",
  "dosage": "500mg",
  "frequency": "DAILY",
  "times": ["09:00", "21:00"],
  "instructions": "Tomar con comida",
  "startDate": "2026-01-01",
  "continuous": true
}
```

#### PUT /api/medications/:id
Actualizar medicamento

#### DELETE /api/medications/:id
Eliminar medicamento

### Recordatorios

#### GET /api/reminders
Obtener recordatorios

**Query params:**
- `status`: "pending" | "taken" | "skipped"
- `date`: "2026-01-23"

**Response:**
```json
[
  {
    "id": "uuid",
    "medicationId": "uuid",
    "medication": {
      "name": "Ibuprofeno",
      "dosage": "500mg"
    },
    "scheduledTime": "2026-01-23T09:00:00Z",
    "status": "pending",
    "takenAt": null
  }
]
```

#### PATCH /api/reminders/:id/taken
Marcar como tomado

#### PATCH /api/reminders/:id/skip
Marcar como omitido

### OCR

#### POST /api/ocr/scan
Escanear receta médica

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```
FormData:
  - image: File (JPG/PNG)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Ibuprofeno",
    "dosage": "500mg",
    "frequency": "Cada 8 horas",
    "duration": "7 días",
    "instructions": "Tomar con alimentos"
  },
  "rawText": "Texto completo extraído..."
}
```

---

## 🎨 Componentes Frontend

### Estructura de Componentes

```
src/components/
├── auth/
│   ├── LoginForm.tsx          # Formulario de login
│   └── RegisterForm.tsx       # Formulario de registro
├── common/
│   ├── Navbar.tsx            # Barra de navegación
│   ├── LoadingSpinner.tsx    # Spinner de carga
│   └── ProtectedRoute.tsx    # Ruta protegida HOC
├── dashboard/
│   ├── DashboardStats.tsx    # Estadísticas principales
│   ├── NextMedication.tsx    # Próximo medicamento
│   └── AdherenceChart.tsx    # Gráfico de adherencia
├── medications/
│   ├── MedicationCard.tsx    # Tarjeta de medicamento
│   ├── MedicationForm.tsx    # Formulario crear/editar
│   └── MedicationList.tsx    # Lista de medicamentos
├── reminders/
│   ├── ReminderCard.tsx      # Tarjeta de recordatorio
│   └── ReminderList.tsx      # Lista de recordatorios
└── scanner/
    └── PrescriptionScanner.tsx # Escáner OCR
```

### Hooks Personalizados

#### useAuth
```typescript
const { user, login, register, logout, isAuthenticated } = useAuth();
```

#### useMedications
```typescript
const {
  medications,
  loading,
  createMedication,
  updateMedication,
  deleteMedication,
  refreshMedications
} = useMedications();
```

#### useReminders
```typescript
const {
  reminders,
  loading,
  markAsTaken,
  skipReminder,
  getUpcomingReminders
} = useReminders();
```

#### useNotifications
```typescript
const {
  permission,
  requestPermission,
  subscribeToNotifications
} = useNotifications();
```

---

## 🔍 Sistema OCR

### Flujo de Procesamiento

```
1. Usuario sube imagen
   ↓
2. Frontend valida formato (JPG/PNG)
   ↓
3. Muestra preview + progress bar
   ↓
4. Envía a backend vía FormData
   ↓
5. Backend procesa con Tesseract.js
   ↓
6. Extrae texto completo
   ↓
7. Aplica patrones regex para extraer:
   - Nombre del medicamento
   - Dosificación
   - Frecuencia
   - Duración
   - Instrucciones
   ↓
8. (Opcional) Mejora con Gemini AI
   ↓
9. Retorna datos estructurados
   ↓
10. Frontend auto-completa formulario
```

### Patrones de Extracción

**Medicamento:**
```typescript
/(?:medicamento|med(?:icina)?)[:\s]+([a-záéíóúñ\s]+)/i
/^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ]?[a-záéíóúñ]+)*)/m
```

**Dosificación:**
```typescript
/(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|ui|u))/i
/dosis[:\s]+(\d+(?:\.\d+)?\s*(?:mg|g|ml))/i
```

**Frecuencia:**
```typescript
/cada\s+(\d+)\s+horas?/i
/(\d+)\s+(?:vez|veces)(?:\s+(?:al|por))?\s+d[íi]a/i
/(?:tomar|toma)(?:\s+\w+)?\s+(diario|diariamente)/i
```

### Configuración Tesseract

```typescript
const worker = await createWorker('spa');
await worker.setParameters({
  tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789áéíóúñÁÉÍÓÚÑ .,:-/',
  tessedit_pageseg_mode: PSM.AUTO,
});
```

### Integración Gemini AI

```typescript
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
const result = await model.generateContent([
  "Extrae información de medicamento de esta receta...",
  imagePart
]);
```

### Fine‑tuning OpenAI (texto OCR)

> **Nota:** OpenAI no permite fine‑tuning con imágenes. El enfoque funcional es entrenar con el **texto OCR** y las correcciones del usuario.

#### Flujo de aprendizaje continuo

1. El usuario sube la receta
2. El sistema genera un JSON inicial
3. El usuario corrige y envía feedback con consentimiento
4. Se guarda una muestra sanitizada
5. Se exporta un dataset JSONL
6. Se entrena un modelo fine‑tuned
7. El backend usa el modelo fine‑tuned para interpretar el texto OCR

#### Endpoints

- **POST** `/api/ocr/feedback`
  - Guarda feedback corregido con consentimiento.
  - Payload mínimo:
    ```json
    {
      "rawText": "texto OCR",
      "modelOutput": { "...": "..." },
      "correctedOutput": { "...": "..." },
      "consent": true
    }
    ```

- **GET** `/api/ocr/training-dataset?format=jsonl&limit=500`
  - Exporta dataset JSONL para fine‑tuning.
  - Requiere header `x-admin-key` con `ADMIN_API_KEY`.

#### Variables de Entorno

```
OPENAI_API_KEY=...
OPENAI_FT_MODEL_ID=ft:gpt-4o-mini:tu-org:medireminder-ocr:xxxxx
ADMIN_API_KEY=...
```

#### Entrenamiento (resumen)

1. Exporta JSONL:
   ```bash
   curl -H "x-admin-key: TU_ADMIN_KEY" \
     "http://localhost:5000/api/ocr/training-dataset?format=jsonl&limit=1000" \
     -o ocr_dataset.jsonl
   ```
2. Sube y entrena en OpenAI:
   ```bash
   # Requiere OpenAI CLI configurado
   openai files upload --purpose fine-tune --file ocr_dataset.jsonl
   openai fine_tuning.jobs.create -m gpt-4o-mini -t <FILE_ID>
   ```
3. Configura `OPENAI_FT_MODEL_ID` con el ID resultante.

#### Uso automático en backend

Si `OPENAI_FT_MODEL_ID` está configurado, el sistema refina el resultado usando el texto OCR como entrada.

---

## 🛠️ Panel Admin OCR

### Acceso

Ruta protegida: `/admin/ocr`

Requiere:
- Iniciar sesión como usuario normal
- Ingresar `ADMIN_API_KEY` en el panel

### Funcionalidades

- Revisar y eliminar muestras
- Activar/desactivar inclusión en entrenamiento
- Ver métricas por modelo
- Iniciar entrenamiento manual
- Refrescar estado de jobs

---

## 🔔 Sistema de Notificaciones

### Configuración Web Push

1. **Generar VAPID Keys:**
```bash
npx web-push generate-vapid-keys
```

2. **Configurar en .env:**
```env
VAPID_PUBLIC_KEY="BG..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:admin@medireminder.com"
```

3. **Suscribir usuario:**
```typescript
const registration = await navigator.serviceWorker.register('/service-worker.js');
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: VAPID_PUBLIC_KEY
});
```

### Service Worker

**Ubicación:** `client/public/service-worker.js`

**Funcionalidades:**
- Caché de assets
- Notificaciones push
- Sincronización en background

---

## 🗄️ Base de Datos

### Schema Prisma

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  name          String
  password      String
  createdAt     DateTime       @default(now())
  medications   Medication[]
  reminders     Reminder[]
}

model Medication {
  id            String         @id @default(uuid())
  userId        String
  user          User           @relation(fields: [userId], references: [id])
  name          String
  dosage        String
  frequency     Frequency
  times         String[]
  instructions  String?
  startDate     DateTime
  endDate       DateTime?
  active        Boolean        @default(true)
  imageUrl      String?
  createdAt     DateTime       @default(now())
  reminders     Reminder[]
}

model Reminder {
  id              String       @id @default(uuid())
  medicationId    String
  medication      Medication   @relation(fields: [medicationId], references: [id])
  userId          String
  user            User         @relation(fields: [userId], references: [id])
  scheduledTime   DateTime
  status          ReminderStatus @default(PENDING)
  takenAt         DateTime?
  createdAt       DateTime     @default(now())
}

enum Frequency {
  DAILY
  WEEKLY
  HOURLY
  AS_NEEDED
}

enum ReminderStatus {
  PENDING
  TAKEN
  SKIPPED
  MISSED
}
```

### Migraciones

```bash
# Crear migración
npx prisma migrate dev --name descripcion

# Aplicar migraciones
npx prisma migrate deploy

# Ver estado
npx prisma migrate status

# Resetear (desarrollo)
npx prisma migrate reset
```

---

## 🧪 Testing

### Testing Manual

Ver [INICIO_RAPIDO.md](INICIO_RAPIDO.md) para guía de testing manual.

### Testing Automatizado (Futuro)

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🚀 Despliegue

### Opción 1: Vercel + Railway

**Frontend (Vercel):**
```bash
cd client
vercel
```

**Backend (Railway):**
```bash
cd server
railway login
railway up
```

### Opción 2: Docker

```bash
# Build
docker-compose build

# Run
docker-compose up -d
```

### Opción 3: VPS Manual

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:5173;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 📊 Monitoreo

### Health Check

```bash
curl http://localhost:5000/health
```

### Logs

```bash
# Backend
cd server
npm run dev  # Ver logs en consola

# O con PM2
pm2 logs medireminder-api
```

---

## 🔐 Seguridad

### Mejores Prácticas

1. **Nunca commitear .env**
2. **Usar HTTPS en producción**
3. **Actualizar dependencias regularmente**
4. **Validar inputs del usuario**
5. **Rate limiting en API**
6. **CORS configurado correctamente**

---

## 🆘 Solución de Problemas Avanzados

### Error: "Cannot find module '@prisma/client'"

```bash
cd server
npx prisma generate
npm install
```

### Error: "Port 5000 already in use"

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Linux/Mac
lsof -i :5000
kill -9 <pid>
```

### Error: OCR no detecta texto

1. Verificar calidad de imagen
2. Verificar idioma en Tesseract ('spa')
3. Verificar GEMINI_API_KEY si se usa

### Base de datos no conecta

```bash
# PostgreSQL
pg_isready

# MongoDB
mongosh --eval "db.version()"

# Verificar .env
echo $DATABASE_URL
```

---

## 📚 Recursos Adicionales

- [Documentación Prisma](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [Tesseract.js](https://tesseract.projectnaptha.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [Web Push Protocol](https://web.dev/push-notifications/)

---

## 🎯 Performance

### Optimizaciones Implementadas

- ✅ Code splitting con React.lazy
- ✅ Service Worker caché
- ✅ Compresión de imágenes
- ✅ Lazy loading de componentes
- ✅ Debounce en búsquedas
- ✅ Paginación en listas grandes

---

**Última actualización:** Febrero 2026
