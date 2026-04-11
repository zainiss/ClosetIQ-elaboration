import { apiRequest, getToken, getApiBaseUrl } from './client';

export const getItems = async () => {
  return apiRequest('/wardrobe/items');
};

export const uploadPhoto = async (formData) => {
  const baseUrl = getApiBaseUrl();
  const token = getToken();

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${baseUrl}/wardrobe/items/photo`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch {
    throw new Error(
      process.env.NODE_ENV === 'development'
        ? 'Failed to reach the API. Is the backend running on port 5000?'
        : 'Failed to reach the API.'
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload failed: ${response.status}`);
  }

  return response.json();
};

export const addByLink = async (data) => {
  return apiRequest('/wardrobe/items/link', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateTags = async (itemId, tags) => {
  return apiRequest(`/wardrobe/items/${itemId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tags }),
  });
};

export const deleteItem = async (itemId) => {
  return apiRequest(`/wardrobe/items/${itemId}`, {
    method: 'DELETE',
  });
};
