# MediReminder - Medication Management PWA

A Progressive Web App (PWA) for managing medications and receiving intelligent reminders. Features include authentication, CRUD operations for medications, reminder scheduling, push notifications, and AI-powered OCR prescription scanning.

## Features

✅ **User Authentication**
- Secure registration and login with JWT
- Password hashing with bcrypt
- Protected routes

✅ **Medication Management**
- Add, edit, delete, and view medications
- Support for various frequency types (daily, weekly, hourly)
- Medication instructions and dosage tracking
- Image upload for medication documentation

✅ **Smart Reminders**
- Automatic reminder generation based on medication frequency
- Real-time countdown timers
- Mark medications as taken or skip
- Reminder history and status tracking

✅ **Push Notifications**
- Web Push API integration
- Background notification delivery
- Interactive notification actions
- Reminder confirmation from notification

✅ **Adherence Tracking**
- Visual charts showing medication adherence
- Weekly/monthly statistics
- Track taken, missed, and skipped medications
- Adherence rate calculation

✅ **OCR Prescription Scanning**
- Upload prescription images
- AI-powered text extraction with Tesseract.js
- Auto-fill medication details from scanned text
- Support for JPG, PNG images

✅ **PWA Features**
- Offline-first architecture
- Service Worker caching
- Installable on mobile and desktop
- Push notification support
- Fast load times

## Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **React Router DOM** - Navigation
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **date-fns** - Date utilities
- **Tesseract.js** - OCR processing
- **Web Push** - Push notifications

### Backend
- **Node.js 18+** with Express
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma ORM** - Database client
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **node-cron** - Task scheduling
- **web-push** - Push notifications
- **Tesseract.js** - OCR

## Project Structure

```
medication-reminder-app/
├── client/                    # React Frontend
│   ├── public/
│   │   ├── manifest.json     # PWA manifest
│   │   └── service-worker.js # Service Worker
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React Context
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities
│   │   ├── App.tsx          # Main app
│   │   └── main.tsx         # Entry point
│   └── vite.config.ts       # Vite config
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Main server
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── uploads/             # File uploads
│
├── docker-compose.yml        # Docker setup
├── .gitignore
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npx prisma migrate dev --name init

# Generate VAPID keys for Web Push (optional)
npx web-push generate-vapid-keys

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
```

### Docker Setup (Optional)

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Database will be available at localhost:5432
# Credentials: medapp / medapp123
# Database: medication_db
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Medications
- `POST /api/medications` - Create medication
- `GET /api/medications` - List medications
- `GET /api/medications/:id` - Get medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Reminders
- `GET /api/reminders` - List reminders
- `GET /api/reminders/today` - Today's reminders
- `GET /api/reminders/upcoming` - Upcoming reminders
- `PUT /api/reminders/:id/take` - Mark as taken
- `PUT /api/reminders/:id/skip` - Mark as skipped
- `GET /api/reminders/adherence/stats` - Adherence statistics

### OCR
- `POST /api/ocr/scan` - Scan prescription (multipart)
- `GET /api/ocr/scans` - User's scans

### Notifications
- `POST /api/notifications/subscribe` - Subscribe to push
- `POST /api/notifications/unsubscribe` - Unsubscribe
- `GET /api/notifications/vapid-public-key` - Get VAPID key

## Environment Configuration

### Backend (.env)
```
DATABASE_URL="postgresql://medapp:medapp123@localhost:5432/medication_db"
JWT_SECRET="your_super_secret_jwt_key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
VAPID_PUBLIC_KEY="your_vapid_public_key"
VAPID_PRIVATE_KEY="your_vapid_private_key"
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

## Usage

### Running Locally

1. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

2. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

3. **Start Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```

4. **Access Application**
   - Open browser to `http://localhost:5173`

### Building for Production

**Frontend:**
```bash
cd client
npm run build
# Output: dist/
```

**Backend:**
```bash
cd server
npm run build
# Output: dist/
```

