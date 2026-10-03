export interface AIConfig {
  serviceName: string;
  enabled: boolean;
  modelName: string;
  endpoint: string;
  requestLimit: number;
  timeout: number;
  maxRetry: number;
  speakingEval: boolean;
  writingEval: boolean;
  cefrEval: boolean;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  serviceName: 'APTIS Evaluation Model',
  enabled: true,
  modelName: 'APTIS Evaluation Model',
  endpoint: 'https://api.example.com/ai/evaluate',
  requestLimit: 100,
  timeout: 30,
  maxRetry: 3,
  speakingEval: true,
  writingEval: true,
  cefrEval: true,
};
