import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
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

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// Clients
export const getClients = (search) =>
  api.get('/clients', { params: { search } });

export const getClient = (id) => api.get(`/clients/${id}`);

export const createClient = (data) => api.post('/clients', data);

export const updateClient = (id, data) => api.put(`/clients/${id}`, data);

export const deleteClient = (id) => api.delete(`/clients/${id}`);

// Produits
export const getProduits = (search) =>
  api.get('/produits', { params: { search } });

export const getProduit = (id) => api.get(`/produits/${id}`);

export const createProduit = (data) => api.post('/produits', data);

export const updateProduit = (id, data) => api.put(`/produits/${id}`, data);

export const deleteProduit = (id) => api.delete(`/produits/${id}`);

// Factures
export const getFactures = (filters) =>
  api.get('/factures', { params: filters });

export const getFacture = (id) => api.get(`/factures/${id}`);

export const createFacture = (data) => api.post('/factures', data);

export const updateFacture = (id, data) => api.put(`/factures/${id}`, data);

export const deleteFacture = (id) => api.delete(`/factures/${id}`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard');

// PDF
export const downloadFacturePDF = (id) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_URL}/pdf/facture/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
};

export default api;
