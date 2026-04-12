import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, googleLogin, isLoading } = useAuth();
  const { showNotification } = useNotifications();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await login(data.email.trim(), data.password);
      showNotification('success', '¡Sesión iniciada exitosamente!');
      navigate('/dashboard');
    } catch (error: any) {
      showNotification('error', error.message || 'Error al iniciar sesión');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential);
      showNotification('success', '¡Sesión iniciada con Google!');
      navigate('/dashboard');
    } catch (error: any) {
      showNotification('error', error.message || 'Error al iniciar sesión con Google');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo Electrónico</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            {...register('email', { required: 'El correo es requerido' })}
            type="email"
            className="input-field pl-11"
            placeholder="tu@correo.com"
          />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            {...register('password', { required: 'La contraseña es requerida' })}
            type={showPassword ? 'text' : 'password'}
            className="input-field pl-11 pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary py-3 text-sm"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">o continúa con</span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => showNotification('error', 'Error al conectar con Google')}
          text="signin_with"
          shape="rectangular"
          width={350}
        />
      </div>
    </form>
  );
};

export default LoginForm;