## Features in Detail

### Medication Management
1. Add medications with frequency scheduling
2. Support for multiple times per day
3. Weekly frequency with day selection
4. Hourly intervals for frequent medications
5. Continuous or end-date based tracking

### Smart Reminders
- Automatic generation based on frequency
- Cron jobs run every minute to send notifications
- Missed reminders marked after 1 hour
- Real-time countdown in dashboard
- One-click confirmation

### Push Notifications
1. Request browser permission on first login
2. Server sends notifications at scheduled times
3. Click notification to confirm medication taken
4. Offline support via Service Worker

### Prescription Scanning
1. Upload prescription image
2. Tesseract.js extracts text
3. Pattern matching extracts medication details
4. Auto-fill form with extracted data
5. Manual review and confirmation before saving

### Adherence Tracking
- Charts show daily medication adherence
- Statistics for 7-day and longer periods
- Track taken, missed, and skipped medications
- Visual indicators for adherence rate

## Security Features

✅ Password hashing with bcrypt (10 rounds)
✅ JWT authentication with expiration
✅ Protected API endpoints
✅ Input validation and sanitization
✅ CORS configuration
✅ Environment variables for sensitive data
✅ Rate limiting ready (can be added)
✅ Secure HTTP-only cookies (recommended)

## PWA Features

✅ **Offline Support** - Service Worker caches key routes
✅ **Push Notifications** - Web Push API integration
✅ **Installable** - Add to home screen on mobile/desktop
✅ **Responsive** - Mobile-first design
✅ **Fast** - Optimized with Vite
✅ **Manifest** - Full PWA manifest with shortcuts

## Development

### Add New Medication Component
1. Create component in `client/src/components/medications/`
2. Export from index
3. Import in relevant page

### Add New API Endpoint
1. Create controller in `server/src/controllers/`
2. Create route in `server/src/routes/`
3. Register route in `server/src/server.ts`

### Database Changes
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Generate client
npx prisma generate

# Reset database
npx prisma migrate reset
```

## Troubleshooting

### Service Worker Issues
- Clear browser cache: DevTools > Application > Clear storage
- Verify `service-worker.js` is in public folder
- Check browser console for registration errors

### Database Connection
- Verify PostgreSQL is running: `psql -U medapp -d medication_db`
- Check DATABASE_URL in .env
- Run migrations: `npx prisma migrate dev`

### Push Notifications Not Working
- Generate VAPID keys: `npx web-push generate-vapid-keys`
- Update keys in .env and client
- Request notification permission in browser

### OCR Not Extracting Text
- Verify Tesseract.js is installed
- Check image quality and format
- Ensure image is readable (not rotated/skewed)

## API Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "confirmPassword": "Password123",
    "fullName": "John Doe"
  }'
```

### Create Medication
```bash
curl -X POST http://localhost:5000/api/medications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Aspirin",
    "dosage": "500mg",
    "frequencyType": "daily",
    "frequencyValue": 1,
    "frequencyTimes": ["09:00", "18:00"],
    "startDate": "2024-01-23",
    "instructions": "Take with food"
  }'
```

### Mark Reminder as Taken
```bash
curl -X PUT http://localhost:5000/api/reminders/REMINDER_ID/take \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "notes": "Took with breakfast"
  }'
```

## Future Enhancements

- [ ] Medication interactions checker
- [ ] Refill reminders
- [ ] Family/caregiver sharing
- [ ] Doctor integration
- [ ] Side effects tracking
- [ ] Medication notes/journal
- [ ] Export adherence reports
- [ ] Voice reminders
- [ ] SMS notifications
- [ ] Multi-language support

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create Issue](https://github.com/yourusername/medication-reminder-app/issues)
- Email: support@medicationreminder.app

## Acknowledgments

- [React](https://react.dev/)
- [Express.js](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Tesseract.js](https://tesseract.projectnaptha.com/)

---

**Made with ❤️ for better medication adherence**
