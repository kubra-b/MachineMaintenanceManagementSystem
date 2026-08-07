import axios from 'axios';

// Backend port numaranı terminalde çalışan HTTPS adresine göre güncelle (örn: 7189 veya 5001)
const API_BASE_URL = 'http://localhost:5226/api';

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

// Makine Arıza / Bakım Geçmişini Getirme
export const getMachineHistory = async (id) => {
  const response = await api.get(`/machines/${id}/history`);
  return response.data;
};
// Yeni Makine Ekleme
export const createMachine = async (machineData) => {
  const response = await api.post('/machines', machineData);
  return response.data;
};
// Makine Güncelleme
export const updateMachine = async (id, machineData) => {
  const response = await api.put(`/machines/${id}`, machineData);
  return response.data;
};

// Makine Silme
export const deleteMachine = async (id) => {
  const response = await api.delete(`/machines/${id}`);
  return response.data;
};