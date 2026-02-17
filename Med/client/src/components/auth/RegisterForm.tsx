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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre Completo</label>
        <input
          {...register('fullName', { required: 'El nombre completo es requerido' })}
          type="text"
          className="input-field"
          placeholder="Juan Pérez"
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-1.5">{errors.fullName.message}</p>}
      </div>

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
            type="password"
            className="input-field pl-11"
            placeholder="••••••••"
          />
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50/60 border border-primary-100">
          <AlertCircle size={14} className="text-primary-500 shrink-0" />
          <span className="text-xs text-primary-700">Mín. 8 caracteres, mayúscula, minúscula y números</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            {...register('confirmPassword', { required: 'Por favor confirma tu contraseña' })}
            type="password"
            className="input-field pl-11"
            placeholder="••••••••"
          />
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary py-3 text-sm mt-2"
      >
        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>
    </form>
  );
};

export default RegisterForm;
