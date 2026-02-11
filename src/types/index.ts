import { Id, Doc } from "../../convex/_generated/dataModel";

export type Page = "list" | "test";

export type QuestionType = "mcq" | "tf" | "ms" | "matching" | "fib";

export type QuestionStatus = "answered" | "unanswered";

export interface UserAnswer {
  questionId: Id<"questions">;
  selectedAnswers: string[];
  matchingAnswers?: string[];
  fillInBlankAnswer?: string[];
}

export interface MatchingPair {
  prompt: string;
  answer: string;
}

export interface DragItem {
  id: string;
  content: string;
  type: "prompt" | "answer";
}

export interface QuestionViewProps {
  question: Doc<"questions">;
  userAnswer: string[];
  onAnswerChange: (answer: string[]) => void;
  showFeedback?: boolean;
  isSubmitted?: boolean;
}

export interface MatchingQuestionProps {
  question: Doc<"questions">;
  userAnswer: string[];
  onAnswerChange: (answer: string[]) => void;
  showFeedback?: boolean;
  isSubmitted?: boolean;
}

export interface FillInBlankQuestionProps {
  question: Doc<"questions">;
  userAnswer: string[];
  onAnswerChange: (answer: string[]) => void;
  showFeedback?: boolean;
  isSubmitted?: boolean;
}

export interface QuestionNavProps {
  questions: Doc<"questions">[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  getQuestionStatus: (index: number) => QuestionStatus;
  isSubmitted: boolean;
}

export interface TestListPageProps {
  onStartTest: (testId: Id<"tests">) => void;
}

export interface PracticeTestPageProps {
  testId: Id<"tests">;
  onExitTest: () => void;
}

export interface Score {
  correct: number;
  total: number;
}

export interface Progress {
  current: number;
  total: number;
  percentage: number;
}
