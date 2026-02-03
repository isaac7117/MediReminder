import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, LogOut, Home, Pill, Clock, Scan } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Pill className="text-primary-600" size={28} />
            <span className="font-bold text-xl text-gray-900">MediReminder</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <Home size={20} />
              Panel de Control
            </button>
            <button onClick={() => navigate('/medications')} className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <Pill size={20} />
              Medicamentos
            </button>
            <button onClick={() => navigate('/reminders')} className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <Clock size={20} />
              Recordatorios
            </button>
            <button onClick={() => navigate('/scanner')} className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <Scan size={20} />
              Escáner
            </button>
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-700">{user?.fullName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
            >
              Panel de Control
            </button>
            <button
              onClick={() => {
                navigate('/medications');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
            >
              Medicamentos
            </button>
            <button
              onClick={() => {
                navigate('/reminders');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
            >
              Recordatorios
            </button>
            <button
              onClick={() => {
                navigate('/scanner');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
            >
              Escáner
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
