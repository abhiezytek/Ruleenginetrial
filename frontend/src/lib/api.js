import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5115';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('criterion_token') || localStorage.getItem('accurule_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // On 401, clear stored credentials and redirect to login
    if (err.response?.status === 401) {
      localStorage.removeItem('criterion_token');
      localStorage.removeItem('criterion_user');
      localStorage.removeItem('accurule_token');
      localStorage.removeItem('accurule_user');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err.message || err);
  }
);

export const api = {
  // Auth
  login: (credentials) => client.post('/api/auth/login', credentials),
  getMe: () => client.get('/api/auth/me'),

  // Rules
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
