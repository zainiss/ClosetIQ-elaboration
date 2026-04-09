// In-memory token storage
let token = null;

export const setToken = (newToken) => {
  token = newToken;
};

export const getToken = () => {
  return token;
};

export const apiRequest = async (path, options = {}) => {
  const baseUrl = process.env.REACT_APP_API_URL;
  const url = `${baseUrl}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response;
};
