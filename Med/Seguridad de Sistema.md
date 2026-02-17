# 🔒 Análisis de Seguridad del Sistema — MediReminder

**Fecha del análisis:** 9 de febrero de 2026  
**Versión:** 1.0  
**Clasificación de datos:** Datos sensibles de salud (información médica personal)

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Clasificación de Datos Sensibles](#clasificación-de-datos-sensibles)
3. [Seguridad Implementada Actualmente](#seguridad-implementada-actualmente)
4. [Vulnerabilidades Detectadas y Corregidas](#vulnerabilidades-detectadas-y-corregidas)
5. [Recomendaciones de Seguridad Adicionales](#recomendaciones-de-seguridad-adicionales)
6. [Plan de Implementación por Prioridad](#plan-de-implementación-por-prioridad)
7. [Cumplimiento Normativo](#cumplimiento-normativo)

---

## 1. Resumen Ejecutivo

MediReminder es un sistema que gestiona **datos médicos personales** altamente sensibles, incluyendo medicamentos, dosis, horarios de tratamiento, recetas médicas escaneadas e información personal del usuario. Este tipo de datos está protegido por regulaciones como **HIPAA** (EE.UU.), **GDPR** (Europa) y **LFPDPPP** (México).

El sistema actualmente implementa medidas de seguridad fundamentales pero requiere mejoras significativas para proteger adecuadamente los datos sensibles de salud que maneja.

---

## 2. Clasificación de Datos Sensibles

| Dato | Nivel de Sensibilidad | Regulación Aplicable |
|------|----------------------|---------------------|
| Nombre de medicamentos | 🔴 Alto | HIPAA, GDPR |
| Dosis y frecuencias | 🔴 Alto | HIPAA, GDPR |
| Historial de adherencia | 🔴 Alto | HIPAA, GDPR |
| Recetas médicas (imágenes OCR) | 🔴 Muy Alto | HIPAA, GDPR |
| Email del usuario | 🟡 Medio | GDPR, LFPDPPP |
| Nombre completo | 🟡 Medio | GDPR, LFPDPPP |
| Fecha de nacimiento | 🟡 Medio | GDPR |
| Número de teléfono | 🟡 Medio | GDPR, LFPDPPP |
| Contraseña (hash) | 🔴 Alto | Todas |
| Tokens JWT | 🔴 Alto | Seguridad general |
| Suscripciones push | 🟢 Bajo | Seguridad general |

---

## 3. Seguridad Implementada Actualmente

### ✅ Autenticación y Autorización

| Medida | Estado | Detalle |
|--------|--------|---------|
| Hashing de contraseñas con bcrypt | ✅ Implementado | 10 salt rounds (`hash.utils.ts`) |
| Tokens JWT para sesiones | ✅ Implementado | Expiración configurable (7 días por defecto) |
| Middleware de autenticación | ✅ Implementado | `auth.middleware.ts` valida tokens en cada request protegido |
| Rutas protegidas en frontend | ✅ Implementado | `ProtectedRoute` verifica autenticación antes de renderizar |
| Auto-logout en token expirado | ✅ Implementado | Interceptor de API redirige al login en 401 |

### ✅ Validación de Datos

| Medida | Estado | Detalle |
|--------|--------|---------|
| Validación de email (formato) | ✅ Implementado | Regex en `validators.utils.ts` |
| Validación de contraseña (complejidad) | ✅ Implementado | Mín. 8 caracteres, mayúscula, minúscula, número |
| Middleware de validación de campos | ✅ Implementado | `validation.middleware.ts` valida campos requeridos y tipos |
| Validación de estados de recordatorios | ✅ Implementado | Previene re-tomar o re-omitir recordatorios |
| Validación de parámetros numéricos | ✅ Implementado | Guards contra NaN en parámetros de query |

### ✅ Comunicaciones

| Medida | Estado | Detalle |
|--------|--------|---------|
| CORS configurado | ✅ Implementado | Solo permite `http://localhost:5173` |
| Push notifications con VAPID | ✅ Implementado | Claves VAPID para Web Push |
| Proxy de Vite para desarrollo | ✅ Implementado | Evita exponer el backend directamente |

### ✅ Protección de Datos en Respuestas

| Medida | Estado | Detalle |
|--------|--------|---------|
| Contraseña excluida de respuestas | ✅ Implementado | `select` de Prisma omite campo `password` |
| Mensajes de error genéricos en login | ✅ Implementado | "Credenciales inválidas" (sin diferenciar email/password) |
| Ocultación de stack traces en producción | ✅ Implementado | Solo se envían en `NODE_ENV=development` |
| Mensajes de error genéricos en producción | ✅ Implementado | Errores 500 devuelven mensaje genérico |

### ✅ Propiedad de Recursos

| Medida | Estado | Detalle |
|--------|--------|---------|
| Filtrado por userId en medicamentos | ✅ Implementado | Usuarios solo acceden a sus propios datos |
| Filtrado por userId en recordatorios | ✅ Implementado | Validación de propiedad en operaciones CRUD |
| Cascade delete | ✅ Implementado | Al eliminar usuario, se eliminan todos sus datos |

---

## 4. Vulnerabilidades Detectadas y Corregidas

### Corregidas en esta auditoría:

| # | Vulnerabilidad | Severidad | Estado |
|---|---------------|-----------|--------|
| 1 | **Enumeración de usuarios** en login (mensajes diferenciados) | 🔴 Alta | ✅ Corregida |
| 2 | **Fuga de PrismaClient** — nuevas instancias por cada llamada al scheduler | 🔴 Alta | ✅ Corregida |
| 3 | **Loop infinito** en scheduler para frecuencia hourly/custom | 🔴 Crítica | ✅ Corregida |
| 4 | **localStorage en Service Worker** — API no disponible en contexto de SW | 🔴 Alta | ✅ Corregida |
| 5 | **Service Worker desregistrado** — deshabilitaba todas las notificaciones push | 🟡 Media | ✅ Corregida |
| 6 | **401 en dashboard sin sesión** — hooks hacían API calls sin verificar token | 🟡 Media | ✅ Corregida |
| 7 | **Errores internos expuestos** en producción (mensajes de error raw) | 🟡 Media | ✅ Corregida |
| 8 | **Actualización con valores falsy** ignoraba valores válidos como 0 o "" | 🟡 Media | ✅ Corregida |
| 9 | **Crash en ReminderCard** cuando `takenAt` es undefined | 🟡 Media | ✅ Corregida |
| 10 | **Parámetros NaN** — queries con valores no numéricos causaban errores silenciosos | 🟡 Media | ✅ Corregida |
| 11 | **Re-tomar/re-omitir** recordatorios sin validación de estado | 🟡 Media | ✅ Corregida |
| 12 | **Email no normalizado** — emails con mayúsculas creaban duplicados | 🟡 Media | ✅ Corregida |

---

## 5. Recomendaciones de Seguridad Adicionales

### 🔴 Prioridad CRÍTICA

#### 5.1. Cifrado de Datos en Reposo (Encryption at Rest)
**Estado:** ❌ No implementado

Los datos médicos sensibles (nombres de medicamentos, dosis, instrucciones, recetas escaneadas) se almacenan en **texto plano** en MongoDB. Si la base de datos es comprometida, todos los datos quedan expuestos.

**Implementación recomendada:**
```
- Cifrado a nivel de campo con AES-256-GCM para: nombre de medicamento, dosis, instrucciones
- MongoDB Atlas ya ofrece cifrado de disco (TDE) — verificar que esté habilitado
- Cifrado de imágenes de recetas antes de almacenarlas
- Gestión de claves con un servicio como AWS KMS o HashiCorp Vault
```

#### 5.2. HTTPS Obligatorio
**Estado:** ❌ No implementado (solo HTTP en desarrollo)

Toda la comunicación (tokens JWT, datos médicos, credenciales) viaja en texto plano por HTTP.

**Implementación recomendada:**
```
- Certificado TLS/SSL (Let's Encrypt gratuito)
- Forzar HTTPS con redirect 301
- HSTS headers (Strict-Transport-Security)
- Cookies con flag Secure
```

#### 5.3. Rate Limiting y Protección contra Fuerza Bruta
**Estado:** ❌ No implementado

No existe limitación de intentos de login, lo que permite ataques de fuerza bruta ilimitados.

**Implementación recomendada:**
```
- express-rate-limit: Máximo 5 intentos de login por minuto por IP
- express-rate-limit: Máximo 100 requests por minuto por IP (general)
- Bloqueo temporal de cuenta después de 10 intentos fallidos
- Implementar CAPTCHA después de 3 intentos fallidos
- Logging de intentos fallidos para detección de ataques
```

#### 5.4. Refresh Tokens
**Estado:** ❌ No implementado

Los JWT tienen expiración de 7 días y se almacenan en `localStorage`, lo que es vulnerable a **XSS**.

**Implementación recomendada:**
```
- Access Token de corta vida (15 minutos) en memoria
- Refresh Token de larga vida (7 días) en cookie HttpOnly, Secure, SameSite=Strict
- Endpoint /api/auth/refresh para renovar tokens
- Lista negra de tokens revocados (Redis)
- Rotación de Refresh Tokens en cada uso
```

---

### 🟡 Prioridad ALTA

#### 5.5. Headers de Seguridad HTTP
**Estado:** ❌ No implementado

Faltan headers críticos de seguridad que protegen contra múltiples vectores de ataque.

**Implementación recomendada (usar `helmet` npm):**
```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' }
}));
```

#### 5.6. Sanitización de Inputs
**Estado:** ❌ No implementado

Los inputs de usuario no se sanitizan contra XSS o inyección NoSQL.

**Implementación recomendada:**
```
- express-mongo-sanitize: Previene inyección de operadores MongoDB ($gt, $ne, etc.)
- xss-clean o DOMPurify: Sanitiza HTML en inputs de texto
- Validar y sanitizar nombres de medicamentos, instrucciones, notas
- Escape de caracteres especiales en salidas
```

#### 5.7. Auditoría y Logging de Seguridad
**Estado:** ❌ No implementado

No existe registro de eventos de seguridad para detectar actividades sospechosas.

**Implementación recomendada:**
```
- Log de intentos de login (exitosos y fallidos) con IP y timestamp
- Log de cambios en datos médicos (quién, qué, cuándo)
- Log de accesos a recetas médicas escaneadas
- Log de cambios de contraseña y perfil
- Integrar con servicio de monitoreo (Sentry, DataDog, etc.)
- Retención de logs mínima de 1 año (requisito HIPAA)
```

#### 5.8. Validación de Archivos Subidos (OCR)
**Estado:** ⚠️ Parcialmente implementado

El middleware de upload valida MIME type, pero este puede ser falsificado.

**Implementación recomendada:**
```
- Validar magic bytes del archivo (no solo MIME type del header)
- Escaneo antivirus/malware de archivos subidos
- Limitar tamaño máximo de archivo (ya implementado: 10MB)
- Almacenar archivos fuera del directorio web público
- Generar nombres de archivo aleatorios (ya implementado)
- No servir archivos directamente — usar un endpoint autenticado
```

#### 5.9. Gestión Segura de Secretos
**Estado:** ⚠️ Riesgo actual

Las claves API (Gemini, OpenAI), VAPID keys y JWT secret están en archivo `.env` sin rotación.

**Implementación recomendada:**
```
- Usar un gestor de secretos (AWS Secrets Manager, Azure Key Vault, Doppler)
- Rotar JWT_SECRET periódicamente
- Rotar API keys de servicios externos trimestralmente  
- Nunca commitear .env al repositorio (verificar .gitignore)
- Usar secretos diferentes para desarrollo y producción
- JWT_SECRET debe ser una clave criptográficamente segura (mín. 256 bits)
```

---

### 🟢 Prioridad MEDIA

#### 5.10. Autenticación Multifactor (MFA/2FA)
**Estado:** ❌ No implementado

Dado que se manejan datos de salud, MFA debería ser obligatorio o fuertemente recomendado.

**Implementación recomendada:**
```
- TOTP (Time-based One-Time Password) con apps como Google Authenticator
- Códigos de respaldo para recuperación
- MFA obligatorio para acciones sensibles (cambio de contraseña, eliminación de datos)
- Opcionalmente: SMS como segundo factor (menos seguro pero más accesible)
```

#### 5.11. Política de Contraseñas Mejorada
**Estado:** ⚠️ Básica

La política actual (8 chars, mayúscula, minúscula, número) es el mínimo.

**Implementación recomendada:**
```
- Mínimo 12 caracteres para datos de salud
- Incluir al menos 1 carácter especial
- Verificar contra diccionarios de contraseñas comprometidas (Have I Been Pwned API)
- No permitir contraseñas que contengan el email o nombre del usuario
- Historial de contraseñas (no reutilizar las últimas 5)
- Expiración de contraseña cada 90 días (recomendación HIPAA)
```

#### 5.12. Control de Sesiones
**Estado:** ⚠️ Básico

No hay control sobre sesiones activas ni capacidad de revocar acceso.

**Implementación recomendada:**
```
- Panel de sesiones activas (dispositivo, IP, última actividad)
- Capacidad de cerrar sesión en todos los dispositivos
- Detección de sesiones concurrentes sospechosas
- Timeout de inactividad (30 minutos para datos de salud)
- Invalidación de tokens al cambiar contraseña
```

#### 5.13. Backup y Recuperación de Datos
**Estado:** ❌ No implementado (depende de MongoDB Atlas)

**Implementación recomendada:**
```
- Backups automáticos diarios cifrados
- Pruebas de restauración mensuales
- Retención mínima de 30 días
- Backup en región geográfica diferente
- Exportación de datos del usuario (derecho GDPR)
```

#### 5.14. Protección contra CSRF
**Estado:** ⚠️ Parcialmente mitigado

El uso de tokens JWT en header `Authorization` mitiga CSRF parcialmente, pero si se migra a cookies necesitará protección explícita.

**Implementación recomendada:**
```
- Token CSRF sincronizado si se usan cookies
- SameSite=Strict en cookies de sesión
- Validar header Origin/Referer en requests mutantes
```

#### 5.15. Aislamiento de Datos por Usuario (Multi-tenancy)
**Estado:** ✅ Implementado a nivel de aplicación

Actualmente los filtros de `userId` se aplican en cada query, pero un bug podría filtrar datos.

**Mejora recomendada:**
```
- Implementar Row Level Security (RLS) a nivel de base de datos
- Prisma middleware que inyecte automáticamente el filtro userId
- Tests automatizados que verifiquen aislamiento de datos
```

---

## 6. Plan de Implementación por Prioridad

### Fase 1 — Inmediata (1-2 semanas)
| # | Medida | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 1 | Rate Limiting (`express-rate-limit`) | Bajo | 🔴 Crítico |
| 2 | HTTPS con certificado TLS | Bajo | 🔴 Crítico |
| 3 | Headers de seguridad (`helmet`) | Bajo | 🟡 Alto |
| 4 | Sanitización de inputs (`express-mongo-sanitize`) | Bajo | 🟡 Alto |
| 5 | Verificar cifrado en MongoDB Atlas | Bajo | 🔴 Crítico |

### Fase 2 — Corto plazo (2-4 semanas)
| # | Medida | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 6 | Refresh Tokens + HttpOnly cookies | Medio | 🔴 Crítico |
| 7 | Logging de seguridad y auditoría | Medio | 🟡 Alto |
| 8 | Validación real de archivos (magic bytes) | Bajo | 🟡 Alto |
| 9 | Gestor de secretos | Medio | 🟡 Alto |
| 10 | Cifrado de campos sensibles (AES-256) | Alto | 🔴 Crítico |

### Fase 3 — Mediano plazo (1-2 meses)
| # | Medida | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 11 | Autenticación multifactor (2FA/TOTP) | Alto | 🟡 Alto |
| 12 | Política de contraseñas mejorada | Medio | 🟢 Medio |
| 13 | Control avanzado de sesiones | Medio | 🟢 Medio |
| 14 | Timeout de inactividad | Bajo | 🟢 Medio |
| 15 | Backups cifrados automatizados | Medio | 🟢 Medio |

### Fase 4 — Largo plazo (3+ meses)
| # | Medida | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 16 | Penetration testing profesional | Alto | 🔴 Crítico |
| 17 | Cumplimiento formal HIPAA/GDPR | Alto | 🔴 Crítico |
| 18 | SOC 2 Type II | Muy Alto | 🟡 Alto |
| 19 | Bug bounty program | Medio | 🟢 Medio |

---

## 7. Cumplimiento Normativo

### HIPAA (Health Insurance Portability and Accountability Act)
Si la aplicación se usa en EE.UU. con datos de salud:

| Requisito HIPAA | Estado |
|-----------------|--------|
| Cifrado de datos en tránsito (TLS) | ⚠️ Solo en desarrollo sin HTTPS |
| Cifrado de datos en reposo | ❌ No implementado a nivel de campo |
| Control de acceso basado en roles | ⚠️ Solo un tipo de usuario |
| Registro de auditoría | ❌ No implementado |
| Backup y recuperación | ⚠️ Depende de MongoDB Atlas |
| Evaluación de riesgos documentada | ✅ Este documento |
| Acuerdos BAA con terceros | ❌ No documentado (MongoDB Atlas, Google, OpenAI) |

### GDPR (General Data Protection Regulation)
Si usuarios en la Unión Europea:

| Requisito GDPR | Estado |
|----------------|--------|
| Consentimiento explícito | ⚠️ No hay checkbox de consentimiento |
| Derecho al olvido | ❌ No hay función de eliminar cuenta |
| Portabilidad de datos | ❌ No hay exportación de datos |
| Minimización de datos | ✅ Solo se recopilan datos necesarios |
| Privacidad por diseño | ⚠️ Parcial |
| Notificación de brechas | ❌ No hay proceso definido |
| DPO (Data Protection Officer) | ❌ No designado |

---

## 📊 Puntuación de Seguridad Actual

| Categoría | Puntuación | Meta |
|-----------|-----------|------|
| Autenticación | 6/10 | 9/10 |
| Autorización | 7/10 | 9/10 |
| Cifrado | 3/10 | 9/10 |
| Validación de datos | 6/10 | 9/10 |
| Logging y auditoría | 2/10 | 8/10 |
| Protección de red | 4/10 | 9/10 |
| Gestión de secretos | 4/10 | 8/10 |
| Cumplimiento normativo | 2/10 | 8/10 |
| **TOTAL** | **34/80 (42%)** | **69/80 (86%)** |

---

## 🏁 Conclusión

MediReminder maneja **datos médicos personales altamente sensibles** que requieren un nivel de protección superior al de una aplicación web estándar. La aplicación cuenta con una base de seguridad funcional (autenticación JWT, hashing bcrypt, validación de inputs, aislamiento de datos por usuario), pero necesita mejoras significativas en:

1. **Cifrado** — Los datos médicos deben estar cifrados tanto en tránsito (HTTPS) como en reposo (AES-256)
2. **Protección contra ataques** — Rate limiting, headers de seguridad, sanitización
3. **Auditoría** — Logging completo de accesos y cambios a datos de salud
4. **Gestión de sesiones** — Refresh tokens, timeouts, MFA
5. **Cumplimiento normativo** — Procesos documentados para HIPAA/GDPR

La implementación de las medidas de **Fase 1** es urgente y de bajo esfuerzo, proporcionando una mejora inmediata significativa en la postura de seguridad del sistema.

---

*Documento generado como parte de la auditoría de seguridad del sistema MediReminder.*
