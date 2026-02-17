import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, Clock, Pill, Brain, BarChart3, Shield, ArrowRight, Heart } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: Clock,
      title: 'Recordatorios Inteligentes',
      description: 'Notificaciones push precisas que llegan justo cuando necesitas tomar tu medicamento.',
      color: 'from-primary-500 to-primary-600',
      bg: 'bg-primary-50',
    },
    {
      icon: Pill,
      title: 'Gestión Centralizada',
      description: 'Organiza todos tus medicamentos, dosis y horarios en un solo lugar seguro.',
      color: 'from-secondary-500 to-secondary-600',
      bg: 'bg-secondary-50',
    },
    {
      icon: Brain,
      title: 'Escaneo con IA',
      description: 'Digitaliza tus recetas médicas automáticamente con inteligencia artificial avanzada.',
      color: 'from-accent-500 to-accent-600',
      bg: 'bg-accent-50',
    },
    {
      icon: BarChart3,
      title: 'Seguimiento de Adherencia',
      description: 'Visualiza tu progreso con gráficos detallados y mejora tu cumplimiento terapéutico.',
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="min-h-screen bg-medical-ice">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-medical">
              <Activity className="text-white" size={20} />
            </div>
            <span className="font-bold text-lg text-medical-dark tracking-tight">
              Medi<span className="text-primary-600">Reminder</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-primary-600 font-medium text-sm px-4 py-2 rounded-xl hover:bg-primary-50 transition-all"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary text-sm"
            >
              Comenzar Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-pattern"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-8 animate-fade-in">
              <Shield size={16} />
              <span>Gestión segura e inteligente de medicamentos</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-medical-dark mb-6 leading-tight tracking-tight animate-slide-up">
              Tu salud, bajo
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"> control total</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up">
              MediReminder te ayuda a gestionar tus medicamentos con recordatorios inteligentes, seguimiento de adherencia y escaneo de recetas potenciado por IA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-semibold py-3.5 px-8 rounded-2xl text-base shadow-medical-lg hover:shadow-medical-xl transition-all duration-300 active:scale-[0.98]"
              >
                Comienza Gratis Hoy
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 font-semibold py-3.5 px-8 rounded-2xl text-base shadow-sm hover:shadow-medical transition-all duration-300"
              >
                Ya tengo cuenta
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in">
            {[
              { value: '99.9%', label: 'Disponibilidad' },
              { value: '< 1s', label: 'Notificaciones' },
              { value: 'HIPAA', label: 'Seguridad' },
              { value: '24/7', label: 'Monitoreo' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100">
                <p className="text-2xl font-bold text-primary-600">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 tracking-wide uppercase mb-3">Funcionalidades</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-medical-dark tracking-tight">
              Todo lo que necesitas para tu tratamiento
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-medical group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white" size={22} />
                </div>
                <h3 className="text-base font-bold text-medical-dark mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-medical-dark via-primary-800 to-primary-900 py-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-400 rounded-full blur-3xl"></div>
          </div>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <Heart className="text-primary-300 mx-auto mb-6" size={40} />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Tu bienestar es nuestra prioridad
            </h2>
            <p className="text-primary-200 text-lg mb-10 max-w-xl mx-auto">
              Únete a miles de pacientes que ya gestionan su tratamiento de forma inteligente.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-bold py-3.5 px-8 rounded-2xl text-base shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
            >
              Regístrate Ahora
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-medical-dark text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Activity className="text-white" size={14} />
            </div>
            <span className="text-sm font-semibold text-gray-300">MediReminder</span>
          </div>
          <p className="text-xs">Gestión inteligente de medicamentos con tecnología avanzada</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
