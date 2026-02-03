# MongoDB Atlas Setup Guide

El proyecto ahora está configurado para usar **MongoDB Atlas** como base de datos. Sigue estos pasos para configurarlo:

## 1. Crear una Cuenta en MongoDB Atlas

1. Ve a [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita o inicia sesión
3. Crea una nueva organización si es necesario

## 2. Crear un Cluster

1. En el dashboard de MongoDB Atlas, haz clic en "Create Project"
2. Nombra tu proyecto (ej: "medication-reminder-app")
3. Haz clic en "Create Project"
4. Selecciona "Build a Database"
5. Elige el plan **FREE** (M0 Sandbox)
6. Selecciona tu región preferida (ej: us-east-1)
7. Haz clic en "Create Cluster" y espera a que se cree (2-3 minutos)

## 3. Crear Usuario de Base de Datos

1. En la sección de "Security", ve a "Database Access"
2. Haz clic en "Add Database User"
3. Elige "Password" como método de autenticación
4. Username: `medapp`
5. Password: `medapp123` (o tu contraseña preferida)
6. Selecciona "Built-in Role" → "Atlas admin" (para desarrollo) o "Custom Role" (para producción)
7. Haz clic en "Add User"

## 4. Permitir Acceso desde tu IP

1. En "Security", ve a "Network Access"
2. Haz clic en "Add IP Address"
3. Elige **"Allow Access from Anywhere"** (para desarrollo)
   - O añade tu IP específica (recomendado para producción)
4. Haz clic en "Confirm"

## 5. Obtener la Cadena de Conexión

1. Ve al dashboard principal del cluster
2. Haz clic en "Connect"
3. Selecciona "Drivers"
4. Elige "Node.js" y versión "5.0 or later"
5. Copia la cadena de conexión (debe verse similar a):
```
mongodb+srv://medapp:medapp123@cluster0.mongodb.net/medication_db?retryWrites=true&w=majority
```

## 6. Actualizar el Archivo `.env`

En `server/.env`, reemplaza:
```
DATABASE_URL="mongodb+srv://medapp:medapp123@cluster0.mongodb.net/medication_db?retryWrites=true&w=majority"
```

Con tu URL real de MongoDB Atlas:
```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority"
```

## 7. Verificar la Conexión

Ejecuta en la carpeta `server`:
```bash
npx prisma db push
```

Esto debería crear las colecciones en MongoDB Atlas.

## 8. Iniciar el Servidor

```bash
npm run dev
```

## Solución de Problemas

### Error: "connect ECONNREFUSED"
- Verifica que permitiste acceso desde tu IP
- Comprueba que el username y password son correctos

### Error: "MongoNetworkError"
- Verifica tu conexión a internet
- Comprueba que el cluster está activo en MongoDB Atlas
- Espera algunos segundos y reintenta

### Error: "Authentication failed"
- Verifica que incluyes el signo `@` y `:` correctamente en la URL
- Comprueba que el username y password son exactos (sensible a mayúsculas)
- Verifica que el usuario esté activo en "Database Access"

## Notas

- El plan FREE de MongoDB Atlas es perfecto para desarrollo
- Tienes límites de:
  - 512 MB de almacenamiento
  - Conexiones compartidas
  - Sin soporte de acceso fuera de su región

- Para producción, considera actualizar a un plan pagado

## Documentación

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Prisma MongoDB Guide](https://www.prisma.io/docs/orm/overview/databases/mongodb)
