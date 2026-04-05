// API Client for frontend
// In development with wrangler pages dev, API calls go to the same origin
// In production on Cloudflare Pages, Functions are served at the same origin

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:8788'  // wrangler pages dev default port
  : '';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error || `HTTP ${response.status}` 
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Providers API
export const providersApi = {
  getAll: () => fetchApi('/api/providers'),
  getById: (id: number) => fetchApi(`/api/providers/${id}`),
  create: (data: unknown) => fetchApi('/api/providers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: unknown) => fetchApi(`/api/providers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchApi(`/api/providers/${id}`, { method: 'DELETE' }),
};

// Provider Keys API
export const providerKeysApi = {
  getAll: (providerId?: number) => fetchApi(`/api/provider-keys${providerId ? `?provider_id=${providerId}` : ''}`),
  create: (data: unknown) => fetchApi('/api/provider-keys', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: unknown) => fetchApi(`/api/provider-keys/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchApi(`/api/provider-keys/${id}`, { method: 'DELETE' }),
  allocate: (id: number, userId: number) => fetchApi(`/api/provider-keys/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify({ action: 'allocate', user_id: userId }) 
  }),
  reclaim: (id: number, userId: number) => fetchApi(`/api/provider-keys/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify({ action: 'reclaim', user_id: userId }) 
  }),
  toggleStatus: (id: number) => fetchApi(`/api/provider-keys/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify({ action: 'toggle_status' }) 
  }),
};

// Users API
export const usersApi = {
  getAll: () => fetchApi('/api/users'),
  create: (data: unknown) => fetchApi('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) => fetchApi('/api/users', { method: 'PATCH', body: JSON.stringify({ id, ...data }) }),
};
