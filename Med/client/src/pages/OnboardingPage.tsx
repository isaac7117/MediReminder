import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { notificationService } from '../services/notification.service';
import { useNotifications } from '../hooks/useNotifications';
import {
  Activity, ArrowRight, ArrowLeft, User, Users,
  ShieldCheck, Bell, CheckCircle, Plus, X
} from 'lucide-react';

type Step = 'welcome' | 'role' | 'careProfiles' | 'legal' | 'notifications' | 'done';

const RELATIONSHIPS = [
  { value: 'grandmother', label: 'Abuela' },
  { value: 'grandfather', label: 'Abuelo' },
  { value: 'mother', label: 'Mamá' },
  { value: 'father', label: 'Papá' },
  { value: 'aunt', label: 'Tía' },
  { value: 'uncle', label: 'Tío' },
  { value: 'spouse', label: 'Esposo/a' },
  { value: 'child', label: 'Hijo/a' },
  { value: 'sibling', label: 'Hermano/a' },
  { value: 'other', label: 'Otro' },
];

const OnboardingPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  const [step, setStep] = useState<Step>('welcome');
  const [gender, setGender] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [careProfiles, setCareProfiles] = useState<{ name: string; relationship: string }[]>([
    { name: '', relationship: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActivatingNotifs, setIsActivatingNotifs] = useState(false);
  const [notifsActivated, setNotifsActivated] = useState(false);

  // Si el navegador no soporta notificaciones no podemos obligar a activarlas
  const notifsSupported = notificationService.getStatus().notificationsSupported;

  const steps: Step[] = role === 'caregiver'
    ? ['welcome', 'role', 'careProfiles', 'legal', 'notifications', 'done']
    : ['welcome', 'role', 'legal', 'notifications', 'done'];

  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex) / (steps.length - 1)) * 100;

  const goNext = () => {
    const next = steps[currentIndex + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    const prev = steps[currentIndex - 1];
    if (prev) setStep(prev);
  };

  const addCareProfile = () => {
    setCareProfiles([...careProfiles, { name: '', relationship: '' }]);
  };

  const removeCareProfile = (index: number) => {
    if (careProfiles.length > 1) {
      setCareProfiles(careProfiles.filter((_, i) => i !== index));
    }
  };

  const updateCareProfile = (index: number, field: 'name' | 'relationship', value: string) => {
    const updated = [...careProfiles];
    updated[index][field] = value;
    setCareProfiles(updated);
  };

  const handleCompleteOnboarding = async () => {
    try {
      setIsSubmitting(true);
      const validProfiles = role === 'caregiver'
        ? careProfiles.filter(cp => cp.name.trim() && cp.relationship)
        : undefined;

      const response = await authService.completeOnboarding({
        gender,
        role,
        careProfiles: validProfiles
      });

      if (user && response.user) {
        updateUser({ ...user, ...response.user });
      }
      goNext();
    } catch (error: any) {
      showNotification('error', error.response?.data?.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateNotifications = async () => {
    try {
      setIsActivatingNotifs(true);
      const result = await notificationService.activateNotifications();
      if (result === 'push') {
        showNotification('success', 'Notificaciones push activadas correctamente.');
      } else {
        showNotification('success', 'Notificaciones activadas. Funcionarán mientras tengas la app abierta.');
      }
      setNotifsActivated(true);
    } catch (error: any) {
      showNotification('error', error.message || 'Error al activar notificaciones');
      setNotifsActivated(false);
    } finally {
      setIsActivatingNotifs(false);
    }
  };

  const handleFinish = () => {
    navigate('/dashboard', { replace: true });
  };

  const canProceedFromWelcome = !!gender;
  const canProceedFromRole = !!role;
  const canProceedFromCare = careProfiles.some(cp => cp.name.trim() && cp.relationship);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-gray-100 h-1.5">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          {/* Step: Welcome + Gender */}
          {step === 'welcome' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Activity className="text-white" size={28} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-medical-dark mb-2">
                  ¡Bienvenido{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-gray-500 text-sm sm:text-base">
                  Vamos a personalizar tu experiencia en MediReminder
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-4">¿Cómo te identificas?</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'female', label: 'Mujer', icon: '♀' },
                    { value: 'male', label: 'Hombre', icon: '♂' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setGender(opt.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        gender === opt.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{opt.icon}</span>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setGender('other')}
                  className={`w-full mt-3 p-3 rounded-xl border-2 transition-all text-center text-sm ${
                    gender === 'other'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-500'
                  }`}
                >
                  Prefiero no decir
                </button>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={goNext}
                  disabled={!canProceedFromWelcome}
                  className="btn-primary py-3 px-6 flex items-center gap-2 disabled:opacity-40"
                >
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step: Role */}
          {step === 'role' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-medical-dark mb-2">
                  ¿Cómo usarás MediReminder?
                </h2>
                <p className="text-gray-500 text-sm">
                  Esto nos ayuda a adaptar la app a tus necesidades
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setRole('personal')}
                  className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                    role === 'personal'
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${role === 'personal' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    <User size={24} className={role === 'personal' ? 'text-primary-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Uso personal</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Llevaré el control de mis propios medicamentos
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setRole('caregiver')}
                  className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                    role === 'caregiver'
                      ? 'border-secondary-500 bg-secondary-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${role === 'caregiver' ? 'bg-secondary-100' : 'bg-gray-100'}`}>
                    <Users size={24} className={role === 'caregiver' ? 'text-secondary-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Soy cuidador/a</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Administraré medicamentos de familiares o personas a mi cargo
                    </p>
                  </div>
                </button>
              </div>

              <div className="mt-6 flex justify-between">
                <button onClick={goBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
                  <ArrowLeft size={16} /> Atrás
                </button>
                <button
                  onClick={goNext}
                  disabled={!canProceedFromRole}
                  className="btn-primary py-3 px-6 flex items-center gap-2 disabled:opacity-40"
                >
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step: Care Profiles (only for caregivers) */}
          {step === 'careProfiles' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-medical-dark mb-2">
                  ¿A quién vas a cuidar?
                </h2>
                <p className="text-gray-500 text-sm">
                  Agrega las personas cuyos medicamentos administrarás
                </p>
              </div>

              <div className="space-y-3">
                {careProfiles.map((cp, index) => (
                  <div key={index} className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">Persona {index + 1}</span>
                      {careProfiles.length > 1 && (
                        <button
                          onClick={() => removeCareProfile(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder='Nombre o apodo (ej. "Abuela María")'
                        value={cp.name}
                        onChange={(e) => updateCareProfile(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
                        maxLength={50}
                      />
                      <select
                        value={cp.relationship}
                        onChange={(e) => updateCareProfile(index, 'relationship', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all appearance-none bg-white"
                      >
                        <option value="">Selecciona la relación</option>
                        {RELATIONSHIPS.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addCareProfile}
                className="w-full mt-3 p-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 text-gray-500 hover:text-primary-600 flex items-center justify-center gap-2 text-sm transition-all"
              >
                <Plus size={16} /> Agregar otra persona
              </button>

              <div className="mt-6 flex justify-between">
                <button onClick={goBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
                  <ArrowLeft size={16} /> Atrás
                </button>
                <button
                  onClick={goNext}
                  disabled={!canProceedFromCare}
                  className="btn-primary py-3 px-6 flex items-center gap-2 disabled:opacity-40"
                >
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step: Legal */}
          {step === 'legal' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={28} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-medical-dark mb-2">
                  Aviso importante
                </h2>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 max-h-[45vh] overflow-y-auto space-y-4 text-sm text-gray-600 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Aviso de Privacidad</h3>
                  <p>
                    MediReminder recopila únicamente la información necesaria para el funcionamiento de la aplicación: 
                    nombre, correo electrónico, datos de medicamentos y horarios de recordatorios. Tus datos se almacenan 
                    de forma segura y encriptada. No compartimos tu información personal con terceros. Puedes solicitar 
                    la eliminación de tu cuenta y datos en cualquier momento.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Deslinde de Responsabilidad Médica</h3>
                  <p>
                    MediReminder es una herramienta de organización y recordatorio. <strong>No sustituye 
                    el consejo, diagnóstico o tratamiento médico profesional.</strong> Los recordatorios 
                    se generan con base en la información que el usuario proporciona. El uso de esta 
                    aplicación no establece una relación médico-paciente. Consulta siempre a tu médico 
                    antes de iniciar, modificar o suspender cualquier tratamiento.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Términos de Uso</h3>
                  <p>
                    Al utilizar MediReminder, aceptas que: (1) eres responsable de la exactitud de los datos 
                    ingresados; (2) la aplicación puede presentar fallos técnicos que impidan la entrega 
                    oportuna de recordatorios; (3) los desarrolladores no son responsables de dosis 
                    perdidas, efectos adversos o cualquier consecuencia derivada del uso o no uso de la 
                    aplicación. El servicio se proporciona "tal cual" sin garantías de disponibilidad 
                    continua.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Marco Legal</h3>
                  <p>
                    Esta aplicación cumple con la Ley Federal de Protección de Datos Personales en 
                    Posesión de los Particulares (LFPDPPP) y la Norma Oficial Mexicana NOM-024-SSA3-2012 
                    sobre sistemas de información de registro electrónico para la salud. El tratamiento 
                    de datos se rige por las leyes de los Estados Unidos Mexicanos.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <button onClick={goBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
                  <ArrowLeft size={16} /> Atrás
                </button>
                <button
                  onClick={handleCompleteOnboarding}
                  disabled={isSubmitting}
                  className="btn-primary py-3 px-6 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Acepto y continuar'}
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Step: Notifications */}
          {step === 'notifications' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell size={28} className="text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-medical-dark mb-2">
                  Activa las notificaciones
                </h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Para que nunca olvides una dosis, necesitamos enviarte recordatorios en el momento indicado
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 text-center">
                {!notifsActivated ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleActivateNotifications}
                      disabled={isActivatingNotifs}
                      className="btn-primary py-3 px-8 text-base flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      <Bell size={18} />
                      {isActivatingNotifs ? 'Activando...' : 'Activar notificaciones'}
                    </button>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto">
                      Las notificaciones son necesarias para que la app cumpla su función:
                      avisarte cuando sea hora de cada medicamento.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle size={26} className="text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">¡Notificaciones activadas!</p>
                  </div>
                )}
              </div>

              {/* Si el navegador no soporta notificaciones, permitir continuar con aviso */}
              {!notifsSupported && (
                <p className="mt-4 text-xs text-amber-600 text-center">
                  Tu navegador no soporta notificaciones. Te recomendamos instalar la app o usar
                  Chrome/Edge para recibir los recordatorios.
                </p>
              )}

              <div className="mt-6 flex justify-between">
                <button onClick={goBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
                  <ArrowLeft size={16} /> Atrás
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!notifsActivated && notifsSupported}
                  className="btn-primary py-3 px-6 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Finalizar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="animate-fadeIn text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-medical-dark mb-2">
                ¡Todo listo!
              </h2>
              <p className="text-gray-500 mb-8">
                Tu cuenta está configurada. Ahora puedes comenzar a agregar tus medicamentos.
              </p>
              <button
                onClick={handleFinish}
                className="btn-primary py-3 px-8 text-base flex items-center gap-2 mx-auto"
              >
                Ir al inicio <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step indicator */}
      {step !== 'done' && (
        <div className="flex justify-center gap-1.5 pb-6">
          {steps.filter(s => s !== 'done').map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= currentIndex ? 'w-8 bg-primary-500' : 'w-4 bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
