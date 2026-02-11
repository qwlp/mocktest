type FeedbackType = "correct" | "incorrect" | "missed" | null;

interface OptionClassesConfig {
  isSelected: boolean;
  isSubmitted: boolean;
  feedback: FeedbackType;
}

export function getOptionClassName({
  isSelected,
  isSubmitted,
  feedback,
}: OptionClassesConfig): string {
  let classes = "p-4 rounded-lg border-2 transition-all duration-200 ";

  if (isSubmitted) {
    classes += "cursor-default ";
  } else {
    classes +=
      "cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] ";
  }

  if (feedback === "correct") {
    classes +=
      "bg-[var(--color-success-light)] border-[var(--color-success)] text-[var(--color-text)] ";
  } else if (feedback === "incorrect") {
    classes +=
      "bg-[var(--color-error-light)] border-[var(--color-error)] text-[var(--color-text)] ";
  } else if (feedback === "missed") {
    classes +=
      "bg-[var(--color-warning-light)] border-[var(--color-warning)] text-[var(--color-text)] ";
  } else if (isSelected) {
    classes +=
      "bg-[var(--color-primary-subtle)] border-[var(--color-primary)] text-[var(--color-text)] ";
  } else {
    classes +=
      "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] ";
  }

  return classes;
}

interface MatchClassesConfig {
  isCorrect?: boolean;
  isIncorrect?: boolean;
  isDragOver?: boolean;
  isSubmitted?: boolean;
}

export function getMatchPromptClassName({
  isCorrect,
  isIncorrect,
  isDragOver,
  isSubmitted,
}: MatchClassesConfig): string {
  let classes = "relative p-4 rounded-lg border-2 transition-all duration-200 ";

  if (isDragOver) {
    classes +=
      "border-[var(--color-primary)] bg-[var(--color-primary-subtle)] ";
  } else if (isCorrect) {
    classes += "bg-[var(--color-success-light)] border-[var(--color-success)] ";
  } else if (isIncorrect) {
    classes += "bg-[var(--color-error-light)] border-[var(--color-error)] ";
  } else {
    classes += "bg-[var(--color-surface)] border-[var(--color-border)] ";
  }

  return classes;
}

export function getMatchAnswerClassName({
  isCorrect,
  isIncorrect,
}: MatchClassesConfig): string {
  let classes = "flex items-center justify-between p-2 rounded border ";

  if (isCorrect) {
    classes +=
      "bg-[var(--color-success-light)] border-[var(--color-success)] text-[var(--color-text)] ";
  } else if (isIncorrect) {
    classes +=
      "bg-[var(--color-error-light)] border-[var(--color-error)] text-[var(--color-text)] ";
  } else {
    classes +=
      "bg-[var(--color-primary-subtle)] border-[var(--color-primary)] text-[var(--color-text)] ";
  }

  return classes;
}

export function getFibInputClassName(
  isCorrect: boolean | null,
  isSubmitted: boolean,
): string {
  let classes =
    "w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] ";

  if (isSubmitted) {
    classes += "cursor-not-allowed ";
  }

  if (isCorrect === true) {
    classes += "border-[var(--color-success)] bg-[var(--color-success-light)] ";
  } else if (isCorrect === false) {
    classes += "border-[var(--color-error)] bg-[var(--color-error-light)] ";
  }

  return classes;
}
