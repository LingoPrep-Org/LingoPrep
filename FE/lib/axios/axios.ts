import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api`,
  timeout: 10000, // 10 giây
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Tự động gắn token vào header nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    // Chỉ chạy ở client-side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let refreshPromise: Promise<string> | null = null;

function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("aptis-auth");
}

// Response Interceptor: Xử lý lỗi tập trung
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (typeof error.config & {
          _retry?: boolean;
        })
      | undefined;

    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.endsWith("/auth/refresh")
    ) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        originalRequest._retry = true;
        try {
          refreshPromise ??= axiosInstance
            .post<{ access_token: string; refresh_token: string }>(
              "/auth/refresh",
              { refresh_token: refreshToken },
              { _retry: true } as never,
            )
            .then(({ data }) => {
              localStorage.setItem("access_token", data.access_token);
              localStorage.setItem("refresh_token", data.refresh_token);
              return data.access_token;
            })
            .finally(() => {
              refreshPromise = null;
            });

          const accessToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch {
          clearSession();
          window.location.href = "/login";
        }
      } else {
        clearSession();
      }
    }

    // Preserve AxiosError so callers can inspect response.status and detail.
    return Promise.reject(error);
  },
);

export default axiosInstance;
