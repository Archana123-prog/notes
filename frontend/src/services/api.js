const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Universal request wrapper for Notes API
 */
const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Could not connect to the Backend server. Ensure backend is running on port 5000.');
    }
    throw error;
  }
};

export const api = {
  // Notes CRUD
  notes: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.pinned !== undefined && filters.pinned !== null) params.append('pinned', filters.pinned);
      if (filters.archived !== undefined && filters.archived !== null) params.append('archived', filters.archived);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await request(`/notes${queryString}`);
    },

    getById: async (id) => {
      return await request(`/notes/${id}`);
    },

    create: async (noteData) => {
      return await request('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
      });
    },

    update: async (id, noteData) => {
      return await request(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(noteData),
      });
    },

    togglePin: async (id) => {
      return await request(`/notes/${id}/pin`, {
        method: 'PATCH',
      });
    },

    delete: async (id) => {
      return await request(`/notes/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Health check
  health: {
    check: async () => {
      return await request('/health');
    },
  },
};
