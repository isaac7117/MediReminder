import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { validateEmail, validatePassword } from '../../utils/validators';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: authRegister, isLoading } = useAuth();
  const { showNotification } = useNotifications();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    }
  });

  const onSubmit = async (data: any) => {
    try {
      if (!validateEmail(data.email)) {
        showNotification('error', 'Formato de correo inválido');
        return;
      }

      if (!validatePassword(data.password)) {
        showNotification('error', 'La contraseña debe tener más de 8 caracteres con mayúscula, minúscula y números');
        return;
      }

      if (data.password !== data.confirmPassword) {
        showNotification('error', 'Las contraseñas no coinciden');
        return;
      }

      await authRegister(data.email, data.password, data.confirmPassword, data.fullName);
      showNotification('success', '¡Registro exitoso!');
      navigate('/dashboard');
    } catch (error: any) {
      showNotification('error', error.response?.data?.message || 'Error al registrarse');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
        <input
          {...register('fullName', { required: 'El nombre completo es requerido' })}
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Juan Pérez"
        />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            {...register('email', { required: 'El correo es requerido' })}
            type="email"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="tu@correo.com"
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            {...register('password', { required: 'La contraseña es requerida' })}
            type="password"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        <div className="mt-2 text-xs text-gray-600 flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5" />
          <span>Máx 8 caracteres, mayúscula, minúscula y números</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            {...register('confirmPassword', { required: 'Por favor confirma tu contraseña' })}
            type="password"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
      >
        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>
    </form>
  );
};

export default RegisterForm;
