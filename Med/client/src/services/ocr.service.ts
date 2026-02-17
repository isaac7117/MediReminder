import apiClient from './api';

export const ocrService = {
  scanPrescription: async (file: File) => {
    const formData = new FormData();
    formData.append('prescription', file);

    const response = await apiClient.post('/ocr/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getUserScans: async () => {
    const response = await apiClient.get('/ocr/scans');
    return response.data;
  },

  submitFeedback: async (payload: {
    rawText: string;
    modelOutput: any;
    correctedOutput: any;
    source?: string;
    consent: boolean;
    language?: string;
    imageHash?: string;
  }) => {
    const response = await apiClient.post('/ocr/feedback', payload);
    return response.data;
  }
};
