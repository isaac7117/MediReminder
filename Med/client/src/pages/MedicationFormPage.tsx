import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useMedications } from '../hooks/useMedications';
import { useNotifications } from '../hooks/useNotifications';
import { ArrowLeft } from 'lucide-react';

interface FormData {
  name: string;
  dosage: string;
  frequencyType: 'daily' | 'weekly' | 'monthly';
  frequencyValue: number;
  frequencyTimes: string[];
  frequencyDays: string[];
  startDate: string;
  endDate: string;
  isContinuous: boolean;
  instructions: string;
}

const MedicationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { createMedication } = useMedications();
  const { showNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dosage: '',
    frequencyType: 'daily',
    frequencyValue: 1,
    frequencyTimes: ['09:00'],
    frequencyDays: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isContinuous: true,
    instructions: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'frequencyValue' ? parseInt(value) : value
    }));
  };

  const handleTimeAdd = () => {
    setFormData(prev => ({
      ...prev,
      frequencyTimes: [...prev.frequencyTimes, '09:00']
    }));
  };

  const handleTimeChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      frequencyTimes: prev.frequencyTimes.map((time, i) => i === index ? value : time)
    }));
  };

  const handleTimeRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      frequencyTimes: prev.frequencyTimes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting medication form', formData);
    
    if (!formData.name || !formData.dosage) {
      showNotification('error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.frequencyTimes.length === 0) {
      showNotification('error', 'Por favor agrega al menos un horario de medicación');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : null
      };

      console.log('Payload to API', payload);

      await createMedication(payload);
      
      showNotification('success', '¡Medicamento creado exitosamente!');
      navigate('/medications');
    } catch (error: any) {
      console.error('Error creating medication:', error);
      showNotification('error', error.response?.data?.message || error.message || 'Error al crear el medicamento');
      console.error('Error creating medication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/medications')}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Agregar Medicamento</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            {/* Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Medicamento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="ej. Ibuprofeno, Aspirina"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Dosage */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dosis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                placeholder="ej. 500mg, 1 comprimido"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Frequency Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Frecuencia
              </label>
              <select
                name="frequencyType"
                value={formData.frequencyType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            {/* Frequency Value */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Veces por Día
              </label>
              <input
                type="number"
                name="frequencyValue"
                value={formData.frequencyValue}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Medication Times */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Horarios (HH:MM)
              </label>
              <div className="space-y-2">
                {formData.frequencyTimes.map((time, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.frequencyTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleTimeRemove(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleTimeAdd}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                + Agregar Horario
              </button>
            </div>

            {/* Start Date */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Is Continuous */}
            <div className="mb-6 flex items-center gap-2">
              <input
                type="checkbox"
                id="isContinuous"
                name="isContinuous"
                checked={formData.isContinuous}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <label htmlFor="isContinuous" className="text-sm font-semibold text-gray-700">
                Medicamento Continuo
              </label>
            </div>

            {/* End Date */}
            {!formData.isContinuous && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Finalización
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Instructions */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instrucciones
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                placeholder="ej. Tomar con comida, evitar alcohol"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/medications')}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creando...' : '+ Crear Medicamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default MedicationFormPage;
