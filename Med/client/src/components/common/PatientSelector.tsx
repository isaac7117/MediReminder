import React, { useEffect, useState } from 'react';
import { Users, Plus, X, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCareProfiles } from '../../hooks/useCareProfiles';
import { RELATIONSHIPS, RELATIONSHIP_LABELS } from '../../utils/constants';

interface PatientSelectorProps {
  value: string;
  onChange: (careProfileId: string) => void;
  /** Etiqueta opcional encima del selector */
  label?: string;
}

/**
 * Selector de paciente para el modo cuidador. Solo se muestra cuando el usuario
 * tiene rol "caregiver". Permite elegir a quién pertenece el medicamento y
 * agregar un nuevo paciente sin salir de la pantalla.
 *
 * Para usuarios personales no renderiza nada (retorna null).
 */
const PatientSelector: React.FC<PatientSelectorProps> = ({ value, onChange, label = '¿Para qué paciente?' }) => {
  const { user } = useAuth();
  const { careProfiles, fetchCareProfiles, addCareProfile } = useCareProfiles({ autoFetch: false });

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const isCaregiver = user?.role === 'caregiver';

  // Cargar pacientes cuando el usuario es cuidador
  useEffect(() => {
    if (isCaregiver) {
      fetchCareProfiles();
    }
  }, [isCaregiver, fetchCareProfiles]);

  // Seleccionar el paciente por defecto cuando se cargan los perfiles
  useEffect(() => {
    if (isCaregiver && !value && careProfiles.length > 0) {
      const def = careProfiles.find(p => p.isDefault) || careProfiles[0];
      onChange(def.id);
    }
  }, [isCaregiver, value, careProfiles, onChange]);

  if (!isCaregiver) return null;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__add__') {
      setIsAdding(true);
      return;
    }
    onChange(e.target.value);
  };

  const handleAddPatient = async () => {
    setAddError(null);
    if (!newName.trim()) {
      setAddError('Escribe el nombre del paciente');
      return;
    }
    if (!newRelationship) {
      setAddError('Selecciona la relación');
      return;
    }
    setIsSaving(true);
    try {
      const created = await addCareProfile(newName.trim(), newRelationship);
      onChange(created.id);
      setIsAdding(false);
      setNewName('');
      setNewRelationship('');
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'No se pudo agregar el paciente');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-secondary-50/60 border border-secondary-100 rounded-xl p-4">
      <label className="flex items-center gap-1.5 text-sm font-medium text-secondary-800 mb-2">
        <Users size={15} />
        {label} <span className="text-red-400">*</span>
      </label>

      {!isAdding ? (
        <select
          value={value}
          onChange={handleSelectChange}
          className="input-field bg-white"
        >
          {careProfiles.length === 0 && <option value="">Cargando pacientes...</option>}
          {careProfiles.map(profile => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
              {profile.relationship && RELATIONSHIP_LABELS[profile.relationship]
                ? ` (${RELATIONSHIP_LABELS[profile.relationship]})`
                : ''}
            </option>
          ))}
          <option value="__add__">+ Agregar nuevo paciente…</option>
        </select>
      ) : (
        <div className="space-y-2 bg-white rounded-xl p-3 border border-gray-100">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder='Nombre o apodo (ej. "Abuela María")'
            className="input-field"
            maxLength={50}
          />
          <select
            value={newRelationship}
            onChange={(e) => setNewRelationship(e.target.value)}
            className="input-field bg-white"
          >
            <option value="">Selecciona la relación</option>
            {RELATIONSHIPS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {addError && <p className="text-xs text-red-500">{addError}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddPatient}
              disabled={isSaving}
              className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1.5"
            >
              <Check size={15} />
              {isSaving ? 'Guardando...' : 'Guardar paciente'}
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setAddError(null); }}
              className="btn-secondary py-2 px-3 text-sm flex items-center justify-center gap-1.5"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {!isAdding && careProfiles.length > 0 && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-2 text-xs text-secondary-700 hover:text-secondary-900 font-medium flex items-center gap-1"
        >
          <Plus size={13} /> Agregar otro paciente
        </button>
      )}
    </div>
  );
};

export default PatientSelector;
