import React, { useState } from 'react';
import { Upload, Loader, CheckCircle, FileImage, Trash2, Send, Cpu } from 'lucide-react';
import { ocrService } from '../../services/ocr.service';
import { autoMedicationService } from '../../services/auto-medication.service';
import { useNotifications } from '../../hooks/useNotifications';

interface OCRResult {
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  rawText: string;
  medications?: any[];
  medicationCount?: number;
}

interface PrescriptionScannerProps {
  onResultReceived: (result: OCRResult) => void;
  onAutoCreated?: (medications: any) => void;
}

const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({ onResultReceived, onAutoCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<OCRResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [feedbackJson, setFeedbackJson] = useState<string>('');
  const [feedbackConsent, setFeedbackConsent] = useState(false);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const { showNotification } = useNotifications();

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Por favor sube una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'La imagen debe ser menor a 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process OCR
    setIsLoading(true);
    console.log('[OCR] Iniciando escaneo de receta...');
    try {
      const response = await ocrService.scanPrescription(file);
      console.log('[OCR] Resultado completo:', response);
      console.log('[OCR] Estructura:', { message: response.message, data: response.data, fileName: response.fileName });
      
      if (response && response.data) {
        console.log('[OCR] Data:', response.data);
        setScanResult(response.data);
        const feedbackPayload = {
          medications: response.data.medications || [],
          patientName: response.data.patientName || '',
          doctorName: response.data.doctorName || '',
          date: response.data.date || '',
          diagnosis: response.data.diagnosis || '',
          confidence: response.data.confidence || 'medium'
        };
        setFeedbackJson(JSON.stringify(feedbackPayload, null, 2));
        setFeedbackConsent(false);
        setFeedbackError(null);
        onResultReceived(response.data);
        showNotification('success', 'Receta escaneada exitosamente. Revisa los datos extraídos.');
      } else {
        console.warn('[OCR] No hay datos en la respuesta:', response);
        showNotification('warning', 'No se pudieron extraer datos de la receta. Revisa manualmente.');
      }
    } catch (error: any) {
      console.error('[OCR] Error:', error);
      showNotification('error', error.response?.data?.message || 'Error al escanear la receta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setScanResult(null);
    setFeedbackJson('');
    setFeedbackConsent(false);
    setFeedbackError(null);
  };

  const handleAutoCreate = async () => {
    if (!scanResult || !scanResult.medications || scanResult.medications.length === 0) {
      showNotification('error', 'No hay medicamentos para crear automáticamente');
      return;
    }

    console.log('[SCANNER]  Iniciando creación automática...', scanResult.medications);
    setIsAutoCreating(true);

    try {
      // Formatear medicamentos para el endpoint
      const formattedMeds = scanResult.medications.map((med: any) => ({
        name: med.name || 'Medicamento',
        dosage: med.dosage || '',
        instructions: med.instructions || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + (med.durationDays || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isContinuous: false,
        frequencyType: med.frequencyType || 'daily',
        frequencyValue: med.frequencyValue || 1,
        frequencyTimes: med.frequencyTimes || ['09:00'],
        frequencyDays: med.frequencyDays || []
      }));

      console.log('[SCANNER]  Enviando medicamentos:', formattedMeds);
      
      const result = await autoMedicationService.createFromRecipe(formattedMeds);
      console.log('[SCANNER]  Medicamentos creados:', result);

      showNotification('success', `${result.count.medications} medicamentos y ${result.count.reminders} recordatorios creados automáticamente`);
      
      if (onAutoCreated) {
        onAutoCreated(result);
      }

      // Limpiar después de crear
      setTimeout(() => {
        handleClear();
      }, 2000);
    } catch (error: any) {
      console.error('[SCANNER]  Error al crear automáticamente:', error);
      showNotification('error', error.response?.data?.message || 'Error al crear medicamentos automáticamente');
    } finally {
      setIsAutoCreating(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!scanResult) return;
    if (!feedbackConsent) {
      showNotification('warning', 'Debes aceptar el consentimiento para enviar feedback');
      return;
    }

    setIsFeedbackSubmitting(true);
    setFeedbackError(null);

    try {
      const correctedOutput = JSON.parse(feedbackJson || '{}');
      await ocrService.submitFeedback({
        rawText: scanResult.rawText || '',
        modelOutput: scanResult,
        correctedOutput,
        source: 'client-feedback',
        consent: true,
        language: 'es'
      });

      showNotification('success', 'Feedback enviado. Gracias por ayudar a mejorar el sistema.');
    } catch (error: any) {
      console.error('[OCR]  Error enviando feedback:', error);
      const message = error?.message || 'Error al enviar feedback';
      setFeedbackError(message);
      showNotification('error', message);
    } finally {
      setIsFeedbackSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-6 lg:p-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-accent-100 to-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner-glow">
          <Cpu className="text-primary-600" size={26} />
        </div>
        <h3 className="text-xl font-bold text-medical-dark mb-1">Escanear Receta</h3>
        <p className="text-sm text-gray-500">Sube una imagen de tu receta para análisis automático con IA</p>
      </div>

      <div className="max-w-md mx-auto">
        {!scanResult ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
              dragActive
                ? 'border-primary-400 bg-primary-50/60 shadow-medical scale-[1.01]'
                : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/30'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
              id="prescription-input"
            />

            <label htmlFor="prescription-input" className="cursor-pointer block">
              {isLoading ? (
                <div className="py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
                    <Loader className="animate-spin text-primary-600" size={32} />
                  </div>
                  <p className="font-semibold text-medical-dark">Procesando imagen...</p>
                  <p className="text-xs text-gray-400 mt-2">Analizando con inteligencia artificial</p>
                  <div className="mt-4 mx-auto w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full animate-shimmer bg-[length:200%_100%]" />
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                    <Upload className="text-gray-300" size={32} />
                  </div>
                  <p className="font-semibold text-medical-dark">Haz clic para subir la receta</p>
                  <p className="text-xs text-gray-400 mt-1.5">PNG, JPG hasta 5MB</p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-300">
                    <div className="w-8 h-[1px] bg-gray-200" />
                    O arrastra aquí
                    <div className="w-8 h-[1px] bg-gray-200" />
                  </div>
                </div>
              )}
            </label>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="text-emerald-500" size={32} />
            </div>
            <p className="font-semibold text-medical-dark">Receta procesada</p>
          </div>
        )}

        {preview && (
          <div className="mt-5 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <img src={preview} alt="Preview" className="w-full max-h-80 object-cover" />
          </div>
        )}

        {scanResult && (
          <div className="mt-5 bg-primary-50/40 rounded-2xl p-5 border border-primary-100">
            <h4 className="font-semibold text-medical-dark mb-3 flex items-center gap-2 text-sm">
              <FileImage size={16} className="text-primary-500" />
              Datos Extraídos
            </h4>
            {scanResult.medications && scanResult.medications.length > 0 ? (
              <>
                <div className="space-y-2.5 text-sm">
                  {scanResult.medications.map((med: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-xl p-3.5 border border-primary-100/60 shadow-sm">
                      <div className="font-semibold text-medical-dark text-sm">{med.name}</div>
                      {med.dosage && <div className="text-xs text-gray-500 mt-0.5">Dosis: {med.dosage}</div>}
                      {med.frequency && <div className="text-xs text-gray-500">Frecuencia: {med.frequency}</div>}
                      {med.duration && <div className="text-xs text-gray-500">Duración: {med.duration}</div>}
                      {med.instructions && <div className="text-xs text-gray-500">Instrucciones: {med.instructions}</div>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAutoCreate}
                    disabled={isAutoCreating}
                    className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    {isAutoCreating ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        Creando...
                      </>
                    ) : (
                      'Crear automáticamente'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1.5 text-sm">
                {scanResult.medicationName && (
                  <div className="text-gray-600">
                    <strong className="text-medical-dark">Medicamento:</strong> {scanResult.medicationName}
                  </div>
                )}
                {scanResult.dosage && (
                  <div className="text-gray-600">
                    <strong className="text-medical-dark">Dosis:</strong> {scanResult.dosage}
                  </div>
                )}
                {scanResult.frequency && (
                  <div className="text-gray-600">
                    <strong className="text-medical-dark">Frecuencia:</strong> {scanResult.frequency}
                  </div>
                )}
                {scanResult.duration && (
                  <div className="text-gray-600">
                    <strong className="text-medical-dark">Duración:</strong> {scanResult.duration}
                  </div>
                )}
                {scanResult.instructions && (
                  <div className="text-gray-600">
                    <strong className="text-medical-dark">Instrucciones:</strong> {scanResult.instructions}
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-primary-600/70 mt-3 font-medium">Revisa estos datos antes de guardar</p>

            {/* Feedback section */}
            <div className="mt-4 bg-white rounded-xl p-4 border border-gray-100">
              <h5 className="font-semibold text-medical-dark mb-1.5 text-sm flex items-center gap-1.5">
                <Send size={14} className="text-primary-500" />
                Ayúdanos a mejorar el OCR
              </h5>
              <p className="text-xs text-gray-400 mb-3">
                Corrige el JSON si es necesario y envíalo con tu consentimiento.
              </p>

              <textarea
                value={feedbackJson}
                onChange={(e) => setFeedbackJson(e.target.value)}
                className="w-full h-36 text-xs font-mono p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 bg-gray-50 transition-all"
              />

              <label className="flex items-center gap-2 text-xs text-gray-600 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feedbackConsent}
                  onChange={(e) => setFeedbackConsent(e.target.checked)}
                  className="w-3.5 h-3.5 text-primary-600 rounded focus:ring-primary-500"
                />
                Autorizo el uso de estos datos para mejorar el OCR (con anonimización).
              </label>

              {feedbackError && (
                <p className="text-xs text-red-500 mt-2">{feedbackError}</p>
              )}

              <button
                onClick={handleSubmitFeedback}
                disabled={isFeedbackSubmitting}
                className="mt-3 w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
              >
                {isFeedbackSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={14} />
                    Enviando...
                  </>
                ) : (
                  'Enviar correcciones'
                )}
              </button>
            </div>
          </div>
        )}

        {preview && (
          <button
            onClick={handleClear}
            className="w-full mt-4 btn-secondary py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
};

export default PrescriptionScanner;
