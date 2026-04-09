import { apiRequest } from './client';

export const listUsers = async () => apiRequest('/admin/users');

export const deactivateUser = async (userId) =>
  apiRequest(`/admin/users/${userId}/deactivate`, { method: 'POST' });

export const activateUser = async (userId) =>
  apiRequest(`/admin/users/${userId}/activate`, { method: 'POST' });

export const deleteUser = async (userId) =>
  apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });

export const getActivity = async (limit = 50, offset = 0, userId = null) => {
  const params = new URLSearchParams({ limit, offset });
  if (userId) params.set('user_id', userId);
  return apiRequest(`/admin/activity?${params}`);
};

export const getStats = async () => apiRequest('/admin/stats');
