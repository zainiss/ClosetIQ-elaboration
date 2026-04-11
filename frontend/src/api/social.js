import { apiRequest } from './client';

// ── Feed ─────────────────────────────────────────────────────────────────────

export const getFeed = async (sort = 'trending', limit = 20, offset = 0) => {
  const params = new URLSearchParams({ sort, limit, offset });
  return apiRequest(`/social/feed?${params}`);
};

// ── Share ─────────────────────────────────────────────────────────────────────

export const shareOutfit = async (items, caption = '') =>
  apiRequest('/social/share', {
    method: 'POST',
    body: JSON.stringify({ items, caption }),
  });

export const deleteShare = async (outfitId) =>
  apiRequest(`/social/outfits/${outfitId}`, { method: 'DELETE' });

export const getMyShares = async () => apiRequest('/social/my-shares');

// ── Ratings ───────────────────────────────────────────────────────────────────

export const rateOutfit = async (outfitId, rating) =>
  apiRequest(`/social/outfits/${outfitId}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
  });

// ── Comments ──────────────────────────────────────────────────────────────────

export const getComments = async (outfitId) =>
  apiRequest(`/social/outfits/${outfitId}/comments`);

export const addComment = async (outfitId, text) =>
  apiRequest(`/social/outfits/${outfitId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });

export const deleteComment = async (commentId) =>
  apiRequest(`/social/comments/${commentId}`, { method: 'DELETE' });

export const flagComment = async (commentId) =>
  apiRequest(`/social/comments/${commentId}/flag`, { method: 'POST' });
