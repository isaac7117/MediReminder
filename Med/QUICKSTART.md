# Quick Start Guide - MediReminder

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### Step 2: Setup Database (MongoDB Atlas)

**Create Free MongoDB Atlas Cluster:**
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (select FREE M0)
4. Create a database user:
   - Username: `medapp`
   - Password: `medapp123`
5. Allow access from anywhere (for development)
6. Get connection string from "Connect" → "Drivers"

**Create .env file in server folder:**
```bash
cd server
cp .env.example .env
```

**Update DATABASE_URL in server/.env:**
```
DATABASE_URL="mongodb+srv://medapp:medapp123@cluster0.mongodb.net/medication_db?retryWrites=true&w=majority"
```

Replace with your actual MongoDB Atlas connection string.

### Step 3: Initialize Database Schema

```bash
cd server

# Push schema to MongoDB
npx prisma db push
```

### Step 4: Configure Environment

**Server** (server/.env):
```
DATABASE_URL="postgresql://medapp:medapp123@localhost:5432/medication_db"
JWT_SECRET="your_secret_key_here"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
VAPID_PUBLIC_KEY="YOUR_VAPID_PUBLIC_KEY"
VAPID_PRIVATE_KEY="YOUR_VAPID_PRIVATE_KEY"
CORS_ORIGIN=http://localhost:5173
```

**Client** (client/.env):
```
VITE_API_URL=http://localhost:5000/api
VITE_VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY
```

### Step 5: Start Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# App running on http://localhost:5173
```

### Step 6: Access the Application

Open browser: http://localhost:5173

## 📱 First Steps

1. **Register Account**
   - Click "Create Account" on landing page
   - Fill in email, password, full name
   - Password must have uppercase, lowercase, and numbers

2. **Add Your First Medication**
   - Click "Add Medication" button
   - Or use "Scan Prescription" for OCR

3. **Enable Push Notifications**
   - Click notification bell icon
   - Grant browser permission
   - Device will receive reminders at scheduled times

4. **View Your Dashboard**
   - See today's medications
   - Track adherence rate
   - View upcoming reminders

## 🔧 Available Commands

### Backend
```bash
npm run dev              # Development server with auto-reload
npm run build          # Build TypeScript
npm start              # Run compiled server
npm run prisma:migrate # Create new migration
npm run prisma:studio  # Open Prisma Studio (GUI)
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📊 Key Files to Know

### Backend
- `src/server.ts` - Main server entry
- `src/routes/` - API endpoints
- `src/controllers/` - Request handlers
- `prisma/schema.prisma` - Database schema

### Frontend
- `src/App.tsx` - Main app component
- `src/pages/` - Page components
- `src/components/` - Reusable components
- `public/service-worker.js` - PWA offline support

## 🐛 Common Issues

### Port Already in Use
```bash
# Change port in vite.config.ts or server/.env
# Or kill existing process:
lsof -ti :5173 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5173     # Windows
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U medapp -d medication_db

# Or verify Docker container
docker ps | grep postgres
```

### Service Worker Not Registering
```javascript
// Clear cache in DevTools:
// Application > Clear storage > Clear site data
// Then reload page
```

## 📚 Next Steps

1. **Explore Dashboard**
   - View today's medications
   - Check adherence rate
   - See upcoming reminders

2. **Add Medications**
   - Manual entry
   - OCR scanning
   - Set frequencies

3. **Test Notifications**
   - Create medication for soon
   - Wait for push notification
   - Click to confirm

4. **Check Reminders History**
   - View taken/missed/skipped
   - Download adherence report

## 🎨 Customization

### Change Theme Colors
Edit `client/tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#YOUR_COLOR',  // Change main color
  }
}
```

### Add New Features
1. Create component
2. Add API endpoint
3. Connect frontend to backend

## 📖 Documentation

- Full API docs in [README.md](./README.md)
- Database schema in [prisma/schema.prisma](./server/prisma/schema.prisma)
- Component structure in [STRUCTURE.md](./STRUCTURE.md)

## 🆘 Need Help?

1. Check [README.md](./README.md) for detailed docs
2. Review error messages in browser console
3. Check server logs in terminal
4. Verify .env files are correct

## 🎯 Success Indicators

✅ Both servers running without errors
✅ Can register and login
✅ Can add medications
✅ Dashboard shows your medications
✅ Can toggle notifications

---

**Ready to manage your medications like a pro! 🎉**

Questions? Check README.md for comprehensive documentation.
