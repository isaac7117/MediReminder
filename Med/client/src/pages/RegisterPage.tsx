import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MediReminder</h1>
          <p className="text-gray-600 mt-2">Crea tu cuenta</p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center">
          <p className="text-gray-600">¿Ya tienes una cuenta?</p>
          <button
            onClick={() => navigate('/login')}
            className="text-primary-600 hover:text-primary-700 font-semibold mt-2"
          >
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
