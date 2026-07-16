import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  registerStep1: (data) => api.post('/auth/register/step1/', data),
  verifyOtp: (data) => api.post('/auth/register/verify-otp/', data),
  resendOtp: (data) => api.post('/auth/register/resend-otp/', data),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  getPatientProfile: () => api.get('/auth/profile/patient/'),
  updatePatientProfile: (data) => api.patch('/auth/profile/patient/', data),
};

// User Management APIs
export const userAPI = {
  list: (params) => api.get('/users/', { params }),
  create: (data) => api.post('/users/', data),
  get: (id) => api.get(`/users/${id}/`),
  update: (id, data) => api.patch(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
};

// Patient APIs
export const patientAPI = {
  list: (params) => api.get('/patients/', { params }),
  create: (data) => api.post('/patients/', data),
  get: (id) => api.get(`/patients/${id}/`),
  update: (id, data) => api.patch(`/patients/${id}/`, data),
  delete: (id) => api.delete(`/patients/${id}/`),
};

// Case APIs
export const caseAPI = {
  list: (params) => api.get('/cases/', { params }),
  create: (data) => api.post('/cases/', data),
  get: (id) => api.get(`/cases/${id}/`),
  update: (id, data) => api.patch(`/cases/${id}/`, data),
  delete: (id) => api.delete(`/cases/${id}/`),
};

// Vaccination APIs
export const vaccinationAPI = {
  list: (params) => api.get('/vaccinations/records/', { params }),
  create: (data) => api.post('/vaccinations/records/', data),
  get: (id) => api.get(`/vaccinations/records/${id}/`),
  update: (id, data) => api.patch(`/vaccinations/records/${id}/`, data),
  delete: (id) => api.delete(`/vaccinations/records/${id}/`),
  schedules: (params) => api.get('/vaccinations/schedules/', { params }),
  createSchedule: (data) => api.post('/vaccinations/schedules/', data),
  missed: () => api.get('/vaccinations/missed/'),
  today: () => api.get('/vaccinations/today/'),
};

// Inventory APIs
export const inventoryAPI = {
  vaccines: (params) => api.get('/inventory/vaccines/', { params }),
  createVaccine: (data) => api.post('/inventory/vaccines/', data),
  getVaccine: (id) => api.get(`/inventory/vaccines/${id}/`),
  updateVaccine: (id, data) => api.patch(`/inventory/vaccines/${id}/`, data),
  batches: (params) => api.get('/inventory/batches/', { params }),
  createBatch: (data) => api.post('/inventory/batches/', data),
  alerts: () => api.get('/inventory/alerts/'),
  createAlert: (data) => api.post('/inventory/alerts/', data),
  updateAlert: (id, data) => api.patch(`/inventory/alerts/${id}/`, data),
  lowStock: () => api.get('/inventory/low-stock/'),
  summary: () => api.get('/inventory/summary/'),
};

// Report APIs
export const reportAPI = {
  summary: () => api.get('/reports/summary/'),
  daily: () => api.get('/reports/daily/'),
  patients: (params) => api.get('/reports/patients/', { params }),
  cases: (params) => api.get('/reports/cases/', { params }),
  vaccinations: (params) => api.get('/reports/vaccinations/', { params }),
  inventory: () => api.get('/reports/inventory/'),
};

// Dashboard APIs
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats/'),
};

// Appointment APIs
export const appointmentAPI = {
  // Availability
  availableSlots: (date) => api.get('/appointments/available-slots/', { params: { date } }),
  checkSlot: (date, time) => api.get('/appointments/check-slot/', { params: { date, time } }),
  clinicInfo: () => api.get('/appointments/clinic-info/'),
  
  // User's appointments
  myUpcoming: () => api.get('/appointments/my-upcoming/'),
  myHistory: () => api.get('/appointments/my-history/'),
  
  // CRUD
  list: (params) => api.get('/appointments/', { params }),
  create: (data) => api.post('/appointments/', data),
  get: (id) => api.get(`/appointments/${id}/`),
  update: (id, data) => api.patch(`/appointments/${id}/`, data),
  cancel: (id, reason) => api.post(`/appointments/${id}/cancel/`, { reason }),
  
  // Staff actions
  staffList: (params) => api.get('/appointments/staff/all/', { params }),
  approve: (id) => api.post(`/appointments/${id}/approve/`),
  reject: (id, reason) => api.post(`/appointments/${id}/reject/`, { reason }),
  complete: (id) => api.post(`/appointments/${id}/complete/`),
  
  // Configuration
  getConfig: () => api.get('/appointments/config/'),
  updateConfig: (data) => api.patch('/appointments/config/', data),
};

// Audit Log APIs
export const auditLogAPI = {
  list: (params) => api.get('/audit-logs/', { params }),
};

// Helper: DRF paginated list responses return { count, next, previous, results }
// This extracts the array from either paginated or plain-array responses.
export const extractPaginatedData = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

// Chat APIs
export const chatAPI = {
  getConversations: (params) => api.get('/chat/conversations/', { params }),
  getConversation: (id) => api.get(`/chat/conversations/${id}/`),
  createConversation: (data) => api.post('/chat/conversations/', data),
  updateConversation: (id, data) => api.patch(`/chat/conversations/${id}/`, data),
  deleteConversation: (id) => api.delete(`/chat/conversations/${id}/`),
  getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages/`),
  createMessage: (conversationId, data) => api.post(`/chat/conversations/${conversationId}/messages/`, data),
  getUnreadCount: () => api.get('/chat/unread-count/'),
  getStaffPatients: () => api.get('/chat/staff-patients/'),
  getAvailableStaff: () => api.get('/chat/available-staff/'),
};

export default api;
