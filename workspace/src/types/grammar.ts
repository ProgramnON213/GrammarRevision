export type Question = {
  category: string;
  subcategory: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type QuestionId = string;

export type ParsedQuestion = {
  id: QuestionId;
  question: Question;
};

export type ParseIssue = {
  fileName: string;
  itemIndex: number;
  message: string;
  rawPreview?: string;
};

export type SessionMode = "all" | "missed";

export type PracticeConfig = {
  category: string | null;
  subcategory: string | null;
  questionCount: number;
  mode: SessionMode;
  revealExplanation: boolean;
};

export type PracticeSession = {
  config: PracticeConfig;
  questionIds: QuestionId[];
  index: number;
  answered: Record<QuestionId, { chosen: string; correct: boolean }>;
  finishedAt: string | null;
};

export type ProgressSnapshotV1 = {
  version: 1;
  answered: Record<QuestionId, { attempts: number; correct: number; lastAnsweredAt: string }>;
  missed: Record<QuestionId, { count: number; lastMissedAt: string }>;
};
