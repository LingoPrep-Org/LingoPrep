export type Skill = "SPEAKING" | "WRITING";

export type AssignmentStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "OVERDUE";

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  NOT_STARTED: "Chưa làm",
  IN_PROGRESS: "Đang làm",
  SUBMITTED: "Đã nộp",
  OVERDUE: "Quá hạn",
};

export type SubmissionStatus =
  | "PROCESSING"
  | "AI_REVIEWED"
  | "TEACHER_REVIEWED";

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  PROCESSING: "Đang xử lý",
  AI_REVIEWED: "Đã đánh giá",
  TEACHER_REVIEWED: "Đã được Teacher review",
};

export interface Assignment {
  id: string;
  title: string;
  skill: Skill;
  task: string;
  taskNumber: number;
  description: string;
  teacherName: string;
  assignedAt: string;
  deadline: string | null;
  duration: string;
  status: AssignmentStatus;
  progress: number;
  submissionId?: string;
}

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg1",
    title: "Speaking Practice — Part 1",
    skill: "SPEAKING",
    task: "Part 1",
    taskNumber: 1,
    description:
      "Luyện trả lời 3 câu hỏi về bản thân. Mỗi câu trả lời tối đa 30 giây.",
    teacherName: "Trần Giáo Viên",
    assignedAt: "25/09/2026",
    deadline: "02/10/2026",
    duration: "~10 phút",
    status: "NOT_STARTED",
    progress: 0,
  },
  {
    id: "asg2",
    title: "Speaking Practice — Part 2",
    skill: "SPEAKING",
    task: "Part 2",
    taskNumber: 2,
    description:
      "Mô tả một bức ảnh và đưa ra ý kiến. Mỗi câu trả lời tối đa 45 giây.",
    teacherName: "Trần Giáo Viên",
    assignedAt: "25/09/2026",
    deadline: "02/10/2026",
    duration: "~15 phút",
    status: "IN_PROGRESS",
    progress: 33,
    submissionId: "sub-sp2",
  },
  {
    id: "asg3",
    title: "Speaking Practice — Part 3",
    skill: "SPEAKING",
    task: "Part 3",
    taskNumber: 3,
    description:
      "So sánh hai bức ảnh và đưa ra ý kiến. Mỗi câu trả lời tối đa 45 giây.",
    teacherName: "Trần Giáo Viên",
    assignedAt: "24/09/2026",
    deadline: "01/10/2026",
    duration: "~15 phút",
    status: "SUBMITTED",
    progress: 100,
    submissionId: "sub-sp3",
  },
  {
    id: "asg4",
    title: "Speaking Practice — Part 4",
    skill: "SPEAKING",
    task: "Part 4",
    taskNumber: 4,
    description:
      "Thảo luận một chủ đề trừu tượng. Chuẩn bị 1 phút, nói 2 phút.",
    teacherName: "Trần Giáo Viên",
    assignedAt: "23/09/2026",
    deadline: "28/09/2026",
    duration: "~20 phút",
    status: "OVERDUE",
    progress: 0,
  },
  {
    id: "asg5",
    title: "Writing Practice — Task 1",
    skill: "WRITING",
    task: "Task 1",
    taskNumber: 1,
    description:
      "Luyện viết câu trả lời ngắn theo tình huống. Mục tiêu: 40–50 từ.",
    teacherName: "Trần Giáo Viên",
    assignedAt: "25/09/2026",
    deadline: "03/10/2026",
    duration: "~10 phút",
    status: "SUBMITTED",
    progress: 100,
    submissionId: "sub-wr1",
  },
  {
    id: "asg6",
    title: "Writing Practice — Task 2",
    skill: "WRITING",
    task: "Task 2",
    taskNumber: 2,
    description:
      "Viết một tin nhắn phù hợp với người nhận và tình huống. Mục tiêu: 40–50 từ.",
    teacherName: "Trần Giáo Viên",
    assignedAt: "24/09/2026",
    deadline: "01/10/2026",
    duration: "~10 phút",
    status: "NOT_STARTED",
    progress: 0,
  },
  {
    id: "asg7",
    title: "Writing Practice — Task 3",
    skill: "WRITING",
    task: "Task 3",
    taskNumber: 3,
    description:
      "Phản hồi thông tin và phát triển nội dung. Mục tiêu: 60–80 từ.",
    teacherName: "Trần Giáo Viên",
    assignedAt: "22/09/2026",
    deadline: "29/09/2026",
    duration: "~15 phút",
    status: "SUBMITTED",
    progress: 100,
    submissionId: "sub-wr3",
  },
  {
    id: "asg8",
    title: "Writing Practice — Task 4",
    skill: "WRITING",
    task: "Task 4",
    taskNumber: 4,
    description:
      "Viết bài dài với lập luận và cấu trúc rõ ràng. Mục tiêu: 120–150 từ.",
    teacherName: "Trần Giáo Viên",
    assignedAt: "21/09/2026",
    deadline: "28/09/2026",
    duration: "~25 phút",
    status: "IN_PROGRESS",
    progress: 50,
  },
];

