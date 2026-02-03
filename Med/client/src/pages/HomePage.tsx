import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Pill, Clock, Brain, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="text-primary-600" size={28} />
            <span className="font-bold text-xl text-gray-900">MediReminder</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-700 hover:text-primary-600 font-semibold"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Comenzar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Nunca Vuelvas a Olvidar una Dosis</h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          MediReminder te ayuda a gestionar tus medicamentos con recordatorios inteligentes, seguimiento de adherencia y escaneo de recetas potenciado por IA.
        </p>
        <button
          onClick={() => navigate('/register')}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-10 rounded-lg text-lg transition"
        >
          Comienza Gratis Hoy
        </button>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por Qué Elegir MediReminder?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Clock className="text-blue-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold mb-2">Recordatorios Inteligentes</h3>
              <p className="text-gray-600">Notificaciones push inteligentes en el momento correcto</p>
            </div>
            <div className="text-center">
              <Pill className="text-green-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold mb-2">Gestión Fácil</h3>
              <p className="text-gray-600">Gestiona todos tus medicamentos en un solo lugar</p>
            </div>
            <div className="text-center">
              <Brain className="text-purple-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold mb-2">Escaneo OCR con IA</h3>
              <p className="text-gray-600">Escanea recetas y completa automáticamente los detalles</p>
            </div>
            <div className="text-center">
              <Zap className="text-yellow-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold mb-2">Seguimiento de Adherencia</h3>
              <p className="text-gray-600">Monitorea tu adherencia a medicamentos con gráficos</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">¿Listo para Tomar el Control de tu Salud?</h2>
        <button
          onClick={() => navigate('/register')}
          className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition"
        >
          Regístrate Ahora
        </button>
      </section>
    </div>
  );
};

export default HomePage;
