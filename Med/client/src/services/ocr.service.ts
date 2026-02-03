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
  }
};
