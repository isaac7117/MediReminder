# 📚 Stack Tecnológico - MediReminder

## Descripción General

**MediReminder** es una aplicación fullstack para gestionar recordatorios de medicamentos con capacidad de escaneo de recetas mediante OCR. Utiliza tecnologías modernas para garantizar rendimiento, seguridad y escalabilidad.

---

## 🖥️ FRONTEND (Cliente)

### **React + TypeScript**
- **Versión:** 18+
- **Propósito:** Framework de interfaz de usuario para construir componentes reutilizables
- **Beneficios:** 
  - Virtual DOM para actualizaciones eficientes
  - Componentes reactivos que se actualizan automáticamente
  - Fuerte tipado con TypeScript para evitar errores en tiempo de desarrollo

### **Vite**
- **Versión:** 5.4+
- **Propósito:** Empaquetador y servidor de desarrollo ultrarrápido
- **Beneficios:**
  - Tiempo de inicio instantáneo del servidor de desarrollo
  - Recarga en caliente (HMR) sin actualizar página
  - Bundling optimizado para producción
  - Mucho más rápido que Webpack

### **React Router**
- **Versión:** 6+
- **Propósito:** Enrutamiento de página única (SPA) 
- **Beneficios:**
  - Navegación sin recargas de página
  - URLs amigables y compartibles
  - Componentes de ruta para gestionar diferentes vistas

### **Tailwind CSS**
- **Versión:** 3+
- **Propósito:** Framework CSS de utilidades para estilos
- **Beneficios:**
  - Desarrollo rápido con clases predefinidas
  - Diseño responsive automático
  - Archivos CSS más pequeños (solo incluye lo que se usa)
  - Temas personalizables

### **PostCSS**
- **Propósito:** Herramienta para procesar CSS
- **Beneficios:**
  - Integración con Tailwind CSS
  - Optimizaciones automáticas de CSS

### **Tesseract.js**
- **Propósito:** Reconocimiento óptico de caracteres (OCR) en el navegador
- **Beneficios:**
  - Procesa imágenes sin enviar al servidor (privacidad)
  - Extrae texto de fotos de recetas
  - Basado en el motor OCR de código abierto Tesseract

### **Lucide Icons**
- **Propósito:** Librería de iconos SVG modernos
- **Beneficios:**
  - Iconos escalables y personalizables
  - Interfaz visual consistente
  - Accesibilidad mejorada

### **Axios**
- **Propósito:** Cliente HTTP para comunicarse con el servidor
- **Beneficios:**
  - Interceptores para agregar tokens de autenticación
  - Manejo automático de timeouts
  - Serialización de datos JSON

### **Context API + Hooks**
- **Propósito:** Gestión de estado global sin librerías externas
- **Componentes principales:**
  - `AuthContext`: Autenticación y sesión del usuario
  - `NotificationContext`: Sistema de notificaciones emergentes
- **Beneficios:**
  - Evita "prop drilling"
  - Compartir datos entre componentes distantes
  - Integrado en React (sin dependencias adicionales)

---

## 🔧 BACKEND (Servidor)

### **Node.js**
- **Versión:** 18+ (LTS)
- **Propósito:** Runtime de JavaScript para servidor
- **Beneficios:**
  - Rendimiento de alta concurrencia
  - Ecosistema NPM masivo
  - Mismo lenguaje en cliente y servidor (JavaScript/TypeScript)

### **Express.js**
- **Versión:** 4.18+
- **Propósito:** Framework web minimalista para APIs REST
- **Beneficios:**
  - Ligero y flexible
  - Middleware para manejo de peticiones
  - Amplia comunidad y recursos

### **TypeScript**
- **Versión:** 5+
- **Propósito:** Lenguaje tipado sobre JavaScript
- **Beneficios:**
  - Detección de errores en tiempo de compilación
  - Mejor autocompletado en IDEs
  - Documentación automática del código

### **Prisma ORM**
- **Versión:** 5+
- **Propósito:** Mapeo objeto-relacional (ORM) para base de datos
- **Beneficios:**
  - Esquema de base de datos definido en un archivo legible
  - Generación automática de migraciones
  - Cliente tipado para consultas seguras
  - Soporte para múltiples bases de datos

### **PostgreSQL**
- **Versión:** 15+
- **Propósito:** Base de datos relacional
- **Beneficios:**
  - Confiable y robusto
  - Soporte de transacciones ACID
  - Escalable a grandes volúmenes de datos
  - Código abierto y gratuito

