import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Define your Axios instance
const APiUtility: AxiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
  // Add other default configurations
});

// Request interceptor for adding authorization token or other headers
APiUtility.interceptors.request.use(
  async (config: any) => {
    // Add authorization token if available
    const accessToken: string | null = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration and refreshing tokens
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

APiUtility.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const accessToken: string = await new Promise<string>((resolve) => {
            subscribeTokenRefresh((token: string) => {
              resolve(token);
            });
          });
          originalRequest._retry = true;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return APiUtility(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      } else {
        isRefreshing = true;
        originalRequest._retry = true;
        const refreshToken: string | null = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Redirect to login or handle refresh token absence
          return Promise.reject(error);
        }
        try {
          const response = await APiUtility.post('/auth/refresh-tokens', { refreshToken });
          const { accessToken, newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken?.token);
          localStorage.setItem('refreshToken', newRefreshToken?.token);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          refreshSubscribers.forEach((callback) => callback(accessToken));
          return APiUtility(originalRequest);
        } catch (refreshError) {
          // Redirect to login or handle refresh token failure
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
          refreshSubscribers = [];
        }
      }
    }
    return Promise.reject(error);
  }
);

// Function to subscribe to token refresh
function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

export default APiUtility;