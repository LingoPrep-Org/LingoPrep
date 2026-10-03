export type WritingTaskId = 1 | 2 | 3 | 4;

export interface WritingPrompt {
  id: string;
  scenario: string;
  recipient?: string;
  purpose?: string;
  instructions: string[];
  questions: string[];
}

export interface WritingTask {
  id: WritingTaskId;
  taskNumber: number;
  title: string;
  subtitle: string;
  description: string;
  estimatedTime: number;
  mockWordTargetMin: number;
  mockWordTargetMax: number;
  prompts: WritingPrompt[];
  checklist: string[];
}

export const WRITING_TASKS: WritingTask[] = [
  {
    id: 1,
    taskNumber: 1,
    title: 'Task 1',
    subtitle: 'Basic Writing',
    description: 'Luyện viết các câu trả lời ngắn theo tình huống được đưa ra.',
    estimatedTime: 10,
    mockWordTargetMin: 40,
    mockWordTargetMax: 50,
    checklist: [
      'Answer all questions',
      'Use appropriate vocabulary',
      'Organize your ideas clearly',
      'Check grammar before submitting',
    ],
    prompts: [
      {
        id: 't1p1',
        scenario: 'You are filling in a survey about your daily routine.',
        instructions: ['Write about your typical weekday morning.'],
        questions: [
          'What time do you usually wake up?',
          'What is the first thing you do in the morning?',
          'How do you get to work or school?',
        ],
      },
      {
        id: 't1p2',
        scenario: 'You are answering questions about your favourite food for a food blog.',
        instructions: ['Describe your favourite meal and why you enjoy it.'],
        questions: [
          'What is your favourite meal?',
          'How often do you eat it?',
          'Why do you like it so much?',
        ],
      },
    ],
  },
  {
    id: 2,
    taskNumber: 2,
    title: 'Task 2',
    subtitle: 'Short Message',
    description: 'Viết một tin nhắn phù hợp với người nhận và tình huống.',
    estimatedTime: 10,
    mockWordTargetMin: 40,
    mockWordTargetMax: 50,
    checklist: [
      'Answer all questions',
      'Use appropriate tone for the recipient',
      'Keep your message clear and concise',
      'Check grammar before submitting',
    ],
    prompts: [
      {
        id: 't2p1',
        scenario: 'You are a member of an English club. You cannot attend the next meeting.',
        recipient: 'Your friend, who is also in the club',
        purpose: 'Explain why you cannot attend and suggest another activity.',
        instructions: [
          'Write a message to your friend in the English club.',
          'Explain why you cannot attend the next meeting.',
          'Suggest another activity the club could do instead.',
        ],
        questions: [
          'Why can you not attend?',
          'What alternative activity do you suggest?',
        ],
      },
      {
        id: 't2p2',
        scenario: 'You bought a gift for your friend but forgot to bring it to their birthday party.',
        recipient: 'Your friend',
        purpose: 'Apologise and explain what happened.',
        instructions: [
          'Write a message to your friend.',
          'Apologise for forgetting the gift.',
          'Explain what happened and when you will give it to them.',
        ],
        questions: [
          'What is your apology?',
          'When will you give them the gift?',
        ],
      },
    ],
  },
  {
    id: 3,
    taskNumber: 3,
    title: 'Task 3',
    subtitle: 'Respond & Develop',
    description: 'Phản hồi thông tin và phát triển nội dung rõ ràng hơn.',
    estimatedTime: 15,
    mockWordTargetMin: 60,
    mockWordTargetMax: 80,
    checklist: [
      'Answer all questions',
      'Use appropriate vocabulary',
      'Develop your ideas with examples',
      'Organize your ideas clearly',
    ],
    prompts: [
      {
        id: 't3p1',
        scenario: 'You read an article about working from home and want to share your opinion.',
        recipient: 'The article\'s online discussion forum',
        purpose: 'Respond to the article and develop your viewpoint.',
        instructions: [
          'Write your response to the article.',
          'Express your opinion about working from home.',
          'Give at least one reason and one example to support your view.',
        ],
        questions: [
          'What is your opinion on working from home?',
          'Can you give an example from your experience?',
        ],
      },
      {
        id: 't3p2',
        scenario: 'Your local community centre sent a survey about improving the neighbourhood.',
        recipient: 'The community centre',
        purpose: 'Respond with your suggestions and explain why they matter.',
        instructions: [
          'Write your response to the survey.',
          'Suggest one improvement for your neighbourhood.',
          'Explain why this improvement is important.',
        ],
        questions: [
          'What improvement do you suggest?',
          'Why is it important to you and your neighbours?',
        ],
      },
    ],
  },
  {
    id: 4,
    taskNumber: 4,
    title: 'Task 4',
    subtitle: 'Extended Writing',
    description: 'Viết một bài dài hơn với ý tưởng, lập luận và cấu trúc rõ ràng.',
    estimatedTime: 25,
    mockWordTargetMin: 120,
    mockWordTargetMax: 150,
    checklist: [
      'Answer all questions',
      'Organize your writing into clear paragraphs',
      'Use linking words to connect your ideas',
      'Check grammar and vocabulary before submitting',
    ],
    prompts: [
      {
        id: 't4p1',
        scenario: 'Your school is organising a debate on the topic: "Social media does more harm than good."',
        instructions: [
          'Write an essay expressing your opinion on the topic.',
          'Include an introduction, body paragraphs, and a conclusion.',
          'Support your arguments with reasons and examples.',
        ],
        questions: [
          'Do you agree or disagree with the statement?',
          'What are your main reasons?',
          'Can you give examples to support your view?',
        ],
      },
      {
        id: 't4p2',
        scenario: 'You are applying for a volunteer programme and need to write a personal statement.',
        instructions: [
          'Write about why you want to join the programme.',
          'Describe a personal experience that shows you are suitable.',
          'Explain what you hope to gain from the experience.',
        ],
        questions: [
          'Why do you want to volunteer?',
          'What relevant experience do you have?',
          'What do you hope to learn or achieve?',
        ],
      },
    ],
  },
];

