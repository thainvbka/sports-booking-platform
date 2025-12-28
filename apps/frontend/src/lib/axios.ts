import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true, // Important for cookies (refresh token)
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    indexes: null, // Send arrays as ?sport_types=TENNIS&sport_types=FOOTBALL instead of ?sport_types[0]=TENNIS
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu là lỗi 401 và message là "Account has not been activated..." thì trả về cho UI xử lý
    if (
      error.response?.status === 401 &&
      error.response?.data?.message ===
        "Account has not been activated. Please check your email."
    ) {
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        // We use a separate instance or direct call to avoid interceptor loop if this fails
        const response = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("accessToken");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
