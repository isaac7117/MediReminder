# 📱 MediReminder - Gestor de Medicamentos

Sistema de gestión de medicamentos con recordatorios inteligentes, notificaciones push y escaneo OCR de recetas médicas.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- PostgreSQL o MongoDB
- npm o yarn

### Instalación

**1. Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd MediReminder/Med
```

**2. Instalar Backend**
```bash
cd server
npm install
```

**3. Configurar Base de Datos**
```bash
# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tu conexión de base de datos
# DATABASE_URL="tu-conexión-aquí"

# Ejecutar migraciones
npx prisma migrate dev
```

**4. Instalar Frontend**
```bash
cd ../client
npm install
```

### Ejecutar la Aplicación

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Verás: `✅ Server is running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Verás: `✅ Local: http://localhost:5173/`

**Abre tu navegador:**
```
http://localhost:5173
```

---

## ✨ Características

### 🔐 Autenticación
- Registro e inicio de sesión seguro con JWT
- Encriptación de contraseñas con bcrypt
- Rutas protegidas

### 💊 Gestión de Medicamentos
- Crear, editar, eliminar y ver medicamentos
- Soporte para diferentes frecuencias (diario, semanal, por horas)
- Instrucciones y seguimiento de dosis
- Carga de imágenes de medicamentos

### ⏰ Recordatorios Inteligentes
- Generación automática de recordatorios según frecuencia
- Temporizadores de cuenta regresiva en tiempo real
- Marcar como tomado u omitir
- Historial y seguimiento de estado

### 🔔 Notificaciones Push
- Integración con Web Push API
- Entrega de notificaciones en segundo plano
- Acciones interactivas en notificaciones
- Confirmación de recordatorio desde notificación

### 📊 Seguimiento de Adherencia
- Gráficos visuales de adherencia
- Estadísticas semanales/mensuales
- Seguimiento de medicamentos tomados, perdidos y omitidos
- Cálculo de tasa de adherencia

### 📸 Escaneo OCR de Recetas
- Subir imágenes de recetas médicas
- Extracción de texto con IA (Tesseract.js y Gemini)
- Auto-completado de detalles del medicamento
- Soporte para imágenes JPG, PNG

### 📱 PWA (Aplicación Web Progresiva)
- Arquitectura offline-first
- Service Worker con caché
- Instalable en móvil y escritorio
- Soporte de notificaciones push
- Tiempos de carga rápidos

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18+** con TypeScript
- **Vite** - Herramienta de build rápida
- **Tailwind CSS** - Estilos
- **React Router DOM** - Navegación
- **Axios** - Cliente HTTP
- **Recharts** - Visualización de datos
- **Lucide React** - Iconos
- **Tesseract.js** - Procesamiento OCR
- **Google Gemini API** - IA para OCR avanzado

### Backend
- **Node.js 18+** con Express
- **TypeScript** - Seguridad de tipos
- **PostgreSQL/MongoDB** - Base de datos
- **Prisma ORM** - Cliente de base de datos
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas
- **Multer** - Carga de archivos
- **node-cron** - Programación de tareas
- **web-push** - Notificaciones push
- **Tesseract.js** - OCR
- **Google Gemini API** - IA avanzada

---

## 📁 Estructura del Proyecto

```
MediReminder/Med/
├── client/                    # Frontend React
│   ├── public/
│   │   ├── manifest.json     # Manifiesto PWA
│   │   ├── service-worker.js # Service Worker
│   │   └── icons/           # Iconos de la app
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── auth/       # Login, Register
│   │   │   ├── dashboard/  # Dashboard, Stats
│   │   │   ├── medications/# Tarjetas, Formularios
│   │   │   ├── reminders/  # Recordatorios
│   │   │   └── scanner/    # Escáner OCR
│   │   ├── pages/          # Páginas de la app
│   │   ├── context/        # Context API
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── services/       # Servicios API
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilidades
│   └── vite.config.ts
│
├── server/                    # Backend Express
│   ├── prisma/
│   │   └── schema.prisma    # Esquema de base de datos
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   ├── routes/         # Rutas API
│   │   ├── middleware/     # Middleware
│   │   ├── services/       # Lógica de negocio
│   │   │   ├── ocr.service.ts      # OCR Tesseract
│   │   │   ├── gemini.service.ts   # OCR Gemini
│   │   │   └── notification.service.ts
│   │   ├── types/          # Tipos TypeScript
│   │   └── server.ts       # Punto de entrada
│   └── uploads/            # Archivos subidos
│
└── docs/                     # Documentación
    ├── README_ES.md         # Este archivo
    ├── INICIO_RAPIDO.md     # Guía de inicio
    └── GUIA_COMPLETA.md     # Documentación técnica
```

---

## 📚 Documentación Adicional

- **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** - Guía rápida de uso
- **[GUIA_COMPLETA.md](GUIA_COMPLETA.md)** - Documentación técnica detallada

---

## 🔧 Configuración Avanzada

### Variables de Entorno

**Backend (.env en /server):**
```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/medireminder"
# O para MongoDB:
# DATABASE_URL="mongodb://localhost:27017/medireminder"

# JWT
JWT_SECRET="tu-secreto-super-seguro-aqui"

# Gemini API (Opcional - para OCR avanzado)
GEMINI_API_KEY="tu-api-key-de-gemini"

# Puerto del servidor
PORT=5000

# Web Push (Opcional - para notificaciones)
VAPID_PUBLIC_KEY="tu-public-key"
VAPID_PRIVATE_KEY="tu-private-key"
VAPID_SUBJECT="mailto:tu-email@ejemplo.com"
```

**Frontend (.env en /client):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=tu-api-key-de-gemini
```

### Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la clave y agrégala a tus archivos .env

---

## 🧪 Testing

### Pruebas Manuales

1. **Crear Cuenta**
   - Ve a http://localhost:5173
   - Clic en "Crear Cuenta"
   - Completa el formulario
   - Verifica que puedes iniciar sesión

2. **Agregar Medicamento**
   - Clic en "Medicamentos" → "+ Agregar"
   - Completa el formulario
   - Verifica que aparece en la lista

3. **Probar OCR**
   - Clic en "Escanear Receta"
   - Sube una imagen de receta
   - Verifica que se extraen los datos

4. **Ver Recordatorios**
   - Clic en "Recordatorios"
   - Verifica la lista de próximos recordatorios
   - Prueba marcar como tomado/omitir

---

## 🚨 Solución de Problemas

### El backend no inicia
```bash
# Verifica que PostgreSQL/MongoDB esté corriendo
# Verifica las migraciones de Prisma
cd server
npx prisma migrate status
npx prisma generate
```

### El frontend no conecta con el backend
```bash
# Verifica que VITE_API_URL esté configurado
# Verifica que el backend esté en puerto 5000
curl http://localhost:5000/health
```

### Errores de TypeScript
```bash
# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install
```

### OCR no funciona
- Verifica que las imágenes sean JPG o PNG
- Verifica que GEMINI_API_KEY esté configurada
- Verifica los logs del servidor para errores

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la [Guía Completa](GUIA_COMPLETA.md)
2. Abre un issue en GitHub
3. Contacta al equipo de desarrollo

---

## 🎯 Roadmap

- [ ] Soporte multi-idioma (inglés, portugués)
- [ ] Integración con Apple Health / Google Fit
- [ ] Recordatorios por SMS
- [ ] Reportes en PDF
- [ ] Modo oscuro
- [ ] Compartir medicamentos con familiares

---

**¡Gracias por usar MediReminder!** 💊✨
