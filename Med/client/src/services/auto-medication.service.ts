import apiClient from './api';

export const autoMedicationService = {
  // Crear medicamentos automáticamente desde receta analizada con Gemini
  createFromRecipe: async (medications: any[]) => {
    const response = await apiClient.post('/auto-medications/from-recipe', {
      medications
    });
    return response.data;
  },

  // Crear medicamento individual con recordatorios automáticos
  createWithReminders: async (medicationData: any) => {
    const response = await apiClient.post('/auto-medications/with-reminders', medicationData);
    return response.data;
  }
};
