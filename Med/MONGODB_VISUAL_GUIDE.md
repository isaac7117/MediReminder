# 🎯 Guía Visual - MongoDB Atlas en 5 Pasos

## Paso 1: Crear Cuenta

**URL**: https://www.mongodb.com/cloud/atlas

1. Haz clic en "Sign Up"
2. Completa el formulario:
   - Email
   - Contraseña
   - Nombre
3. Verifica tu email
4. Completa el cuestionario de bienvenida

---

## Paso 2: Crear Proyecto y Cluster

```
Dashboard → Create Project
    ↓
Nombre: "medication-reminder-app"
    ↓
Create Project
    ↓
Build a Database
    ↓
Selecciona: FREE (M0 Sandbox)
    ↓
Región: us-east-1 (o tu preferida)
    ↓
Create Cluster
    ↓
⏳ Espera 2-3 minutos...
```

---

## Paso 3: Crear Usuario de Base de Datos

```
Security → Database Access
    ↓
Add Database User
    ↓
Fill in:
  Username: medapp
  Password: medapp123
  ↓
Built-in Role: Atlas Admin
    ↓
Add User
```

---

## Paso 4: Permitir tu IP

```
Security → Network Access
    ↓
Add IP Address
    ↓
Allow Access from Anywhere
  (O tu IP específica si lo prefieres)
    ↓
Confirm
```

---

## Paso 5: Obtener Cadena de Conexión

```
Clusters → Connect
    ↓
Selecciona: Drivers
    ↓
Idioma: Node.js
Versión: 5.0 or later
    ↓
Copia la conexión:
mongodb+srv://medapp:medapp123@cluster0.mongodb.net/medication_db?retryWrites=true&w=majority
```

---

## 📋 Ejemplo de Cadena de Conexión

**Formato General**:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

**Tu Ejemplo**:
```
mongodb+srv://medapp:medapp123@cluster0.mongodb.net/medication_db?retryWrites=true&w=majority
```

**Partes Importantes**:
- `medapp` = Tu usuario
- `medapp123` = Tu contraseña
- `cluster0` = Nombre de tu cluster
- `medication_db` = Nombre de la BD

---

## ✅ Verificar Conexión

Después de actualizar `.env`, ejecuta:

```bash
cd server
npx prisma db push
```

**Resultado esperado**:
```
✔ Generated Prisma Client
✔ Databases created and collec
tions syncced

Your database has been successfully initialized
```

---

## 🛠️ Actualizar .env

En `server/.env`, encuentra esta línea:
```
DATABASE_URL="mongodb+srv://username:password@cluster0.mongodb.net/medication_db?retryWrites=true&w=majority"
```

Y reemplázala con tu URL real de MongoDB Atlas que copiaste en el Paso 5.

---

## 🎯 Tu Primer Comando

Una vez actualizado `.env`:

```bash
# Navega a la carpeta del servidor
cd server

# Crea las colecciones en MongoDB
npx prisma db push

# Si ves esto, ¡está funcionando! ✅
# ✔ Databases created and collections synced
```

---

## 📊 Dashboard de MongoDB

Después de conectarte, podrás ver:

```
Collections:
  ├── users (Tus usuarios registrados)
  ├── medications (Medicamentos agregados)
  └── reminders (Recordatorios generados)

Documentos:
  └── Cada documento es un registro JSON
```

---

## 🔍 Inspeccionar Datos (Opcional)

Ver los datos en tiempo real:

```bash
cd server
npx prisma studio
```

Esto abre un navegador con interfaz visual para:
- Ver todos los registros
- Agregar datos
- Editar registros
- Eliminar registros

---

## ⚠️ Errores Comunes

### "Authentication failed"
**Solución**: 
- Verifica que el username es `medapp` (minúsculas)
- Verifica que la contraseña es `medapp123`
- Comprueba que NO hay espacios en blanco

### "Cluster not found"
**Solución**:
- Espera a que el cluster termine de crearse
- Recarga la página de MongoDB Atlas
- Reintenta en 2-3 minutos

### "IP not whitelisted"
**Solución**:
- Ve a Security → Network Access
- Verifica que tu IP está en la lista
- O selecciona "Allow Access from Anywhere"

### "DNS resolution error"
**Solución**:
- Verifica tu conexión a internet
- Comprueba que copiaste la URL completa
- Verifica que no hay caracteres duplicados

---

## ✨ ¿Qué Sigue?

Después de completar estos 5 pasos:

1. ✅ Base de datos lista
2. ✅ Servidor conectado
3. ✅ Aplicación funcionando
4. ✅ Usuarios pueden registrarse
5. ✅ Medicamentos guardados en la nube
6. ✅ Recordatorios funcionando

---

## 🚀 Iniciar la Aplicación

```bash
# Terminal 1 - Backend
cd server
node ./dist/server.js
# ✅ Server is running on port 5000

# Terminal 2 - Frontend
cd client
npm run dev
# ✅ Local:   http://localhost:5173/
```

Luego abre en el navegador:
```
http://localhost:5173
```

---

## 💡 Consejos

1. **Guarda tu contraseña** de MongoDB en lugar seguro
2. **No compartas** la URL de conexión públicamente
3. **Usa IP whitelist** para producción (no "Anywhere")
4. **Monitorea el almacenamiento** (512 MB en plan FREE)
5. **Haz backups** si tus datos son importantes

---

## 📞 Soporte

Si tienes problemas:

1. Revisa [MONGODB_SETUP.md](./MONGODB_SETUP.md)
2. Revisa [STATUS.md](./STATUS.md)
3. Revisa [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)
4. Visita [MongoDB Docs](https://docs.atlas.mongodb.com/)

---

**Tiempo estimado**: 5-10 minutos
**Dificultad**: Muy Fácil ⭐
**Resultado**: Base de datos lista para producción ✨
