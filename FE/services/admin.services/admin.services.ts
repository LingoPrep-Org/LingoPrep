import axiosInstance from "@/lib/axios/axios";
import type {
  AdminStats,
  AdminUserResponse,
  AIProfile,
  QuestionApiResponse,
  InfraStatus,
} from "./type";

const AdminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await axiosInstance.get<AdminStats>("/admin/stats");
    return response.data;
  },

  getUsers: async (): Promise<AdminUserResponse[]> => {
    const response =
      await axiosInstance.get<AdminUserResponse[]>("/admin/users");
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    const response = await axiosInstance.put(`/admin/users/${userId}/status`, {
      is_active: isActive,
    });
    return response.data as { is_active: boolean };
  },

  getAiProfiles: async (): Promise<AIProfile[]> => {
    const response = await axiosInstance.get<AIProfile[]>("/admin/ai-profiles");
    return response.data;
  },

  updateAiProfile: async (
    profileId: number,
    payload: Partial<
      Pick<AIProfile, "name" | "model_name" | "provider" | "is_active">
    > & {
      config?: Record<string, unknown>;
    },
  ): Promise<AIProfile> => {
    const response = await axiosInstance.put<AIProfile>(
      `/admin/ai-profiles/${profileId}`,
      payload,
    );
    return response.data;
  },

  getQuestions: async (): Promise<QuestionApiResponse[]> => {
    const response =
      await axiosInstance.get<QuestionApiResponse[]>("/questions");
    return response.data;
  },

  createQuestion: async (
    payload: Record<string, unknown>,
  ): Promise<QuestionApiResponse> => {
    const response = await axiosInstance.post<QuestionApiResponse>(
      "/questions",
      payload,
    );
    return response.data;
  },

  updateQuestion: async (
    questionId: string,
    payload: Record<string, unknown>,
  ): Promise<QuestionApiResponse> => {
    const response = await axiosInstance.put<QuestionApiResponse>(
      `/questions/${questionId}`,
      payload,
    );
    return response.data;
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    await axiosInstance.delete(`/questions/${questionId}`);
  },

  getInfraStatus: async (): Promise<InfraStatus> => {
    const response = await axiosInstance.get<InfraStatus>(
      "/admin/infra/status",
    );
    return response.data;
  },
};

export default AdminService;
