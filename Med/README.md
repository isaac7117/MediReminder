# 📱 MediReminder

Sistema inteligente de gestión de medicamentos con recordatorios, notificaciones push y escaneo OCR de recetas médicas.

---

## 🚀 Inicio Rápido

¿Primera vez? Lee la **[Guía de Inicio Rápido](INICIO_RAPIDO.md)** para comenzar en 5 minutos.

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev

# Abre: http://localhost:5173
```

---

## 📚 Documentación

- **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** - Comienza aquí. Instalación y primeros pasos.
- **[README_ES.md](README_ES.md)** - Documentación completa del proyecto.
- **[GUIA_COMPLETA.md](GUIA_COMPLETA.md)** - Guía técnica detallada (API, arquitectura, despliegue).

---

## ✨ Características Principales

- 🔐 **Autenticación segura** con JWT
- 💊 **Gestión de medicamentos** (crear, editar, eliminar)
- ⏰ **Recordatorios inteligentes** automáticos
- 🔔 **Notificaciones push** en tiempo real
- 📸 **Escaneo OCR** de recetas médicas (Tesseract + Gemini AI)
- 📊 **Seguimiento de adherencia** con gráficos
- 📱 **PWA** - Instalable como app móvil

---

## 🛠️ Tecnologías

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS  
**Backend:** Node.js + Express + TypeScript + Prisma  
**Base de Datos:** PostgreSQL / MongoDB  
**OCR:** Tesseract.js + Google Gemini AI  
**PWA:** Service Worker + Web Push

---

## 📦 Instalación Rápida

```bash
# 1. Backend
cd server
npm install
cp .env.example .env  # Configura tus variables
npx prisma migrate dev
npm run dev

# 2. Frontend
cd ../client
npm install
npm run dev
```

**Requisitos:** Node.js 18+, PostgreSQL/MongoDB

---

## 🎯 Uso Básico

1. **Crear cuenta** - Registro con email y contraseña
2. **Agregar medicamento** - Nombre, dosis, frecuencia, horarios
3. **Ver recordatorios** - Panel con próximos medicamentos
4. **Marcar como tomado** - Seguimiento de adherencia
5. **Escanear receta** - OCR automático de prescripciones

---

## 🔧 Configuración

### Backend (.env)
```env
DATABASE_URL="postgresql://localhost:5432/medireminder"
JWT_SECRET="tu-secreto-seguro"
GEMINI_API_KEY="opcional-para-ocr-mejorado"
PORT=5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=opcional
```

---

## 🧪 Testing

```bash
# Crear cuenta de prueba
Email: test@ejemplo.com
Contraseña: Test1234

# Agregar medicamento de prueba
Nombre: Ibuprofeno
Dosis: 500mg
Frecuencia: Diario, 2 veces (09:00, 21:00)
```

---

## 📖 Estructura del Proyecto

```
Med/
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/      # Páginas
│   │   ├── services/   # API calls
│   │   └── hooks/      # Custom hooks
│   └── public/         # PWA assets
│
├── server/             # Backend Express
│   ├── src/
│   │   ├── controllers/ # Lógica de rutas
│   │   ├── services/   # OCR, Auth, etc.
│   │   ├── routes/     # API endpoints
│   │   └── middleware/ # Auth, validación
│   └── prisma/         # Schema DB
│
├── README.md           # Este archivo
├── README_ES.md        # Documentación completa
├── INICIO_RAPIDO.md    # Guía inicio rápido
└── GUIA_COMPLETA.md    # Documentación técnica
```

---

## 🚨 Problemas Comunes

### Error: Puerto en uso
```powershell
netstat -ano | findstr :5000
taskkill /PID <pid> /F
```

### Error: Base de datos no conecta
```bash
cd server
npx prisma migrate reset
npx prisma migrate dev
```

### OCR no funciona
- Verifica GEMINI_API_KEY en .env
- Usa imágenes JPG/PNG de buena calidad
- Revisa logs del servidor

---

## 🚀 Despliegue

**Frontend:** Vercel, Netlify  
**Backend:** Railway, Render, Heroku  
**Base de Datos:** Railway (PostgreSQL), MongoDB Atlas

Ver [GUIA_COMPLETA.md](GUIA_COMPLETA.md) para instrucciones detalladas.

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre Pull Request

---

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

## 📞 Soporte

- **Documentación:** Ver archivos .md en este directorio
- **Issues:** Abre un issue en GitHub
- **Email:** Contacta al equipo de desarrollo

---

## 🎯 Roadmap

- [ ] Soporte multi-idioma completo
- [ ] Integración con Apple Health / Google Fit
- [ ] Exportar reportes PDF
- [ ] Recordatorios por SMS
- [ ] App móvil nativa (React Native)
- [ ] Modo oscuro
- [ ] Compartir con familiares

---

**Estado:** ✅ Operativo 100%  
**Versión:** 2.0  
**Última actualización:** Febrero 2026

---

**¡Gracias por usar MediReminder!** 💊✨

[Comenzar ahora →](INICIO_RAPIDO.md)
