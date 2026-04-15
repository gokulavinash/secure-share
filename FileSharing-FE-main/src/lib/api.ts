// API Configuration and Helper Functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('accessToken');
const getRole = () => localStorage.getItem('userRole');

// API Helper
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token && !options.headers?.['Content-Type']?.includes('multipart')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!options.headers?.['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Auth APIs
export const authAPI = {
  userSignup: (data: { username: string; email: string; password: string; type: string }) =>
    apiCall('/users/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  userLogin: (data: { email: string; password: string }) =>
    apiCall('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adminSignup: (data: { username: string; email: string; password: string; organization: string }) =>
    apiCall('/admin/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adminLogin: (data: { email: string; password: string }) =>
    apiCall('/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// User APIs
export const userAPI = {
  getProfile: () => apiCall('/users/profile'),

  generateEncryptionKey: () =>
    apiCall('/users/profile/generate-key', {
      method: 'POST',
    }),

  updateEncryptionKey: (encryptionKey: string) =>
    apiCall('/users/profile/encryption-key', {
      method: 'PUT',
      body: JSON.stringify({ encryptionKey }),
    }),
};

// File APIs
export const fileAPI = {
  uploadFiles: (formData: FormData) => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    });
  },

  getMyUploads: () => apiCall('/files/my-uploads'),

  getReceivedFiles: () => apiCall('/files/received'),

  requestDownload: (fileId: string) =>
    apiCall(`/files/request-download/${fileId}`, {
      method: 'POST',
    }),

  downloadFile: async (fileId: string, fileName: string) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  searchFiles: (query: string, searchIn?: 'received' | 'uploaded' | 'all') =>
    apiCall('/users/search/files', {
      method: 'POST',
      body: JSON.stringify({ query, searchIn: searchIn || 'all' }),
    }),
};

// Admin APIs
export const adminAPI = {
  getProfile: () => apiCall('/admin/profile'),

  getDownloadRequests: () => apiCall('/admin/files/download-requests'),

  getAllFiles: (downloadRequestStatus?: string) => {
    const query = downloadRequestStatus ? `?downloadRequestStatus=${downloadRequestStatus}` : '';
    return apiCall(`/admin/files/all${query}`);
  },

  approveDownload: (fileId: string) =>
    apiCall(`/admin/files/approve-download/${fileId}`, {
      method: 'PUT',
    }),

  rejectDownload: (fileId: string, reason: string) =>
    apiCall(`/admin/files/reject-download/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  getAuditLogs: (params?: { action?: string; actorEmail?: string; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },

  getAllUsers: () => apiCall('/admin/users'),

  toggleUserStatus: (userId: string) =>
    apiCall(`/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
    }),

  searchFiles: (query: string) =>
    apiCall('/admin/search/files', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  searchUsers: (query: string) =>
    apiCall(`/admin/search/users?query=${encodeURIComponent(query)}`),
};

// Auth helpers
export const saveAuthData = (data: any, role: 'user' | 'admin') => {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('userRole', role);
  localStorage.setItem('userData', JSON.stringify(data[role] || data.user || data.admin));
};

export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userData');
};

export const isAuthenticated = () => !!getToken();
export const getUserRole = () => getRole();
export const getUserData = () => {
  const data = localStorage.getItem('userData');
  return data ? JSON.parse(data) : null;
};