export interface RubricScore {
  criterion: string;
  score: number;
}

export interface AIFeedback {
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

export interface TeacherReview {
  reviewed: boolean;
  teacherScore?: number;
  teacherCEFR?: string;
  feedback?: string;
  reviewDate?: string;
  reviewRequested?: boolean;
}

export interface UnifiedSubmission {
  id: string;
  assignmentId?: string;
  skill: Skill;
  task: string;
  taskNumber: number;
  title: string;
  submittedAt: string;
  status: SubmissionStatus;
  aiScore?: number;
  cefr?: string;
  rubric: RubricScore[];
  aiFeedback: AIFeedback;
  teacherReview: TeacherReview;
  audioDuration?: string;
  audioPath?: string;
  transcript?: {
    text: string;
    type: "normal" | "grammar" | "vocabulary" | "pronunciation";
  }[];
  writingContent?: string;
  wordCount?: number;
  processingStep?: number;
}

export const MOCK_UNIFIED_SUBMISSIONS: UnifiedSubmission[] = [
  {
    id: "sub-sp2",
    assignmentId: "asg2",
    skill: "SPEAKING",
    task: "Part 2",
    taskNumber: 2,
    title: "Speaking Part 2",
    submittedAt: "30/09/2026 19:30",
    status: "TEACHER_REVIEWED",
    aiScore: 6.5,
    cefr: "B1",
    rubric: [
      { criterion: "Fluency", score: 6.0 },
      { criterion: "Pronunciation", score: 6.5 },
      { criterion: "Grammar", score: 6.0 },
      { criterion: "Vocabulary", score: 7.0 },
      { criterion: "Task Response", score: 6.5 },
    ],
    aiFeedback: {
      strengths: ["Vocabulary khá đa dạng", "Trả lời đúng trọng tâm"],
      improvements: [
        "Fluency còn ngập ngừng",
        "Một số lỗi grammar",
        "Có thể mở rộng ý rõ hơn",
      ],
      suggestions: [
        "Thử sử dụng thêm linking words như because, however, for example...",
        "Luyện nói chậm lại để cải thiện pronunciation.",
        "Mở rộng câu trả lời bằng cách thêm ví dụ cá nhân.",
      ],
    },
    teacherReview: {
      reviewed: true,
      teacherScore: 6.5,
      teacherCEFR: "B1",
      feedback:
        "Bạn đã trả lời đúng trọng tâm. Hãy cố gắng mở rộng ý và sử dụng linking words tự nhiên hơn.",
      reviewDate: "01/10/2026",
    },
    audioDuration: "00:42 / 00:45",
    transcript: [
      { text: "In this photo, I can see ", type: "normal" },
      { text: "a group of friends", type: "vocabulary" },
      { text: " sitting in a park. They are ", type: "normal" },
      { text: "enjoying", type: "grammar" },
      {
        text: " a sunny day. One person is playing the guitar. ",
        type: "normal",
      },
      { text: "I think", type: "normal" },
      { text: "they are feeling", type: "pronunciation" },
      { text: " very happy and relaxed.", type: "normal" },
    ],
  },
  {
    id: "sub-sp3",
    assignmentId: "asg3",
    skill: "SPEAKING",
    task: "Part 3",
    taskNumber: 3,
    title: "Speaking Part 3",
    submittedAt: "29/09/2026 20:15",
    status: "AI_REVIEWED",
    aiScore: 5.8,
    cefr: "A2",
    rubric: [
      { criterion: "Fluency", score: 5.5 },
      { criterion: "Pronunciation", score: 6.0 },
      { criterion: "Grammar", score: 5.5 },
      { criterion: "Vocabulary", score: 6.0 },
      { criterion: "Task Response", score: 6.0 },
    ],
    aiFeedback: {
      strengths: ["Cấu trúc câu khá ổn", "Trả lời đủ 3 câu hỏi"],
      improvements: [
        "Cần luyện thêm từ vựng so sánh",
        "Fluency còn ngập ngừng ở câu 2",
      ],
      suggestions: [
        'Luyện các từ so sánh như "whereas", "while", "on the other hand".',
        "Thử nói chậm lại để giảm lỗi grammar.",
      ],
    },
    teacherReview: { reviewed: false },
    audioDuration: "00:38 / 00:45",
    transcript: [
      { text: "The two photos show ", type: "normal" },
      { text: "different", type: "vocabulary" },
      {
        text: " places. The first one is a market, and the second one is a shopping street. ",
        type: "normal",
      },
      { text: "I prefer", type: "normal" },
      { text: "the market", type: "pronunciation" },
      { text: " because it is more lively.", type: "normal" },
    ],
  },
  {
    id: "sub-wr1",
    assignmentId: "asg5",
    skill: "WRITING",
    task: "Task 1",
    taskNumber: 1,
    title: "Writing Task 1",
    submittedAt: "30/09/2026 09:15",
    status: "TEACHER_REVIEWED",
    aiScore: 6.5,
    cefr: "B1",
    rubric: [
      { criterion: "Task Response", score: 7.0 },
      { criterion: "Grammar", score: 6.5 },
      { criterion: "Vocabulary", score: 6.0 },
      { criterion: "Coherence", score: 6.5 },
    ],
    aiFeedback: {
      strengths: ["Trả lời đầy đủ cả 3 câu hỏi", "Câu đơn rõ ràng, dễ hiểu"],
      improvements: [
        "Có thể dùng từ nối phong phú hơn",
        "Thêm chi tiết để bài viết sinh động hơn",
      ],
      suggestions: [
        'Thử thêm từ nối như "after that" hoặc "then" để liên kết câu.',
      ],
    },
    teacherReview: {
      reviewed: true,
      teacherScore: 7.0,
      teacherCEFR: "B1+",
      feedback:
        "Your response addresses the task clearly. Try to develop your supporting ideas in more detail.",
      reviewDate: "01/10/2026",
    },
    writingContent:
      "I usually wake up at 6:30 in the morning. The first thing I do is brush my teeth and wash my face. Then I have breakfast with my family. I get to school by bus. It takes about 20 minutes.",
    wordCount: 48,
  },
  {
    id: "sub-wr3",
    assignmentId: "asg7",
    skill: "WRITING",
    task: "Task 3",
    taskNumber: 3,
    title: "Writing Task 3",
    submittedAt: "29/09/2026 14:30",
    status: "AI_REVIEWED",
    aiScore: 6.0,
    cefr: "B1",
    rubric: [
      { criterion: "Task Response", score: 6.5 },
      { criterion: "Grammar", score: 5.5 },
      { criterion: "Vocabulary", score: 6.5 },
      { criterion: "Coherence", score: 6.0 },
    ],
    aiFeedback: {
      strengths: [
        "Trả lời đầy đủ yêu cầu của đề",
        "Vocabulary phù hợp với chủ đề",
        "Ý tưởng được trình bày khá rõ",
      ],
      improvements: [
        "Một số câu có lỗi grammar",
        "Có thể sử dụng linking words tốt hơn",
        "Một số ý cần được phát triển thêm",
      ],
      suggestions: [
        "Thử luyện cách nối hai ý bằng because, however, therefore và for example.",
        "Kiểm tra lại thì của động từ trước khi nộp bài.",
        "Mỗi đoạn nên có một câu chủ đề (topic sentence) rõ ràng.",
      ],
    },
    teacherReview: { reviewed: false, reviewRequested: true },
    writingContent:
      "I think working from home is a great idea. I am agree with this idea because it saves time and money. For example, I don't need to travel every day. It is very good. I can spend more time with my family. However, sometimes I feel lonely at home. I like it. Because it is fun to work with colleagues in the office too.",
    wordCount: 72,
  },
  {
    id: "sub-sp1",
    skill: "SPEAKING",
    task: "Part 1",
    taskNumber: 1,
    title: "Speaking Part 1",
    submittedAt: "28/09/2026 18:00",
    status: "PROCESSING",
    rubric: [],
    aiFeedback: { strengths: [], improvements: [], suggestions: [] },
    teacherReview: { reviewed: false },
    audioDuration: "00:28 / 00:30",
    processingStep: 1,
  },
  {
    id: "sub-sp4",
    skill: "SPEAKING",
    task: "Part 4",
    taskNumber: 4,
    title: "Speaking Part 4",
    submittedAt: "27/09/2026 21:00",
    status: "AI_REVIEWED",
    aiScore: 5.5,
    cefr: "A2",
    rubric: [
      { criterion: "Fluency", score: 5.0 },
      { criterion: "Pronunciation", score: 5.5 },
      { criterion: "Grammar", score: 5.0 },
      { criterion: "Vocabulary", score: 6.0 },
      { criterion: "Task Response", score: 6.0 },
    ],
    aiFeedback: {
      strengths: ["Trả lời đủ 3 câu hỏi", "Có ý tưởng cá nhân"],
      improvements: [
        "Cần cải thiện fluency",
        "Grammar còn nhiều lỗi",
        "Nên tổ chức bài nói rõ hơn",
      ],
      suggestions: [
        "Luyện structured speaking: introduction → body → conclusion.",
        'Sử dụng signposting words như "firstly", "secondly", "in conclusion".',
      ],
    },
    teacherReview: { reviewed: false },
    audioDuration: "01:55 / 02:00",
    transcript: [
      { text: "I want to tell you about ", type: "normal" },
      { text: "a time", type: "pronunciation" },
      { text: " when I ", type: "normal" },
      { text: "achieved", type: "vocabulary" },
      { text: " something important. It was ", type: "normal" },
      { text: "when I", type: "grammar" },
      {
        text: " passed my English exam last year. I felt very proud.",
        type: "normal",
      },
    ],
  },
  {
    id: "sub-wr2",
    skill: "WRITING",
    task: "Task 2",
    taskNumber: 2,
    title: "Writing Task 2",
    submittedAt: "26/09/2026 16:45",
    status: "AI_REVIEWED",
    aiScore: 6.0,
    cefr: "B1",
    rubric: [
      { criterion: "Task Response", score: 6.5 },
      { criterion: "Grammar", score: 5.5 },
      { criterion: "Vocabulary", score: 6.0 },
      { criterion: "Coherence", score: 6.0 },
    ],
    aiFeedback: {
      strengths: ["Tin nhắn phù hợp với người nhận", "Trả lời đủ yêu cầu"],
      improvements: ["Một số lỗi grammar", "Có thể dùng từ trang trọng hơn"],
      suggestions: ["Kiểm tra lại giới từ trước khi nộp bài."],
    },
    teacherReview: { reviewed: false },
    writingContent:
      "Hi Mai, I'm sorry I can't come to the English club meeting tomorrow. I have a doctor appointment. Can we do a movie night instead next Friday? Let me know what you think. Cheers!",
    wordCount: 42,
  },
  {
    id: "sub-wr4",
    skill: "WRITING",
    task: "Task 4",
    taskNumber: 4,
    title: "Writing Task 4",
    submittedAt: "25/09/2026 22:00",
    status: "AI_REVIEWED",
    aiScore: 5.5,
    cefr: "A2",
    rubric: [
      { criterion: "Task Response", score: 6.0 },
      { criterion: "Grammar", score: 5.0 },
      { criterion: "Vocabulary", score: 5.5 },
      { criterion: "Coherence", score: 5.5 },
    ],
    aiFeedback: {
      strengths: ["Có luận điểm rõ ràng", "Bài viết đủ độ dài"],
      improvements: [
        "Grammar cần cải thiện nhiều",
        "Thiếu linking words giữa các đoạn",
        "Kết luận chưa rõ ràng",
      ],
      suggestions: [
        "Luyện viết topic sentence cho mỗi đoạn.",
        "Sử dụng however, therefore, in addition để nối đoạn.",
      ],
    },
    teacherReview: { reviewed: false },
    writingContent:
      "I think social media has both good and bad sides. On one hand, it helps people connect with friends. On the other hand, it can be addictive. For example, many students spend too much time on Facebook. They cannot focus on studying. In my opinion, social media is useful but we need to use it carefully. We should set a time limit every day.",
    wordCount: 68,
  },
];

export function getAssignment(id: string): Assignment | undefined {
  return MOCK_ASSIGNMENTS.find((a) => a.id === id);
}

export function getUnifiedSubmission(
  id: string,
): UnifiedSubmission | undefined {
  return MOCK_UNIFIED_SUBMISSIONS.find((s) => s.id === id);
}
