export interface SpeakingSubmission {
  id: string;
  learnerName: string;
  task: string;
  taskLabel: string;
  topic: string;
  question: string;
  submittedAt: string;
  status: string;
  statusLabel: string;
  aiScore: number;
  cefr: string;
  audioDuration: string;
  audioDurationSeconds: number;
}

export const MOCK_SPEAKING_SUBMISSION: SpeakingSubmission = {
  id: 's001',
  learnerName: 'Nguyễn Minh Anh',
  task: 'TASK_2',
  taskLabel: 'Task 2',
  topic: 'Daily Life',
  question: 'Describe a memorable activity you did with your friends. You should say what the activity was, when and where it happened, who you did it with, and explain why it was memorable.',
  submittedAt: '23/09/2026 19:30',
  status: 'NEEDS_RECHECK',
  statusLabel: 'Cần giáo viên kiểm tra',
  aiScore: 6.5,
  cefr: 'B1',
  audioDuration: '01:15',
  audioDurationSeconds: 75,
};

export interface SpeakingTranscript {
  text: string;
  confidence: number;
}

export const MOCK_TRANSCRIPT: SpeakingTranscript = {
  text: 'Last weekend, I went to the park with my friends. We had a small picnic near the lake. The weather was very nice and sunny. We brought some sandwiches, fruits, and drinks. My friend brought a guitar and played some songs. We sang together and laughed a lot. It was memorable because we had not seen each other for a long time. I felt very happy and relaxed. I hope we can do it again soon.',
  confidence: 94,
};

export interface SpeakingCriterion {
  name: string;
  score: number;
}

export const MOCK_SPEAKING_CRITERIA: SpeakingCriterion[] = [
  { name: 'Fluency', score: 6.5 },
  { name: 'Pronunciation', score: 6.0 },
  { name: 'Grammar', score: 6.5 },
  { name: 'Vocabulary', score: 6.0 },
  { name: 'Task Response', score: 7.0 },
];

export interface AIFeedback {
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

export const MOCK_SPEAKING_AI_FEEDBACK: AIFeedback = {
  strengths: [
    'Trả lời đúng chủ đề.',
    'Ý tưởng tương đối rõ ràng.',
    'Sử dụng được một số từ vựng phù hợp.',
  ],
  improvements: [
    'Cần cải thiện độ trôi chảy.',
    'Một số câu còn đơn giản.',
    'Cần sử dụng đa dạng cấu trúc câu hơn.',
  ],
  suggestions: [
    'Thử mở rộng câu trả lời bằng ví dụ cụ thể.',
    'Sử dụng thêm từ nối.',
    'Luyện nói liên tục trong thời gian quy định.',
  ],
};

export const MOCK_SPEAKING_AUDIT = {
  aiEvaluatedAt: '23/09/2026 19:32',
  teacherEvaluatedAt: 'Chưa đánh giá',
  aiVersion: 'Demo AI v1',
};

export const CEFR_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CEFRLevel = (typeof CEFR_OPTIONS)[number];
