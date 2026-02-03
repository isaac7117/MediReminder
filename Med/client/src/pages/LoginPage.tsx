import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MediReminder</h1>
          <p className="text-gray-600 mt-2">Gestiona tus medicamentos fácilmente</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <p className="text-gray-600">¿No tienes una cuenta?</p>
          <button
            onClick={() => navigate('/register')}
            className="text-primary-600 hover:text-primary-700 font-semibold mt-2"
          >
            Crea una ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
