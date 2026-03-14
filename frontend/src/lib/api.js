import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5115';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err.message || err)
);

export const api = {
  health: () => client.get('/api/health'),
  getRules: () => client.get('/api/rules'),
  getRule: (id) => client.get(`/api/rules/${id}`),
  createRule: (data) => client.post('/api/rules', data),
  updateRule: (id, data) => client.put(`/api/rules/${id}`, data),
  deleteRule: (id) => client.delete(`/api/rules/${id}`),
  toggleRule: (id, enabled) => client.put(`/api/rules/${id}`, { enabled }),
  getStages: () => client.get('/api/stages'),
  getTemplates: () => client.get('/api/templates'),
  getEvaluations: () => client.get('/api/evaluations'),
  getEvaluation: (id) => client.get(`/api/evaluations/${id}`),
  getDashboardStats: () => client.get('/api/dashboard/stats'),
  evaluate: (proposalData) => client.post('/api/underwriting/evaluate', proposalData),
  evaluateBatch: (proposals) => client.post('/api/underwriting/evaluate-batch', proposals),
};

export default api;
