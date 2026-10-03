import axiosInstance from "@/lib/axios/axios";
import { LoginRequest, LoginResponse } from "./type";

const AuthService = {
  // Hàm đăng nhập
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      data,
    );
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};

export default AuthService;
