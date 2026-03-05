import { Doc } from "../../convex/_generated/dataModel";

const BLANK_PATTERN = /_{3,}/g;
const ANSWER_VARIANT_SEPARATOR = "|";

export function normalizeText(text: string): string {
  return text
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getFillInBlankCount(questionText: string): number {
  return questionText.match(BLANK_PATTERN)?.length ?? 0;
}

export function getRequiredFibAnswerCount(question: Doc<"questions">): number {
  const blankCount = getFillInBlankCount(question.text);
  return blankCount > 1 ? blankCount : 1;
}

function getAnswerVariants(expectedAnswer: string): string[] {
  const variants = expectedAnswer
    .split(ANSWER_VARIANT_SEPARATOR)
    .map((answer) => answer.trim())
    .filter(Boolean);

  return variants.length > 0 ? variants : [expectedAnswer.trim()];
}

function isEntryCorrect(userInput: string, expectedAnswer: string): boolean {
  const normalizedUserInput = normalizeText(userInput.trim().toLowerCase());
  if (!normalizedUserInput) return false;

  const variants = getAnswerVariants(expectedAnswer);
  return variants.some((variant) => {
    const normalizedVariant = normalizeText(variant.toLowerCase());
    return normalizedUserInput === normalizedVariant;
  });
}

export function getFibAnswerResults(
  question: Doc<"questions">,
  userAnswers: string[],
): Array<boolean | null> {
  const requiredCount = getRequiredFibAnswerCount(question);
  const results: Array<boolean | null> = [];
  const answers = userAnswers ?? [];

  if (requiredCount === 1) {
    const input = answers[0] ?? "";
    if (!input.trim()) return [null];

    const isCorrect = question.correctAnswers.some((answer) =>
      isEntryCorrect(input, answer),
    );
    return [isCorrect];
  }

  for (let index = 0; index < requiredCount; index++) {
    const input = answers[index] ?? "";
    const expected = question.correctAnswers[index];

    if (!input.trim()) {
      results.push(null);
      continue;
    }

    if (!expected) {
      results.push(false);
      continue;
    }

    results.push(isEntryCorrect(input, expected));
  }

  return results;
}

export function isFibQuestionCorrect(
  question: Doc<"questions">,
  userAnswers: string[],
): boolean {
  const requiredCount = getRequiredFibAnswerCount(question);
  const results = getFibAnswerResults(question, userAnswers);

  if (requiredCount > 1 && question.correctAnswers.length < requiredCount) {
    return false;
  }

  return results.length === requiredCount && results.every((result) => result);
}

export function isFibQuestionAnswered(
  question: Doc<"questions">,
  userAnswers: string[],
): boolean {
  const requiredCount = getRequiredFibAnswerCount(question);
  const answers = userAnswers ?? [];

  if (requiredCount === 1) {
    return (answers[0]?.trim() ?? "").length > 0;
  }

  return Array.from({ length: requiredCount }, (_, index) => index).every(
    (index) => (answers[index]?.trim() ?? "").length > 0,
  );
}
