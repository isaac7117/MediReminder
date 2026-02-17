import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { Activity, Shield } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-medical-ice flex">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-medical-dark via-primary-800 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Activity className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">MediReminder</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight">
            Tu salud merece<br />la mejor gestión
          </h2>
          <p className="text-primary-200 text-lg leading-relaxed max-w-md">
            Gestiona tus medicamentos de forma inteligente con recordatorios precisos y seguimiento completo.
          </p>
          <div className="mt-12 flex items-center gap-3 text-primary-200 text-sm">
            <Shield size={16} />
            <span>Datos protegidos y cifrados</span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-medical">
              <Activity className="text-white" size={20} />
            </div>
            <span className="font-bold text-lg text-medical-dark tracking-tight">
              Medi<span className="text-primary-600">Reminder</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-medical-dark">Bienvenido de vuelta</h1>
            <p className="text-gray-500 mt-1.5 text-sm">Ingresa tus credenciales para acceder a tu panel</p>
          </div>

          <div className="bg-white rounded-2xl shadow-medical-md border border-gray-100 p-8">
            <LoginForm />
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">¿No tienes una cuenta?</p>
            <button
              onClick={() => navigate('/register')}
              className="text-primary-600 hover:text-primary-700 font-semibold mt-1 text-sm"
            >
              Crea una ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
