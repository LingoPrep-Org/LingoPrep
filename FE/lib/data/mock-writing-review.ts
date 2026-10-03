export interface WritingSubmission {
  id: string;
  learnerName: string;
  task: string;
  taskLabel: string;
  topic: string;
  prompt: string;
  submittedAt: string;
  status: string;
  statusLabel: string;
  aiScore: number;
  cefr: string;
}

export const MOCK_WRITING_SUBMISSION: WritingSubmission = {
  id: 's002',
  learnerName: 'Nguyễn Hoàng Nam',
  task: 'TASK_3',
  taskLabel: 'Task 3',
  topic: 'Technology & Education',
  prompt: 'Some people believe that technology has improved education, while others argue it has made students less focused. Discuss both views and give your own opinion. Write at least 150 words.',
  submittedAt: '23/09/2026 18:45',
  status: 'NEEDS_RECHECK',
  statusLabel: 'Cần giáo viên kiểm tra',
  aiScore: 7.0,
  cefr: 'B2',
};

export interface WritingAnswer {
  text: string;
  wordCount: number;
  paragraphs: number;
}

export const MOCK_WRITING_ANSWER: WritingAnswer = {
  text: `Technology has become an important part of modern education. While some people believe it has greatly improved learning, others argue that it makes students less focused. In this essay, I will discuss both views and share my opinion.

On one hand, technology provides students with access to a huge amount of information. With the internet, learners can find resources quickly and study at their own pace. Online courses and educational apps also make learning more flexible and convenient.

On the other hand, technology can be a source of distraction. Many students spend too much time on social media instead of studying. Additionally, excessive use of computers may reduce face-to-face interaction between students and teachers.

In my opinion, technology is a powerful tool for education, but it must be used wisely. Schools should guide students on how to use technology effectively and set clear rules to avoid distraction.

In conclusion, technology has both positive and negative effects on education. The key is to find a balance between using technology and maintaining traditional learning methods.`,
  wordCount: 168,
  paragraphs: 5,
};

export interface WritingCriterion {
  name: string;
  score: number;
}

export const MOCK_WRITING_CRITERIA: WritingCriterion[] = [
  { name: 'Task Response', score: 7.0 },
  { name: 'Grammar', score: 6.5 },
  { name: 'Vocabulary', score: 7.0 },
  { name: 'Coherence', score: 7.0 },
];

export interface AIFeedback {
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

export const MOCK_WRITING_AI_FEEDBACK: AIFeedback = {
  strengths: [
    'Nội dung đáp ứng chủ đề.',
    'Từ vựng tương đối phù hợp.',
    'Bố cục bài viết rõ ràng.',
  ],
  improvements: [
    'Một số lỗi ngữ pháp.',
    'Có thể sử dụng từ nối đa dạng hơn.',
    'Một số câu cần diễn đạt tự nhiên hơn.',
  ],
  suggestions: [
    'Kiểm tra lại thì của động từ.',
    'Sử dụng thêm các cấu trúc câu phức.',
    'Liên kết các ý rõ hơn.',
  ],
};

export const MOCK_WRITING_AUDIT = {
  aiEvaluatedAt: '23/09/2026 18:48',
  teacherEvaluatedAt: 'Chưa đánh giá',
  aiVersion: 'Demo AI v1',
};
