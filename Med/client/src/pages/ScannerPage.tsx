import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import PrescriptionScanner from '../components/scanner/PrescriptionScanner';
import { useMedications } from '../hooks/useMedications';
import { useNotifications } from '../hooks/useNotifications';
import { ArrowLeft, Plus, Wand2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import api from '../services/api';

interface GeminiMedication {
  name: string;
  dosage: string;
  frequency: string;
  frequencyValue: number;
  frequencyType: 'daily' | 'weekly' | 'monthly';
  frequencyTimes: string[];
  duration: string;
  durationDays?: number;
  instructions: string;
  indication?: string;
}

interface GeminiResult {
  medications: GeminiMedication[];
  patientName?: string;
  doctorName?: string;
  date?: string;
  diagnosis?: string;
  confidence: 'high' | 'medium' | 'low';
  medicationCount?: number;
}

interface OCRResult extends GeminiResult {
  medicationName?: string;
  rawText: string;
}

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

const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  // No hacer auto-fetch de medicamentos, solo necesitamos createMedication
  const { createMedication, isLoading } = useMedications({ autoFetch: false });
  const { showNotification } = useNotifications();

  const [geminiResult, setGeminiResult] = useState<GeminiResult | null>(null);
  const [isCreatingAuto, setIsCreatingAuto] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    dosage: '',
    frequencyType: 'daily',
    frequencyValue: 1,
    frequencyTimes: ['09:00'],
    frequencyDays: [],
    startDate: new Date().toLocaleDateString('en-CA'),
    endDate: '',
    isContinuous: true,
    instructions: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'frequencyValue' ? parseInt(value) || 0 : value
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

  const handleAutoCreateMedications = async () => {
    if (!geminiResult || !geminiResult.medications || geminiResult.medications.length === 0) {
      showNotification('error', 'No hay medicamentos para crear automáticamente');
      return;
    }

    setIsCreatingAuto(true);
    try {
      console.log('[Gemini]  Creando medicamentos automáticamente...');
      
      // Preparar datos para auto-creación
      const medicationsToCreate = geminiResult.medications.map(med => ({
        name: med.name,
        dosage: med.dosage,
        instructions: med.instructions || '',
        startDate: new Date().toLocaleDateString('en-CA'),
        endDate: med.durationDays 
          ? new Date(Date.now() + med.durationDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')
          : null,
        isContinuous: false,
        frequencyType: med.frequencyType || 'daily',
        frequencyValue: med.frequencyValue || 1,
        frequencyTimes: Array.isArray(med.frequencyTimes) ? med.frequencyTimes : ['09:00'],
        frequencyDays: []
      }));

      // Llamar endpoint de auto-creación
      const response = await api.post('/auto-medications/from-recipe', {
        medications: medicationsToCreate
      });

      console.log('[Gemini]  Respuesta:', response.data);
      
      showNotification('success', ` ${response.data.count.medications} medicamento(s) y ${response.data.count.reminders} recordatorio(s) creados automáticamente`);
      
      // Limpiar resultado y navegar
      setGeminiResult(null);
      navigate('/medications');
    } catch (error: any) {
      console.error('[Gemini]  Error:', error);
      showNotification('error', error.response?.data?.message || 'Error al crear medicamentos automáticamente');
    } finally {
      setIsCreatingAuto(false);
    }
  };

  const handleOCRResult = (result: OCRResult) => {
    console.log('[Gemini] Resultado recibido:', result);
    
    // Guardar resultado completo de Gemini
    setGeminiResult(result);
    
    // Si hay medicamentos, llenar el formulario con el primero
    if (result.medications && result.medications.length > 0) {
      const firstMed = result.medications[0];
      console.log('[Gemini] Completando formulario con:', firstMed.name);
      
      setFormData(prev => ({
        ...prev,
        name: firstMed.name || '',
        dosage: firstMed.dosage || '',
        frequencyType: (firstMed.frequencyType as any) || 'daily',
        frequencyValue: firstMed.frequencyValue || 1,
        frequencyTimes: Array.isArray(firstMed.frequencyTimes) ? firstMed.frequencyTimes : ['09:00'],
        instructions: firstMed.instructions || '',
        endDate: firstMed.durationDays 
          ? new Date(Date.now() + firstMed.durationDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')
          : ''
      }));
      
      showNotification('success', ` ${result.medicationCount || result.medications.length} medicamento(s) detectado(s) con Gemini AI`);
    } else {
      showNotification('info', 'Por favor revisa y confirma la información extraída');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== [FORM] SUBMIT CLICKED ===');
    console.log('[FORM] Form data:', JSON.stringify(formData, null, 2));
    
    // Check required fields
    if (!formData.name) {
      console.warn('[FORM]  Missing name');
      showNotification('error', 'El nombre del medicamento es requerido');
      return;
    }
    
    if (!formData.dosage) {
      console.warn('[FORM]  Missing dosage');
      showNotification('error', 'La dosis es requerida');
      return;
    }

    if (!formData.frequencyTimes || formData.frequencyTimes.length === 0) {
      console.warn('[FORM]  No medication times');
      showNotification('error', 'Por favor agrega al menos un horario de medicación');
      return;
    }

    console.log('[FORM] ✓ All validations passed');

    try {
      const payload = {
        ...formData,
        // Enviar fechas como strings YYYY-MM-DD
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        frequencyDays: formData.frequencyDays || []
      };

      console.log('[FORM] → Sending payload:', JSON.stringify(payload, null, 2));
      
      await createMedication(payload);

      console.log('[FORM] ✓ Success!');
      showNotification('success', '¡Medicamento creado exitosamente!');
      navigate('/medications');
    } catch (error: any) {
      console.error('[FORM]  Error:', error);
      console.error('[FORM] Error details:', JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      }, null, 2));
      showNotification('error', error.response?.data?.message || error.message || 'Failed to create medication');
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-medical-mesh min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate('/medications')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Volver a Medicamentos
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Escáner - Opcional, no bloquea el formulario */}
            <div>
              <PrescriptionScanner onResultReceived={handleOCRResult} />
            </div>

            {/* Formulario - Enfoque principal */}
            <div>
              {/* Sección de medicamentos detectados por Gemini */}
              {geminiResult && geminiResult.medications && geminiResult.medications.length > 0 && (
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 mb-6 border border-primary-100">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Wand2 className="text-primary-600" size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-primary-900">Gemini detectó {geminiResult.medications.length} medicamento(s)</h3>
                  </div>

                  {/* Información de la receta */}
                  {(geminiResult.patientName || geminiResult.doctorName || geminiResult.diagnosis) && (
                    <div className="bg-white/80 rounded-xl p-3 mb-4 text-xs space-y-1">
                      {geminiResult.patientName && <p><strong>Paciente:</strong> {geminiResult.patientName}</p>}
                      {geminiResult.doctorName && <p><strong>Doctor:</strong> {geminiResult.doctorName}</p>}
                      {geminiResult.diagnosis && <p><strong>Diagnóstico:</strong> {geminiResult.diagnosis}</p>}
                    </div>
                  )}

                  {/* Lista de medicamentos detectados */}
                  <div className="space-y-2.5 max-h-96 overflow-y-auto">
                    {geminiResult.medications.map((med, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 hover:border-primary-200 hover:shadow-medical transition-all duration-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-medical-dark text-sm">{med.name}</h4>
                            <p className="text-xs text-gray-500">{med.dosage}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {geminiResult.confidence === 'high' && <CheckCircle2 size={16} className="text-secondary-500" />}
                            {geminiResult.confidence === 'medium' && <AlertCircle size={16} className="text-amber-500" />}
                            {geminiResult.confidence === 'low' && <AlertCircle size={16} className="text-orange-500" />}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                              geminiResult.confidence === 'high' ? 'badge-success' : geminiResult.confidence === 'medium' ? 'badge-warning' : 'badge-danger'
                            }`}>
                              {geminiResult.confidence === 'high' ? 'Alta' : geminiResult.confidence === 'medium' ? 'Media' : 'Baja'}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <p><strong>Frecuencia:</strong> {med.frequencyValue}x {med.frequencyType} a las {med.frequencyTimes.join(', ')}</p>
                          {med.duration && <p><strong>Duración:</strong> {med.duration}</p>}
                          {med.indication && <p><strong>Indicación:</strong> {med.indication}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2.5 mt-4">
                    <button
                      onClick={handleAutoCreateMedications}
                      disabled={isCreatingAuto}
                      className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
                    >
                      {isCreatingAuto ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Creando...
                        </>
                      ) : (
                        <>
                          <Wand2 size={16} />
                          Crear Automáticamente
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setGeminiResult(null)}
                      className="btn-secondary py-2.5 text-sm flex items-center justify-center gap-1.5"
                    >
                      <X size={16} />
                      Descartar
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-medical border border-gray-100 p-6 space-y-5">
                <h3 className="text-lg font-bold text-medical-dark">Detalles del Medicamento</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del Medicamento *</label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="p.ej., Aspirina"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Dosis *</label>
                  <input
                    name="dosage"
                    type="text"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="p.ej., 500mg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Frecuencia</label>
                  <select
                    name="frequencyType"
                    value={formData.frequencyType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Veces por Día</label>
                  <input
                    name="frequencyValue"
                    type="number"
                    value={formData.frequencyValue}
                    onChange={handleInputChange}
                    min="1"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Horarios (HH:MM) *</label>
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
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de Inicio *</label>
                  <input
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de Finalización</label>
                  <input
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <input
                    name="isContinuous"
                    type="checkbox"
                    id="continuous"
                    checked={formData.isContinuous}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="continuous" className="text-sm font-medium text-gray-700">Medicamento continuo</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Instrucciones</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    className="input-field resize-none"
                    placeholder="p.ej., Tomar con comida"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {isLoading ? 'Creando...' : 'Crear Medicamento'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScannerPage;
