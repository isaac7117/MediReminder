import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import MedicationCard from '../components/medications/MedicationCard';
import { useMedications } from '../hooks/useMedications';
import { useNotifications } from '../hooks/useNotifications';
import { Plus, Scan, Pill } from 'lucide-react';

const MedicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { medications, isLoading, fetchMedications, deleteMedication } = useMedications();
  const { showNotification } = useNotifications();
  const [filter, setFilter] = React.useState<'active' | 'all'>('active');

  React.useEffect(() => {
    fetchMedications(filter === 'active');
  }, [filter]);

  const handleEdit = (medication: any) => {
    navigate(`/medications/${medication.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este medicamento?')) {
      try {
        await deleteMedication(id);
        showNotification('success', '¡Medicamento eliminado exitosamente!');
      } catch (error: any) {
        showNotification('error', error.message || 'Error al eliminar medicamento');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-medical-mesh min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-medical-dark tracking-tight">Medicamentos</h1>
              <p className="text-sm text-gray-500 mt-1">Gestiona tu tratamiento actual</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/scanner')}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Scan size={16} />
                Escanear
              </button>
              <button
                onClick={() => navigate('/medications/new')}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Agregar
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {(['active', 'all'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === status
                    ? 'bg-primary-500 text-white shadow-medical'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                {status === 'active' ? 'Activos' : 'Todos'}
              </button>
            ))}
          </div>

          {/* Medications Grid */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="h-10 w-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-sm text-gray-500">Cargando medicamentos...</p>
            </div>
          ) : medications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <Pill className="text-primary-400" size={28} />
              </div>
              <p className="text-gray-500 text-base mb-5">No hay medicamentos registrados</p>
              <button
                onClick={() => navigate('/scanner')}
                className="btn-primary text-sm"
              >
                Agregar Tu Primer Medicamento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {medications.map(medication => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MedicationsPage;
