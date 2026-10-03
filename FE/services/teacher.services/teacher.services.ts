import axiosInstance from "@/lib/axios/axios";
import type {
  TeacherNotificationResponse,
  TeacherReviewPayload,
  TeacherSubmissionResponse,
  TeacherStudentProgressResponse,
  TeacherAssignmentResponse,
  TeacherAssignmentSubmissionResponse,
  TeacherAssignmentPayload,
  TeacherQuestionResponse,
} from "./type";

const TeacherService = {
  getReviewQueue: async (): Promise<TeacherSubmissionResponse[]> => {
    const response =
      await axiosInstance.get<TeacherSubmissionResponse[]>("/reviews/queue");
    return response.data;
  },

  getSubmission: async (
    submissionId: string,
  ): Promise<TeacherSubmissionResponse> => {
    const response = await axiosInstance.get<TeacherSubmissionResponse>(
      `/submissions/${submissionId}`,
    );
    return response.data;
  },

  submitReview: async (submissionId: string, payload: TeacherReviewPayload) => {
    const response = await axiosInstance.post(
      `/reviews/${submissionId}`,
      payload,
    );
    return response.data;
  },

  getNotifications: async (): Promise<TeacherNotificationResponse[]> => {
    const response = await axiosInstance.get<TeacherNotificationResponse[]>(
      "/dashboard/notifications",
    );
    return response.data;
  },

  markNotificationRead: async (notificationId: string) => {
    const response = await axiosInstance.put(
      `/dashboard/notifications/${notificationId}/read`,
    );
    return response.data;
  },

  getStudentProgress: async (): Promise<TeacherStudentProgressResponse[]> => {
    const response = await axiosInstance.get<TeacherStudentProgressResponse[]>(
      "/teacher/students/progress",
    );
    return response.data;
  },

  getAssignments: async (): Promise<TeacherAssignmentResponse[]> => {
    const response = await axiosInstance.get<TeacherAssignmentResponse[]>(
      "/teacher/assignments",
    );
    return response.data;
  },

  createAssignment: async (payload: TeacherAssignmentPayload): Promise<TeacherAssignmentResponse> => {
    const response = await axiosInstance.post<TeacherAssignmentResponse>("/teacher/assignments", payload);
    return response.data;
  },

  updateAssignment: async (assignmentId: string, payload: TeacherAssignmentPayload): Promise<TeacherAssignmentResponse> => {
    const response = await axiosInstance.put<TeacherAssignmentResponse>(`/teacher/assignments/${assignmentId}`, payload);
    return response.data;
  },

  deleteAssignment: async (assignmentId: string): Promise<void> => {
    await axiosInstance.delete(`/teacher/assignments/${assignmentId}`);
  },

  getQuestions: async (): Promise<TeacherQuestionResponse[]> => {
    const response = await axiosInstance.get<TeacherQuestionResponse[]>("/questions");
    return response.data;
  },

  getAssignmentSubmissions: async (
    questionId: string,
  ): Promise<TeacherAssignmentSubmissionResponse[]> => {
    const response = await axiosInstance.get<
      TeacherAssignmentSubmissionResponse[]
    >(`/teacher/assignments/${questionId}/submissions`);
    return response.data;
  },
};

export default TeacherService;