export interface WritingProgress {
  totalPracticed: number;
  avgScore: number;
  currentCEFR: string;
  tasksCompleted: string;
  taskProgress: { label: string; practiced: number; total: number }[];
}

export const MOCK_WRITING_PROGRESS: WritingProgress = {
  totalPracticed: 12,
  avgScore: 6.5,
  currentCEFR: 'B1',
  tasksCompleted: '4/4',
  taskProgress: [
    { label: 'Task 1', practiced: 4, total: 6 },
    { label: 'Task 2', practiced: 3, total: 6 },
    { label: 'Task 3', practiced: 3, total: 6 },
    { label: 'Task 4', practiced: 2, total: 6 },
  ],
};

export interface RecentWritingPractice {
  id: string;
  taskNumber: number;
  taskName: string;
  date: string;
  wordCount: number;
  aiScore: number;
  cefr: string;
  status: 'AI_REVIEWED' | 'TEACHER_REVIEWED' | 'PROCESSING';
}

export const MOCK_RECENT_WRITING: RecentWritingPractice[] = [
  { id: 'rwp1', taskNumber: 3, taskName: 'Writing Task 3', date: '22/09/2026', wordCount: 75, aiScore: 6.0, cefr: 'B1', status: 'AI_REVIEWED' },
  { id: 'rwp2', taskNumber: 1, taskName: 'Writing Task 1', date: '20/09/2026', wordCount: 48, aiScore: 6.5, cefr: 'B1', status: 'TEACHER_REVIEWED' },
  { id: 'rwp3', taskNumber: 4, taskName: 'Writing Task 4', date: '17/09/2026', wordCount: 135, aiScore: 5.5, cefr: 'A2', status: 'AI_REVIEWED' },
  { id: 'rwp4', taskNumber: 2, taskName: 'Writing Task 2', date: '14/09/2026', wordCount: 42, aiScore: 0, cefr: '—', status: 'PROCESSING' },
];

export interface WritingRubricScore {
  criterion: string;
  score: number;
}

export interface InlineFeedbackItem {
  original: string;
  suggestion: string;
  type: 'grammar' | 'vocabulary' | 'coherence';
  explanation: string;
}

export interface WritingResult {
  aiScore: number;
  cefr: string;
  status: 'AI_REVIEWED';
  rubric: WritingRubricScore[];
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  inlineFeedback: InlineFeedbackItem[];
}

export interface WritingTeacherReview {
  reviewed: boolean;
  teacherScore?: number;
  teacherCEFR?: string;
  feedback?: string;
}

