import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import AdminOcrPage from './pages/AdminOcrPage';
import OnboardingPage from './pages/OnboardingPage';

function App() {
  useEffect(() => {
    // Registrar Service Worker para push notifications y PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch(error => {
          console.warn('Service Worker registration failed:', error);
        });

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type } = event.data || {};

        // El SW confirma que un medicamento fue tomado → refrescar datos
        if (type === 'MEDICATION_TAKEN') {
          console.log('[App] Medicamento tomado desde notificación:', event.data.medicationName);
          window.dispatchEvent(new CustomEvent('medication-taken', { detail: event.data }));
        }

        // El SW confirma que un medicamento fue omitido
        if (type === 'MEDICATION_SKIPPED') {
          console.log('[App] Medicamento omitido desde notificación:', event.data.medicationName);
          window.dispatchEvent(new CustomEvent('medication-skipped', { detail: event.data }));
        }

        // El SW confirma que un medicamento fue pospuesto
        if (type === 'MEDICATION_SNOOZED') {
          console.log('[App] Medicamento pospuesto desde notificación:', event.data.medicationName);
          window.dispatchEvent(new CustomEvent('medication-snoozed', { detail: event.data }));
        }
      });
    }
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <NotificationBell />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
            <Route path="/medications/:id/edit" element={
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

            <Route path="/admin/ocr" element={
              <ProtectedRoute>
                <AdminOcrPage />
              </ProtectedRoute>
            } />

            <Route path="/onboarding" element={
              <ProtectedRoute allowOnboarding>
                <OnboardingPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
