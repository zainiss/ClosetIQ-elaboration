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

// ── Content Moderation ───────────────────────────────────────────────────────

export const listSharedOutfits = async (limit = 50, offset = 0, hiddenOnly = false) => {
  const params = new URLSearchParams({ limit, offset });
  if (hiddenOnly) params.set('hidden', 'true');
  return apiRequest(`/admin/moderation/outfits?${params}`);
};

export const hideOutfit = async (outfitId) =>
  apiRequest(`/admin/moderation/outfits/${outfitId}/hide`, { method: 'POST' });

export const unhideOutfit = async (outfitId) =>
  apiRequest(`/admin/moderation/outfits/${outfitId}/unhide`, { method: 'POST' });

export const adminDeleteOutfit = async (outfitId) =>
  apiRequest(`/admin/moderation/outfits/${outfitId}`, { method: 'DELETE' });

export const listFlaggedComments = async () =>
  apiRequest('/admin/moderation/comments');

export const dismissFlag = async (commentId) =>
  apiRequest(`/admin/moderation/comments/${commentId}/dismiss`, { method: 'POST' });

export const adminDeleteComment = async (commentId) =>
  apiRequest(`/admin/moderation/comments/${commentId}`, { method: 'DELETE' });