export interface WritingSubmission {
  id: string;
  taskNumber: number;
  taskTitle: string;
  promptId: string;
  answer: string;
  wordCount: number;
  submittedAt: string;
  result: WritingResult;
  teacherReview: WritingTeacherReview;
}

export const MOCK_WRITING_RESULT: WritingResult = {
  aiScore: 6.5,
  cefr: 'B1',
  status: 'AI_REVIEWED',
  rubric: [
    { criterion: 'Task Response', score: 6.5 },
    { criterion: 'Grammar', score: 6.0 },
    { criterion: 'Vocabulary', score: 7.0 },
    { criterion: 'Coherence', score: 6.5 },
  ],
  strengths: [
    'Trả lời đầy đủ yêu cầu của đề.',
    'Vocabulary phù hợp với chủ đề.',
    'Ý tưởng được trình bày khá rõ.',
  ],
  improvements: [
    'Một số câu có lỗi grammar.',
    'Có thể sử dụng linking words tốt hơn.',
    'Một số ý cần được phát triển thêm.',
  ],
  suggestions: [
    'Thử luyện cách nối hai ý bằng because, however, therefore và for example.',
    'Kiểm tra lại thì của động từ trước khi nộp bài.',
    'Mỗi đoạn nên có một câu chủ đề (topic sentence) rõ ràng.',
  ],
  inlineFeedback: [
    {
      original: 'I am agree with this idea.',
      suggestion: 'I agree with this idea.',
      type: 'grammar',
      explanation: 'Sau "agree" không cần "am" vì "agree" là động từ thường.',
    },
    {
      original: 'It is very good.',
      suggestion: 'It is highly beneficial.',
      type: 'vocabulary',
      explanation: 'Thay "very good" bằng từ cụ thể hơn để tăng điểm Vocabulary.',
    },
    {
      original: 'I like it. Because it is fun.',
      suggestion: 'I like it because it is fun.',
      type: 'coherence',
      explanation: 'Không nên tách "Because" thành câu riêng — nối lại để tăng Coherence.',
    },
  ],
};

export const MOCK_WRITING_SUBMISSIONS: WritingSubmission[] = [
  {
    id: 'ws1',
    taskNumber: 3,
    taskTitle: 'Writing Task 3',
    promptId: 't3p1',
    answer: 'I think working from home is a great idea. I am agree with this idea because it saves time and money. For example, I don\'t need to travel every day. It is very good. I can spend more time with my family. However, sometimes I feel lonely at home. I like it. Because it is fun to work with colleagues in the office too.',
    wordCount: 72,
    submittedAt: '22/09/2026 14:30',
    result: MOCK_WRITING_RESULT,
    teacherReview: { reviewed: false },
  },
  {
    id: 'ws2',
    taskNumber: 1,
    taskTitle: 'Writing Task 1',
    promptId: 't1p1',
    answer: 'I usually wake up at 6:30 in the morning. The first thing I do is brush my teeth and wash my face. Then I have breakfast with my family. I get to school by bus. It takes about 20 minutes.',
    wordCount: 48,
    submittedAt: '20/09/2026 09:15',
    result: {
      aiScore: 6.5,
      cefr: 'B1',
      status: 'AI_REVIEWED',
      rubric: [
        { criterion: 'Task Response', score: 7.0 },
        { criterion: 'Grammar', score: 6.5 },
        { criterion: 'Vocabulary', score: 6.0 },
        { criterion: 'Coherence', score: 6.5 },
      ],
      strengths: ['Trả lời đầy đủ cả 3 câu hỏi.', 'Câu đơn rõ ràng, dễ hiểu.'],
      improvements: ['Có thể dùng từ nối phong phú hơn.', 'Thêm chi tiết để bài viết sinh động hơn.'],
      suggestions: ['Thử thêm từ nối như "after that" hoặc "then" để liên kết câu.'],
      inlineFeedback: [],
    },
    teacherReview: {
      reviewed: true,
      teacherScore: 7.0,
      teacherCEFR: 'B1+',
      feedback: 'Your response addresses the task clearly. Try to develop your supporting ideas in more detail.',
    },
  },
];

export function getWritingSubmission(id: string): WritingSubmission | undefined {
  return MOCK_WRITING_SUBMISSIONS.find((s) => s.id === id);
}
