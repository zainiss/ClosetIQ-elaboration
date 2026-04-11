const TOKEN_KEY = 'closetiq_token';

// Load token from localStorage on startup
let token = localStorage.getItem(TOKEN_KEY);

export const setToken = (newToken) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem(TOKEN_KEY, newToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getToken = () => {
  return token;
};

/** In development, use relative URLs so the CRA dev server proxies to Flask (see package.json "proxy"). */
export const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  const raw = process.env.REACT_APP_API_URL;
  return raw ? String(raw).replace(/\/$/, '') : '';
};

export const apiRequest = async (path, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    const devHint =
      process.env.NODE_ENV === 'development'
        ? ' Is the backend running? From the repo root: cd backend && source venv/bin/activate && python run.py'
        : '';
    throw new Error(`Failed to reach the API.${devHint}`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || errorData.msg || `API error: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response;
};
