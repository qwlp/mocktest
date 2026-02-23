import { Doc } from "../../convex/_generated/dataModel";
import { UserAnswer, Score, MatchingPair } from "../types";

export function calculateScore(
  questions: Doc<"questions">[],
  userAnswers: UserAnswer[],
): Score {
  let correct = 0;
  const total = questions.length;

  questions.forEach((question) => {
    const userAnswer = userAnswers.find(
      (answer) => answer.questionId === question._id,
    );
    if (!userAnswer) return;

    if (question.type === "matching") {
      if (checkMatchingAnswer(userAnswer, question.matchingPairs || [])) {
        correct++;
      }
    } else if (question.type === "fib") {
      if (checkFillInBlankAnswer(userAnswer, question.correctAnswers)) {
        correct++;
      }
    } else {
      if (checkStandardAnswer(userAnswer, question.correctAnswers)) {
        correct++;
      }
    }
  });

  return { correct, total };
}

function checkMatchingAnswer(
  userAnswer: UserAnswer,
  correctPairs: MatchingPair[],
): boolean {
  const userMatches = userAnswer.matchingAnswers || [];

  if (userMatches.length !== correctPairs.length) {
    return false;
  }

  const correctAnswers = correctPairs.map((pair) => pair.answer);

  for (const userMatch of userMatches) {
    const [promptIndexStr, answerNumStr] = userMatch.split(":");
    const promptIndex = parseInt(promptIndexStr, 10);
    const answerNum = parseInt(answerNumStr, 10);

    if (isNaN(promptIndex) || isNaN(answerNum)) {
      return false;
    }

    const userAnswerText = correctAnswers[answerNum - 1];
    const correctPair = correctPairs[promptIndex];

    if (!correctPair || correctPair.answer !== userAnswerText) {
      return false;
    }
  }

  return true;
}

function checkFillInBlankAnswer(
  userAnswer: UserAnswer,
  correctAnswers: string[],
): boolean {
  const userFibAnswer =
    userAnswer.fillInBlankAnswer?.[0]?.trim().toLowerCase() || "";
  const normalizedCorrectAnswers = correctAnswers.map((answer) =>
    answer.toLowerCase(),
  );

  return normalizedCorrectAnswers.some((correctAnswer) => {
    if (userFibAnswer === correctAnswer) return true;

    const normalizedUser = normalizeText(userFibAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);

    return normalizedUser === normalizedCorrect;
  });
}

function checkStandardAnswer(
  userAnswer: UserAnswer,
  correctAnswers: string[],
): boolean {
  const userSelectedAnswers = userAnswer.selectedAnswers || [];

  return (
    userSelectedAnswers.length === correctAnswers.length &&
    userSelectedAnswers.every((answer) => correctAnswers.includes(answer))
  );
}

export function normalizeText(text: string): string {
  return text
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function calculateProgress(
  currentQuestionIndex: number,
  totalQuestions: number,
): number {
  return Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
}

export function isQuestionCorrect(
  question: Doc<"questions">,
  userAnswer: UserAnswer | undefined,
): boolean {
  if (!userAnswer) return false;

  if (question.type === "matching") {
    return checkMatchingAnswer(userAnswer, question.matchingPairs || []);
  } else if (question.type === "fib") {
    return checkFillInBlankAnswer(userAnswer, question.correctAnswers);
  } else {
    return checkStandardAnswer(userAnswer, question.correctAnswers);
  }
}
