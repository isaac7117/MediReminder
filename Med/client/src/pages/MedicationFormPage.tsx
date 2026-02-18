import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useMedications } from '../hooks/useMedications';
import { useNotifications } from '../hooks/useNotifications';
import { medicationService } from '../services/medication.service';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  dosage: string;
  frequencyType: 'daily' | 'weekly' | 'monthly' | 'hourly' | 'custom';
  frequencyValue: number;
  frequencyTimes: string[];
  frequencyDays: string[];
  startDate: string;
  endDate: string;
  isContinuous: boolean;
  instructions: string;
  active: boolean;
}

const MedicationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { createMedication, updateMedication } = useMedications();
  const { showNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMed, setIsFetchingMed] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dosage: '',
    frequencyType: 'daily',
    frequencyValue: 1,
    frequencyTimes: ['09:00'],
    frequencyDays: [],
    startDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD in local timezone
    endDate: '',
    isContinuous: true,
    instructions: '',
    active: true
  });

  // Load medication data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadMedication(id);
    }
  }, [id, isEditMode]);

  const loadMedication = async (medicationId: string) => {
    setIsFetchingMed(true);
    try {
      const response = await medicationService.getById(medicationId);
      const med = response.medication;
      setFormData({
        name: med.name || '',
        dosage: med.dosage || '',
        frequencyType: med.frequencyType || 'daily',
        frequencyValue: med.frequencyValue || 1,
        frequencyTimes: med.frequencyTimes?.length > 0 ? med.frequencyTimes : ['09:00'],
        frequencyDays: med.frequencyDays?.map(String) || [],
        startDate: med.startDate ? new Date(med.startDate).toLocaleDateString('en-CA') : '',
        endDate: med.endDate ? new Date(med.endDate).toLocaleDateString('en-CA') : '',
        isContinuous: med.isContinuous ?? true,
        instructions: med.instructions || '',
        active: med.active ?? true
      });
    } catch (error: any) {
      showNotification('error', 'No se pudo cargar el medicamento');
      navigate('/medications');
    } finally {
      setIsFetchingMed(false);
    }
  };

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

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      frequencyDays: prev.frequencyDays.includes(day)
        ? prev.frequencyDays.filter(d => d !== day)
        : [...prev.frequencyDays, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        frequencyDays: formData.frequencyDays.map(Number),
        // Enviar las fechas como strings YYYY-MM-DD (el servidor las interpreta en zona del usuario)
        startDate: formData.startDate,
        endDate: formData.endDate || null
      };

      if (isEditMode && id) {
        await updateMedication(id, payload);
        showNotification('success', '¡Medicamento actualizado exitosamente! Los recordatorios han sido regenerados.');
      } else {
        await createMedication(payload);
        showNotification('success', '¡Medicamento creado exitosamente!');
      }
      
      navigate('/medications');
    } catch (error: any) {
      console.error('Error saving medication:', error);
      showNotification('error', error.response?.data?.message || error.message || 'Error al guardar el medicamento');
    } finally {
      setIsLoading(false);
    }
  };

  const dayLabels = [
    { value: '0', label: 'Dom' },
    { value: '1', label: 'Lun' },
    { value: '2', label: 'Mar' },
    { value: '3', label: 'Mié' },
    { value: '4', label: 'Jue' },
    { value: '5', label: 'Vie' },
    { value: '6', label: 'Sáb' }
  ];

  if (isFetchingMed) {
    return (
      <>
        <Navbar />
        <div className="bg-medical-mesh min-h-screen py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-primary-500 mx-auto" />
            <p className="mt-4 text-sm text-gray-500">Cargando medicamento...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-medical-mesh min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate('/medications')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={22} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-medical-dark tracking-tight">{isEditMode ? 'Editar Medicamento' : 'Agregar Medicamento'}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{isEditMode ? 'Modifica los datos de tu medicamento' : 'Completa la información de tu nuevo medicamento'}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-medical border border-gray-100 p-6 md:p-8 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre del Medicamento <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="ej. Ibuprofeno, Aspirina"
                className="input-field"
                required
              />
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Dosis <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                placeholder="ej. 500mg, 1 comprimido"
                className="input-field"
                required
              />
            </div>

            {/* Frequency Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo de Frecuencia
              </label>
              <select
                name="frequencyType"
                value={formData.frequencyType}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="daily">Diario</option>
                <option value="hourly">Cada X horas</option>
                <option value="weekly">Semanal</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            {/* Frequency Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Veces por Día
              </label>
              <input
                type="number"
                name="frequencyValue"
                value={formData.frequencyValue}
                onChange={handleInputChange}
                min="1"
                className="input-field"
              />
            </div>

            {/* Medication Times */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Horarios (HH:MM)
              </label>
              <div className="space-y-2">
                {formData.frequencyTimes.map((time, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="input-field flex-1"
                    />
                    {formData.frequencyTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleTimeRemove(index)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
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
                className="mt-2 btn-ghost text-sm"
              >
                + Agregar Horario
              </button>
            </div>

            {/* Weekly Day Selector */}
            {formData.frequencyType === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Días de la Semana
                </label>
                <div className="flex flex-wrap gap-2">
                  {dayLabels.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        formData.frequencyDays.includes(day.value)
                          ? 'bg-primary-500 text-white shadow-medical'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            {/* Is Continuous */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="isContinuous"
                name="isContinuous"
                checked={formData.isContinuous}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isContinuous" className="text-sm font-medium text-gray-700">
                Medicamento Continuo
              </label>
            </div>

            {/* End Date */}
            {!formData.isContinuous && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha de Finalización
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            )}

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Instrucciones
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                placeholder="ej. Tomar con comida, evitar alcohol"
                rows={4}
                className="input-field resize-none"
              />
            </div>

            {/* Active Toggle (only in edit mode) */}
            {isEditMode && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Medicamento Activo
                </label>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/medications')}
                className="flex-1 btn-secondary py-3 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-primary py-3 text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Guardando...</>
                ) : isEditMode ? (
                  <><Save size={16} /> Guardar Cambios</>
                ) : (
                  'Crear Medicamento'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default MedicationFormPage;
