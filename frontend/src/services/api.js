import axios from 'axios';

// Backend port numaranı terminalde çalışan HTTPS adresine göre güncelle (örn: 7189 veya 5001)
const API_BASE_URL = 'https://localhost:7189/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Makine Listesini Getirme
export const getMachines = async (departmentId = null, searchTerm = '') => {
  const response = await api.get('/machines', {
    params: { departmentId, searchTerm },
  });
  return response.data;
};

// Dashboard Özet Verilerini Getirme
export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

// Arıza Bildirimi
export const reportFailure = async (failureData) => {
  const response = await api.post('/machines/report-failure', failureData);
  return response.data;
};

// Bakıma Alma
export const startMaintenance = async (id, technicianName) => {
  const response = await api.post(`/machines/${id}/start-maintenance`, JSON.stringify(technicianName));
  return response.data;
};

// Bakımı Tamamlama
export const completeMaintenance = async (id, technicianNote) => {
  const response = await api.post(`/machines/${id}/complete-maintenance`, JSON.stringify(technicianNote));
  return response.data;
};

export default api;