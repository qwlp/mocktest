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
      "cursor-pointer hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 ";
  }

  if (feedback === "correct") {
    classes +=
      "bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-600 dark:text-green-200 ";
  } else if (feedback === "incorrect") {
    classes +=
      "bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-600 dark:text-red-200 ";
  } else if (feedback === "missed") {
    classes +=
      "bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-200 ";
  } else if (isSelected) {
    classes +=
      "bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-200 ";
  } else {
    classes +=
      "bg-white border-gray-200 text-gray-800 dark:bg-dark-surface dark:border-dark-border dark:text-dark-text ";
  }

  return classes;
}

interface MatchClassesConfig {
  isCorrect?: boolean;
  isIncorrect?: boolean;
  isDragOver?: boolean;
}

export function getMatchPromptClassName({
  isCorrect,
  isIncorrect,
  isDragOver,
}: MatchClassesConfig): string {
  let classes = "relative p-4 rounded-lg border-2 transition-all duration-200 ";

  if (isDragOver) {
    classes += "border-blue-400 bg-blue-50 dark:bg-blue-900/20 ";
  } else if (isCorrect) {
    classes +=
      "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-600 ";
  } else if (isIncorrect) {
    classes +=
      "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-600 ";
  } else {
    classes +=
      "bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border ";
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
      "bg-green-100 border-green-300 text-green-800 dark:bg-green-800/30 dark:border-green-600 dark:text-green-200 ";
  } else if (isIncorrect) {
    classes +=
      "bg-red-100 border-red-300 text-red-800 dark:bg-red-800/30 dark:border-red-600 dark:text-red-200 ";
  } else {
    classes +=
      "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-800/30 dark:border-blue-600 dark:text-blue-200 ";
  }

  return classes;
}

export function getFibInputClassName(
  isCorrect: boolean | null,
  isSubmitted: boolean,
): string {
  let classes =
    "w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ";

  if (isSubmitted) {
    classes += "cursor-not-allowed bg-gray-100 dark:bg-gray-700 ";
  } else {
    classes +=
      "bg-white dark:bg-dark-surface border-gray-300 dark:border-dark-border ";
  }

  if (isCorrect === true) {
    classes +=
      "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600 ";
  } else if (isCorrect === false) {
    classes +=
      "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600 ";
  }

  return classes;
}
