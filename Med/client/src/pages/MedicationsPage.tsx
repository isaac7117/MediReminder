import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import MedicationCard from '../components/medications/MedicationCard';
import { useMedications } from '../hooks/useMedications';
import { useNotifications } from '../hooks/useNotifications';
import { Plus, Scan } from 'lucide-react';

const MedicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { medications, isLoading, fetchMedications, deleteMedication } = useMedications();
  const { showNotification } = useNotifications();
  const [filter, setFilter] = React.useState<'active' | 'all'>('active');

  React.useEffect(() => {
    fetchMedications(filter === 'active');
  }, [filter]);

  const handleEdit = (medication: any) => {
    // TODO: Implement edit page
    showNotification('info', 'Función de edición próximamente');
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
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Medicamentos</h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/scanner')}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                <Scan size={20} />
                Escanear
              </button>
              <button
                onClick={() => navigate('/medications/new')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                <Plus size={20} />
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
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status === 'active' ? 'Activos' : 'Todos'}
              </button>
            ))}
          </div>

          {/* Medications Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
              </div>
              <p className="mt-4 text-gray-600">Cargando medicamentos...</p>
            </div>
          ) : medications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">No hay medicamentos</p>
              <button
                onClick={() => navigate('/scanner')}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Agregar Tu Primer Medicamento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
