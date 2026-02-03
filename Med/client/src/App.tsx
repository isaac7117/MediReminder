import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationBell from './components/common/NotificationBell';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MedicationsPage from './pages/MedicationsPage';
import MedicationFormPage from './pages/MedicationFormPage';
import RemindersPage from './pages/RemindersPage';
import ScannerPage from './pages/ScannerPage';

function App() {
  useEffect(() => {
    // Service Worker deshabilitado temporalmente para evitar conflictos
    // TODO: Re-habilitar cuando la app esté en producción
    /*
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(error => {
        console.log('Service Worker registration failed:', error);
      });
    }
    */
    
    // Limpiar cualquier Service Worker existente
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
          console.log('Service Worker unregistered');
        });
      });
    }
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <NotificationBell />
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/medications" element={
              <ProtectedRoute>
                <MedicationsPage />
              </ProtectedRoute>
            } />
            <Route path="/medications/new" element={
              <ProtectedRoute>
                <MedicationFormPage />
              </ProtectedRoute>
            } />
            <Route path="/reminders" element={
              <ProtectedRoute>
                <RemindersPage />
              </ProtectedRoute>
            } />
            <Route path="/scanner" element={
              <ProtectedRoute>
                <ScannerPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
