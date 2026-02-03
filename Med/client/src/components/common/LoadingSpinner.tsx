import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader className="animate-spin text-primary-600 mx-auto mb-4" size={48} />
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
