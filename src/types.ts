export type QuestionType = 'RADIO' | 'CHECKBOX' | 'DROP_DOWN' | 'TEXT' | 'PARAGRAPH';

export interface Question {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  options?: string[];
  correctAnswers?: string[];
  pointValue?: number;
  explanation?: string;
  required?: boolean;
}

export interface ExamData {
  title: string;
  description?: string;
  isQuiz: boolean;
  shuffleQuestions?: boolean;
  collectEmail?: boolean;
  questions: Question[];
}

export interface FormPublishResult {
  formId: string;
  title: string;
  responderUri: string;
  editUri: string;
  createdAt: string;
  questionCount: number;
  totalPoints: number;
}

export interface ParseProgress {
  status: 'idle' | 'reading_file' | 'ai_analyzing' | 'done' | 'error';
  message: string;
  percent?: number;
}