### **Multer**
- **Propósito:** Middleware para manejo de carga de archivos
- **Beneficios:**
  - Procesa formatos multipart/form-data
  - Guarda archivos en disco servidor
  - Validación de tipo de archivo y tamaño

### **Tesseract.js (Node)**
- **Propósito:** OCR en el servidor para recetas
- **Beneficios:**
  - Extrae texto de imágenes de prescripciones
  - Engine entrenado para medicina
  - Procesamiento en servidor (backup)

### **JWT (JSON Web Tokens)**
- **Propósito:** Autenticación sin estado
- **Beneficios:**
  - No requiere sesiones en servidor
  - Tokens portables y seguros
  - Escalable para múltiples servidores

---

## 🗄️ BASE DE DATOS

### **Prisma Schema**
```
Modelos principales:
- User: Cuenta de usuario con email/contraseña
- Medication: Medicamentos agregados por usuario
- Reminder: Recordatorios diarios/semanales/mensuales
- PrescriptionScan: Historial de recetas escaneadas
```

---

## 🐳 DEPLOYMENT

### **Docker**
- **Propósito:** Containerización de la aplicación
- **Archivos:**
  - `docker-compose.yml`: Orquesta múltiples contenedores
  - PostgreSQL corriendo en contenedor

### **Docker Compose**
- **Propósito:** Gestionar múltiples servicios
- **Servicios:**
  - PostgreSQL (base de datos)
  - Backend Node.js
  - Frontend (opcional)

---

## 📊 FLUJO DE DATOS

```
[Usuario navega en navegador]
        ↓
[Frontend React (Vite)]
        ↓
[Axios → API REST Express]
        ↓
[Servidor Node.js + Prisma]
        ↓
[PostgreSQL Database]
        ↓
[Respuesta JSON]
        ↓
[React actualiza UI con Context]
```

### Flujo OCR:
```
[Usuario sube imagen de receta]
        ↓
[Frontend: Tesseract.js procesa]  O  [Backend: Tesseract procesa]
        ↓
[Extrae: nombre, dosis, frecuencia, instrucciones]
        ↓
[Completa formulario automáticamente]
        ↓
[Usuario revisa y confirma]
        ↓
[Se guarda en base de datos]
        ↓
[Se puede crear recordatorio]
```

---

## 🔐 SEGURIDAD

- **JWT**: Autenticación basada en tokens
- **Password Hashing**: Contraseñas hasheadas en BD
- **CORS**: Control de acceso entre dominios
- **Multer**: Validación de archivos subidos
- **SQL Injection Prevention**: Prisma usa prepared statements

---

## 📈 PERFORMANCE

- **Vite**: Bundling rápido en desarrollo
- **Code Splitting**: Carga de componentes bajo demanda
- **Lazy Loading**: Carga de rutas bajo demanda
- **Tailwind Purge**: CSS minificado solo con clases usadas
- **Connection Pooling**: PostgreSQL reutiliza conexiones
- **Caching**: Context API para evitar re-renders innecesarios

---

## 🛠️ HERRAMIENTAS DE DESARROLLO

- **npm**: Gestor de paquetes
- **VSCode**: Editor de código
- **Prettier**: Formateador de código
- **ESLint**: Linter para JavaScript/TypeScript
- **Git**: Control de versiones

---

## 📦 INSTALACIÓN Y USO

### Frontend
```bash
cd client
npm install
npm run dev      # Desarrollo
npm run build    # Producción
npm run preview  # Vista previa de build
```

### Backend
```bash
cd server
npm install
npm run dev      # Desarrollo
npm run build    # Compilar TypeScript
npm start        # Producción
```

### Docker
```bash
docker-compose up    # Levantar todos los servicios
docker-compose down  # Detener servicios
```

---

## ✅ VENTAJAS DEL STACK

1. **Full-Stack JavaScript**: Mismo lenguaje en cliente y servidor
2. **Type Safety**: TypeScript en ambos lados
3. **Modern & Updated**: Todas las librerías están activas
4. **Scalable**: Arquitectura preparada para crecer
5. **Developer Friendly**: Excelente experiencia de desarrollo
6. **Production Ready**: Utilizado por empresas Fortune 500
7. **OCR Integrado**: Reconocimiento de recetas médicas
8. **Responsive Design**: Funciona en móvil, tablet y desktop

---

**Última actualización:** Enero 2026
**Estado del Proyecto:** ✅ Completamente funcional
