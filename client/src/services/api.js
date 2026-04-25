const API_URL = '/api';

/**
 * Helper performant des requêtes fetch avec gestion du token et des erreurs
 */
async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
  };

  // N'ajouter Content-Type application/json que si ce n'est pas du FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Pour les exports de fichiers (blob)
    if (options.responseType === 'blob') {
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      return response.blob();
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/login')) {
        // Gérer l'expiration du token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
      throw new Error(data.error || 'Une erreur est survenue');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => fetchApi(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => fetchApi(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => fetchApi(endpoint, { method: 'PUT', body, ...options }),
  delete: (endpoint, options) => fetchApi(endpoint, { method: 'DELETE', ...options }),
  
  // Endpoint auth
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    changePassword: (data) => api.put('/auth/password', data)
  },
  
  // Endpoint users
  users: {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`)
  },
  
  // Endpoint reports
  reports: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return api.get(`/reports${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => api.get(`/reports/${id}`),
    create: (data) => api.post('/reports', data),
    update: (id, data) => api.put(`/reports/${id}`, data),
    submit: (id) => api.post(`/reports/${id}/submit`),
    unlock: (id) => api.post(`/reports/${id}/unlock`),
    uploadAttachments: (id, formData) => api.post(`/reports/${id}/attachments`, formData),
    deleteAttachment: (reportId, attachmentId) => api.delete(`/reports/${reportId}/attachments/${attachmentId}`),
    getStats: () => api.get('/reports/stats')
  }
};
