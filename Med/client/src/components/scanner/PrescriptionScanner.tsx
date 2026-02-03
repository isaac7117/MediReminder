import React, { useState } from 'react';
import { Upload, Loader, CheckCircle } from 'lucide-react';
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
        onResultReceived(response.data);
        showNotification('success', '¡Receta escaneada exitosamente! Revisa los datos extraídos.');
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
  };

  const handleAutoCreate = async () => {
    if (!scanResult || !scanResult.medications || scanResult.medications.length === 0) {
      showNotification('error', 'No hay medicamentos para crear automáticamente');
      return;
    }

    console.log('[SCANNER] 🤖 Iniciando creación automática...', scanResult.medications);
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

      console.log('[SCANNER] 📤 Enviando medicamentos:', formattedMeds);
      
      const result = await autoMedicationService.createFromRecipe(formattedMeds);
      console.log('[SCANNER] ✅ Medicamentos creados:', result);

      showNotification('success', `✅ ${result.count.medications} medicamentos y ${result.count.reminders} recordatorios creados automáticamente`);
      
      if (onAutoCreated) {
        onAutoCreated(result);
      }

      // Limpiar después de crear
      setTimeout(() => {
        handleClear();
      }, 2000);
    } catch (error: any) {
      console.error('[SCANNER] ❌ Error al crear automáticamente:', error);
      showNotification('error', error.response?.data?.message || 'Error al crear medicamentos automáticamente');
    } finally {
      setIsAutoCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 text-gray-900">📸 Escanear Receta</h3>
        <p className="text-gray-600">Sube una imagen de tu receta para análisis automático con IA</p>
      </div>

      <div className="max-w-md mx-auto">
        {!scanResult ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-500'
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
                <>
                  <Loader className="animate-spin mx-auto mb-4 text-primary-600" size={48} />
                  <p className="text-lg font-semibold text-gray-700">Procesando imagen...</p>
                  <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-lg font-semibold text-gray-700">Haz clic para subir la receta</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG hasta 5MB</p>
                  <p className="text-xs text-gray-400 mt-3">O arrastra aquí</p>
                </>
              )}
            </label>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <p className="text-lg font-semibold text-gray-700 mb-4">¡Receta procesada!</p>
          </div>
        )}

        {preview && (
          <div className="mt-6">
            <img src={preview} alt="Preview" className="w-full rounded-lg max-h-96 object-cover" />
          </div>
        )}

        {scanResult && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">📋 Datos Extraídos:</h4>
            {scanResult.medications && scanResult.medications.length > 0 ? (
              <>
                <div className="space-y-4 text-sm text-blue-800">
                  {scanResult.medications.map((med: any, idx: number) => (
                    <div key={idx} className="bg-white rounded p-3 border border-blue-100">
                      <div><strong>💊 {med.name}</strong></div>
                      {med.dosage && <div>Dosis: {med.dosage}</div>}
                      {med.frequency && <div>Frecuencia: {med.frequency}</div>}
                      {med.duration && <div>Duración: {med.duration}</div>}
                      {med.instructions && <div>Instrucciones: {med.instructions}</div>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAutoCreate}
                    disabled={isAutoCreating}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition flex items-center justify-center gap-2"
                  >
                    {isAutoCreating ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        Creando...
                      </>
                    ) : (
                      '✨ Crear automáticamente'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 text-sm text-blue-800">
                {scanResult.medicationName && (
                  <div>
                    <strong>Medicamento:</strong> {scanResult.medicationName}
                  </div>
                )}
                {scanResult.dosage && (
                  <div>
                    <strong>Dosis:</strong> {scanResult.dosage}
                  </div>
                )}
                {scanResult.frequency && (
                  <div>
                    <strong>Frecuencia:</strong> {scanResult.frequency}
                  </div>
                )}
                {scanResult.duration && (
                  <div>
                    <strong>Duración:</strong> {scanResult.duration}
                  </div>
                )}
                {scanResult.instructions && (
                  <div>
                    <strong>Instrucciones:</strong> {scanResult.instructions}
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-blue-600 mt-3">⚠️ Revisa estos datos antes de guardar</p>
          </div>
        )}

        {preview && (
          <button
            onClick={handleClear}
            className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
};

export default PrescriptionScanner;
