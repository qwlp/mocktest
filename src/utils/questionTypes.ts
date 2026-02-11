import { QuestionType } from "../types";

export function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    mcq: "Multiple Choice",
    tf: "True / False",
    ms: "Multiple Select",
    matching: "Matching",
    fib: "Fill in Blank",
  };
  return labels[type];
}

export function getQuestionTypeIcon(type: QuestionType): string {
  const icons: Record<QuestionType, string> = {
    mcq: "○",
    tf: "✓",
    ms: "☐",
    matching: "⇄",
    fib: "✎",
  };
  return icons[type];
}

export function getQuestionTypeShortcut(type: QuestionType): string {
  const shortcuts: Record<QuestionType, string> = {
    mcq: "Alt + M",
    tf: "Alt + T",
    ms: "Alt + S",
    matching: "Alt + A",
    fib: "Alt + I",
  };
  return shortcuts[type];
}
