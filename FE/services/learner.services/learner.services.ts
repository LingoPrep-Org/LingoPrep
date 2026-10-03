import axiosInstance from "@/lib/axios/axios";
import type {
  LearnerDashboardResponse,
  LearnerProgressResponse,
  LearnerNotificationResponse,
  LearnerAssignmentResponse,
  LearnerQuestionResponse,
  LearnerSubmissionResponse,
  SubmissionCreatedResponse,
} from "./type";

const LearnerService = {
  getDashboard: async (): Promise<LearnerDashboardResponse> => {
    const response =
      await axiosInstance.get<LearnerDashboardResponse>("/dashboard/learner");
    return response.data;
  },

  getProgress: async (): Promise<LearnerProgressResponse> => {
    const response = await axiosInstance.get<LearnerProgressResponse>(
      "/dashboard/learner/progress",
    );
    return response.data;
  },

  getQuestions: async (): Promise<LearnerQuestionResponse[]> => {
    const response =
      await axiosInstance.get<LearnerQuestionResponse[]>("/questions");
    return response.data;
  },

  getAssignments: async (): Promise<LearnerAssignmentResponse[]> => {
    const response =
      await axiosInstance.get<LearnerAssignmentResponse[]>("/assignments");
    return response.data;
  },

  findPracticeQuestion: async (
    skill: "SPEAKING" | "WRITING",
    taskId: number,
  ): Promise<LearnerQuestionResponse | undefined> => {
    const questions = await LearnerService.getQuestions();
    const preferredParts =
      skill === "SPEAKING"
        ? [`Part ${taskId}`]
        : [`Part ${taskId}`, `Task ${taskId}`];
    return (
      preferredParts.reduce<LearnerQuestionResponse | undefined>(
        (match, part) =>
          match ??
          questions.find(
            (question) =>
              question.exam_type === "APTIS" &&
              question.skill === skill &&
              question.part === part,
          ),
        undefined,
      ) ??
      preferredParts.reduce<LearnerQuestionResponse | undefined>(
        (match, part) =>
          match ??
          questions.find(
            (question) => question.skill === skill && question.part === part,
          ),
        undefined,
      )
    );
  },

  submitWriting: async (
    questionId: number,
    contentText: string,
  ): Promise<SubmissionCreatedResponse> => {
    const response = await axiosInstance.post<SubmissionCreatedResponse>(
      "/submissions/writing",
      { question_id: questionId, content_text: contentText },
    );
    return response.data;
  },

  submitSpeaking: async (
    questionId: number,
    durationSeconds: number,
    audioBlob: Blob,
  ): Promise<SubmissionCreatedResponse> => {
    const formData = new FormData();
    formData.append("question_id", String(questionId));
    formData.append("duration_seconds", String(durationSeconds));
    const extension = audioBlob.type.includes("mp4") ? "m4a" : "webm";
    formData.append("audio_file", audioBlob, `speaking-practice.${extension}`);
    const response = await axiosInstance.post<SubmissionCreatedResponse>(
      "/submissions/speaking",
      formData,
    );
    return response.data;
  },

  getSubmissions: async (): Promise<LearnerSubmissionResponse[]> => {
    const response =
      await axiosInstance.get<LearnerSubmissionResponse[]>("/submissions");
    return response.data;
  },

  getSubmission: async (
    submissionId: string,
  ): Promise<LearnerSubmissionResponse> => {
    const response = await axiosInstance.get<LearnerSubmissionResponse>(
      `/submissions/${submissionId}`,
    );
    return response.data;
  },

  requestReview: async (submissionId: string) => {
    const response = await axiosInstance.post(
      `/submissions/${submissionId}/request-review`,
    );
    return response.data;
  },

  getNotifications: async (): Promise<LearnerNotificationResponse[]> => {
    const response = await axiosInstance.get<LearnerNotificationResponse[]>(
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
};

export default LearnerService;
