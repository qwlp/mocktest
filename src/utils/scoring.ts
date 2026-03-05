import { Doc } from "../../convex/_generated/dataModel";
import { UserAnswer, Score, MatchingPair } from "../types";
import { isFibQuestionCorrect } from "./fillInBlank";

export function calculateScore(
  questions: Doc<"questions">[],
  userAnswers: UserAnswer[],
  shuffledMatchingOrders?: Map<string, string[]>,
): Score {
  let correct = 0;
  const total = questions.length;

  questions.forEach((question) => {
    const userAnswer = userAnswers.find(
      (answer) => answer.questionId === question._id,
    );
    if (!userAnswer) return;

    if (question.type === "matching") {
      const shuffledOrder = shuffledMatchingOrders?.get(question._id);
      if (
        checkMatchingAnswer(
          userAnswer,
          question.matchingPairs || [],
          shuffledOrder,
        )
      ) {
        correct++;
      }
    } else if (question.type === "fib") {
      if (checkFillInBlankAnswer(question, userAnswer)) {
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
  shuffledOrder?: string[],
): boolean {
  const userMatches = userAnswer.matchingAnswers || [];

  if (userMatches.length !== correctPairs.length) {
    return false;
  }

  // Use the shuffled order if provided (from the UI session), otherwise generate from database order
  const correctAnswers = correctPairs.map((pair) => pair.answer);
  const uniqueAnswers = shuffledOrder || Array.from(new Set(correctAnswers));

  for (const userMatch of userMatches) {
    const [promptIndexStr, answerNumStr] = userMatch.split(":");
    const promptIndex = parseInt(promptIndexStr, 10);
    const answerNum = parseInt(answerNumStr, 10);

    if (isNaN(promptIndex) || isNaN(answerNum)) {
      return false;
    }

    // Check if answer number is valid for the unique answers list
    if (answerNum < 1 || answerNum > uniqueAnswers.length) {
      return false;
    }

    // Get the answer text from the unique answers list (what the user sees)
    const userAnswerText = uniqueAnswers[answerNum - 1];
    const correctPair = correctPairs[promptIndex];

    if (!correctPair || correctPair.answer !== userAnswerText) {
      return false;
    }
  }

  return true;
}

function checkFillInBlankAnswer(
  question: Doc<"questions">,
  userAnswer: UserAnswer,
): boolean {
  return isFibQuestionCorrect(question, userAnswer.fillInBlankAnswer || []);
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

export function calculateProgress(
  currentQuestionIndex: number,
  totalQuestions: number,
): number {
  return Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
}

export function isQuestionCorrect(
  question: Doc<"questions">,
  userAnswer: UserAnswer | undefined,
  shuffledMatchingOrders?: Map<string, string[]>,
): boolean {
  if (!userAnswer) return false;

  if (question.type === "matching") {
    const shuffledOrder = shuffledMatchingOrders?.get(question._id);
    return checkMatchingAnswer(
      userAnswer,
      question.matchingPairs || [],
      shuffledOrder,
    );
  } else if (question.type === "fib") {
    return checkFillInBlankAnswer(question, userAnswer);
  } else {
    return checkStandardAnswer(userAnswer, question.correctAnswers);
  }
}
