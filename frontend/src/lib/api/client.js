import axios from 'axios';

const axiosClient = axios.create({
  // IMPORTANT: API calls must go to the backend, not the Next.js server.
  // Configure via NEXT_PUBLIC_API_URL_STAGING / NEXT_PUBLIC_API_URL_PROD.
  baseURL: (() => {
    const baseFromEnv = process.env.NEXT_PUBLIC_API_URL_STAGING || process.env.NEXT_PUBLIC_API_URL_PROD;
    if (!baseFromEnv) {
      // Fail loudly so misconfiguration doesn't silently produce Next.js 404s.
      throw new Error(
        'Missing backend API base URL. Set NEXT_PUBLIC_API_URL_STAGING (or NEXT_PUBLIC_API_URL_PROD) in .env.'
      );
    }
    return baseFromEnv;
  })(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

async function request(fn) {
  try {
    const res = await fn();
    return res?.data;
  } catch (err) {
    const status = err?.response?.status;
    const data = err?.response?.data;

    const message =
      data?.error ||
      data?.message ||
      err?.message ||
      'Request failed';

    const error = new Error(message);
    error.status = status;
    error.data = data;
    throw error;
  }
}

export const apiClient = {
  get: (url, config) => request(() => axiosClient.get(url, config)),
  post: (url, body, config) => request(() => axiosClient.post(url, body, config)),
  put: (url, body, config) => request(() => axiosClient.put(url, body, config)),
  delete: (url, config) => request(() => axiosClient.delete(url, config))
};
