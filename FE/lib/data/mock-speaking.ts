export type SpeakingPartId = 1 | 2 | 3 | 4;

export interface SpeakingQuestion {
  id: string;
  text: string;
  timeLimit: number;
}

export interface SpeakingPart {
  id: SpeakingPartId;
  title: string;
  subtitle: string;
  description: string;
  preparationTime: number;
  responseTime: number;
  questions: SpeakingQuestion[];
  imageUrl?: string;
  imageUrl2?: string;
}

export const SPEAKING_PARTS: SpeakingPart[] = [
  {
    id: 1,
    title: 'Part 1',
    subtitle: 'Personal Information',
    description: 'Trả lời các câu hỏi về bản thân, sở thích và những chủ đề quen thuộc.',
    preparationTime: 0,
    responseTime: 30,
    questions: [
      { id: 'p1q1', text: 'Tell me about your favourite hobby.', timeLimit: 30 },
      { id: 'p1q2', text: 'What do you usually do at weekends?', timeLimit: 30 },
      { id: 'p1q3', text: 'Tell me about a place you enjoy visiting.', timeLimit: 30 },
    ],
  },
  {
    id: 2,
    title: 'Part 2',
    subtitle: 'Describe & Give Opinions',
    description: 'Mô tả một bức ảnh, chia sẻ trải nghiệm và đưa ra ý kiến.',
    preparationTime: 0,
    responseTime: 45,
    imageUrl: 'https://images.pexels.com/photos/36763446/pexels-photo-36763446.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    questions: [
      { id: 'p2q1', text: 'Describe the photograph.', timeLimit: 45 },
      { id: 'p2q2', text: 'Tell me about a similar experience you have had.', timeLimit: 45 },
      { id: 'p2q3', text: 'What do you think about this kind of activity?', timeLimit: 45 },
    ],
  },
  {
    id: 3,
    title: 'Part 3',
    subtitle: 'Compare & Explain',
    description: 'Mô tả và so sánh hai hình ảnh, sau đó đưa ra ý kiến và giải thích.',
    preparationTime: 0,
    responseTime: 45,
    imageUrl: 'https://images.pexels.com/photos/20058449/pexels-photo-20058449.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageUrl2: 'https://images.pexels.com/photos/18035559/pexels-photo-18035559.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    questions: [
      { id: 'p3q1', text: 'Describe the two photographs.', timeLimit: 45 },
      { id: 'p3q2', text: 'Compare the two situations.', timeLimit: 45 },
      { id: 'p3q3', text: 'Which situation would you prefer and why?', timeLimit: 45 },
    ],
  },
  {
    id: 4,
    title: 'Part 4',
    subtitle: 'Discuss an Abstract Topic',
    description: 'Trả lời một chủ đề trừu tượng bằng một bài nói có cấu trúc.',
    preparationTime: 60,
    responseTime: 120,
    imageUrl: 'https://images.pexels.com/photos/38846534/pexels-photo-38846534.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    questions: [
      { id: 'p4q1', text: 'Tell me about a time when you achieved something important.', timeLimit: 120 },
      { id: 'p4q2', text: 'How did you feel about this achievement?', timeLimit: 120 },
      { id: 'p4q3', text: 'Do you think awards encourage people to do their best?', timeLimit: 120 },
    ],
  },
];

export interface SpeakingProgress {
  totalPracticed: number;
  avgScore: number;
  currentCEFR: string;
  mostPracticedPart: string;
  partProgress: { part: string; label: string; practiced: number; total: number }[];
}

export const MOCK_SPEAKING_PROGRESS: SpeakingProgress = {
  totalPracticed: 12,
  avgScore: 6.2,
  currentCEFR: 'B1',
  mostPracticedPart: 'Part 2',
  partProgress: [
    { part: 'Part 1', label: 'Part 1', practiced: 4, total: 6 },
    { part: 'Part 2', label: 'Part 2', practiced: 5, total: 6 },
    { part: 'Part 3', label: 'Part 3', practiced: 2, total: 6 },
    { part: 'Part 4', label: 'Part 4', practiced: 1, total: 6 },
  ],
};

export interface RecentSpeakingPractice {
  id: string;
  part: number;
  taskName: string;
  date: string;
  aiScore: number;
  cefr: string;
  status: 'AI_REVIEWED' | 'TEACHER_REVIEWED' | 'PROCESSING';
}

export const MOCK_RECENT_SPEAKING: RecentSpeakingPractice[] = [
  { id: 'rsp1', part: 2, taskName: 'Speaking Part 2', date: '23/09/2026', aiScore: 6.5, cefr: 'B1', status: 'TEACHER_REVIEWED' },
  { id: 'rsp2', part: 4, taskName: 'Speaking Part 4', date: '21/09/2026', aiScore: 5.5, cefr: 'A2', status: 'AI_REVIEWED' },
  { id: 'rsp3', part: 1, taskName: 'Speaking Part 1', date: '18/09/2026', aiScore: 6.0, cefr: 'B1', status: 'AI_REVIEWED' },
  { id: 'rsp4', part: 3, taskName: 'Speaking Part 3', date: '15/09/2026', aiScore: 5.8, cefr: 'A2', status: 'PROCESSING' },
];

export interface RubricScore {
  criterion: string;
  score: number;
}

export interface SpeakingResult {
  aiScore: number;
  cefr: string;
  rubric: RubricScore[];
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  transcript: { text: string; type: 'normal' | 'grammar' | 'vocabulary' | 'pronunciation' }[];
}

export const MOCK_SPEAKING_RESULT: SpeakingResult = {
  aiScore: 6.5,
  cefr: 'B1',
  rubric: [
    { criterion: 'Fluency', score: 6.0 },
    { criterion: 'Pronunciation', score: 6.5 },
    { criterion: 'Grammar', score: 6.0 },
    { criterion: 'Vocabulary', score: 7.0 },
    { criterion: 'Task Response', score: 6.5 },
  ],
  strengths: [
    'Vocabulary khá đa dạng',
    'Trả lời đúng trọng tâm',
  ],
  improvements: [
    'Fluency còn ngập ngừng',
    'Một số lỗi grammar',
    'Có thể mở rộng ý rõ hơn',
  ],
  suggestions: [
    'Thử sử dụng thêm linking words như because, however, for example...',
    'Luyện nói chậm lại để cải thiện pronunciation.',
    'Mở rộng câu trả lời bằng cách thêm ví dụ cá nhân.',
  ],
  transcript: [
    { text: 'My favourite hobby is ', type: 'normal' },
    { text: 'play', type: 'grammar' },
    { text: ' football. I usually ', type: 'normal' },
    { text: 'plays', type: 'grammar' },
    { text: ' it every weekend with my friends at the park near my house. I really enjoy it because it helps me relax and ', type: 'normal' },
    { text: 'keep fit', type: 'vocabulary' },
    { text: '. ', type: 'normal' },
    { text: 'Sometime', type: 'grammar' },
    { text: ' we also go swimming after the match.', type: 'normal' },
  ],
};

export interface TeacherReview {
  reviewed: boolean;
  teacherScore?: number;
  teacherCEFR?: string;
  feedback?: string;
}

export const MOCK_TEACHER_REVIEW: TeacherReview = {
  reviewed: true,
  teacherScore: 6.5,
  teacherCEFR: 'B1',
  feedback: 'Bạn đã trả lời đúng trọng tâm. Hãy cố gắng mở rộng ý và sử dụng linking words tự nhiên hơn. Luyện thêm Part 1 để cải thiện fluency.',
};
