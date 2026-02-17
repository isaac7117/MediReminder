import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { Activity, Heart } from 'lucide-react';

const RegisterPage: React.FC = () => {
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Activity className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">MediReminder</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight">
            Comienza a cuidar<br />tu salud hoy
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Crea tu cuenta gratuita y nunca vuelvas a olvidar una dosis importante.
          </p>
          <div className="mt-12 flex items-center gap-3 text-white/70 text-sm">
            <Heart size={16} />
            <span>Configuración rápida en menos de 2 minutos</span>
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
            <h1 className="text-2xl font-bold text-medical-dark">Crea tu cuenta</h1>
            <p className="text-gray-500 mt-1.5 text-sm">Completa tus datos para comenzar a gestionar tu salud</p>
          </div>

          <div className="bg-white rounded-2xl shadow-medical-md border border-gray-100 p-8">
            <RegisterForm />
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">¿Ya tienes una cuenta?</p>
            <button
              onClick={() => navigate('/login')}
              className="text-primary-600 hover:text-primary-700 font-semibold mt-1 text-sm"
            >
              Inicia sesión aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
