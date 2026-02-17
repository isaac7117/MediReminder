import { useState } from 'react';
import { ocrAdminService } from '../services/ocr-admin.service';
import { useNotifications } from '../hooks/useNotifications';
import Navbar from '../components/common/Navbar';
import { Loader2, Database, Play, RefreshCw, Trash2, BarChart3, Cpu, KeyRound, FileText } from 'lucide-react';

const AdminOcrPage = () => {
  const [adminKey, setAdminKey] = useState('');
  const [samples, setSamples] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotifications();

  const loadAll = async () => {
    if (!adminKey) {
      showNotification('warning', 'Ingresa el ADMIN_API_KEY');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [samplesRes, metricsRes, jobsRes] = await Promise.all([
        ocrAdminService.getSamples(adminKey, { limit: 200 }),
        ocrAdminService.getMetrics(adminKey, 1000),
        ocrAdminService.getTrainingJobs(adminKey)
      ]);
      setSamples(samplesRes.samples || []);
      setMetrics(metricsRes || null);
      setJobs(jobsRes.jobs || []);
      showNotification('success', 'Datos cargados');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error cargando datos';
      setError(msg);
      showNotification('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleInclude = async (id: string, includeInTraining: boolean) => {
    if (!adminKey) return;
    try {
      await ocrAdminService.updateSample(adminKey, id, { includeInTraining });
      setSamples(prev => prev.map(s => (s.id === id ? { ...s, includeInTraining } : s)));
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Error actualizando');
    }
  };

  const removeSample = async (id: string) => {
    if (!adminKey) return;
    try {
      await ocrAdminService.deleteSample(adminKey, id);
      setSamples(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Error eliminando');
    }
  };

  const triggerTraining = async () => {
    if (!adminKey) return;
    try {
      await ocrAdminService.triggerTraining(adminKey);
      showNotification('success', 'Job iniciado');
      await loadAll();
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Error iniciando job');
    }
  };

  const refreshJobs = async () => {
    if (!adminKey) return;
    try {
      await ocrAdminService.refreshTrainingJobs(adminKey);
      await loadAll();
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Error actualizando jobs');
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-medical-mesh min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medical">
                <Cpu className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-medical-dark tracking-tight">Admin OCR</h1>
            </div>
            <p className="text-gray-500 text-sm ml-[52px]">Revisión de muestras, métricas y entrenamiento automático.</p>
          </div>

          {/* Auth + Actions */}
          <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-5 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="flex-1 relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="ADMIN_API_KEY"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={loadAll}
                  disabled={loading}
                  className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                  {loading ? 'Cargando...' : 'Cargar datos'}
                </button>
                <button
                  onClick={triggerTraining}
                  className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center gap-2 transition-all shadow-sm"
                >
                  <Play size={16} />
                  Entrenar
                </button>
                <button
                  onClick={refreshJobs}
                  className="btn-secondary py-2.5 px-4 text-sm flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refrescar
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-3 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
          </div>

          {/* Metrics + Jobs */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Metrics */}
            <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-5">
              <h2 className="font-semibold text-medical-dark mb-4 flex items-center gap-2 text-sm">
                <BarChart3 size={16} className="text-primary-500" />
                Métricas por modelo
              </h2>
              {metrics?.byModel ? (
                <div className="space-y-2.5 text-sm">
                  {Object.entries(metrics.byModel).map(([model, data]: any) => (
                    <div key={model} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                      <div className="font-semibold text-medical-dark text-sm">{model}</div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <span className="text-xs text-gray-400 block">Scans</span>
                          <span className="font-bold text-medical-dark">{data.count}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block">Confianza</span>
                          <span className="font-bold text-primary-600">{data.avgConfidence}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block">Meds prom.</span>
                          <span className="font-bold text-secondary-600">{data.avgMeds}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 size={32} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Sin métricas aún.</p>
                </div>
              )}
            </div>

            {/* Jobs */}
            <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-5">
              <h2 className="font-semibold text-medical-dark mb-4 flex items-center gap-2 text-sm">
                <Cpu size={16} className="text-accent-500" />
                Jobs de entrenamiento
              </h2>
              {jobs?.length ? (
                <div className="space-y-2.5 text-sm">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`badge ${
                          job.status === 'completed' ? 'badge-success' : 
                          job.status === 'running' ? 'badge-info' : 
                          job.status === 'failed' ? 'badge-danger' : 'badge-neutral'
                        }`}>{job.status}</span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div>Base: <strong className="text-medical-dark">{job.baseModel}</strong></div>
                        <div>Samples: <strong className="text-medical-dark">{job.sampleCount}</strong></div>
                        {job.fineTunedModelId && <div>FT: <strong className="text-primary-600">{job.fineTunedModelId}</strong></div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Cpu size={32} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Sin jobs aún.</p>
                </div>
              )}
            </div>
          </div>

          {/* Samples */}
          <div className="bg-white rounded-2xl shadow-medical border border-gray-100 p-5">
            <h2 className="font-semibold text-medical-dark mb-4 flex items-center gap-2 text-sm">
              <FileText size={16} className="text-primary-500" />
              Muestras OCR
              {samples.length > 0 && (
                <span className="badge-info ml-2">{samples.length}</span>
              )}
            </h2>
            {samples.length ? (
              <div className="space-y-2.5 text-sm max-h-[600px] overflow-y-auto">
                {samples.map((s) => (
                  <div key={s.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-primary-100 transition-colors group">
                    <div className="flex justify-between items-center">
                      <div className="font-mono text-xs text-gray-500 truncate max-w-[250px]">{s.id}</div>
                      <div className="flex gap-3 items-center">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={!!s.includeInTraining}
                            onChange={(e) => toggleInclude(s.id, e.target.checked)}
                            className="w-3.5 h-3.5 text-primary-600 rounded focus:ring-primary-500"
                          />
                          Incluir
                        </label>
                        <button
                          onClick={() => removeSample(s.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-600 mt-2 line-clamp-2 text-xs">{s.ocrText}</div>
                    <div className="text-xs text-gray-400 mt-1.5">{new Date(s.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Sin muestras aún.</p>
                <p className="text-xs text-gray-300 mt-1">Las muestras aparecerán después de escanear recetas.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOcrPage;
