import { Doc } from "../../convex/_generated/dataModel";
import { UserAnswer, QuestionStatus } from "../types";

export function getQuestionStatus(
  question: Doc<"questions">,
  userAnswers: UserAnswer[],
): QuestionStatus {
  const userAnswer = userAnswers.find(
    (answer) => answer.questionId === question._id,
  );

  if (!userAnswer) return "unanswered";

  if (question.type === "matching") {
    const hasAnswers = (userAnswer.matchingAnswers || []).length > 0;
    return hasAnswers ? "answered" : "unanswered";
  } else if (question.type === "fib") {
    const hasAnswer =
      (userAnswer.fillInBlankAnswer || []).length > 0 &&
      (userAnswer.fillInBlankAnswer?.[0]?.trim() || "").length > 0;
    return hasAnswer ? "answered" : "unanswered";
  } else {
    const hasAnswers = (userAnswer.selectedAnswers || []).length > 0;
    return hasAnswers ? "answered" : "unanswered";
  }
}

export function getAnswerArrayForQuestionType(
  question: Doc<"questions">,
  userAnswer: UserAnswer | undefined,
): string[] {
  if (!userAnswer) return [];

  if (question.type === "matching") {
    return userAnswer.matchingAnswers || [];
  }
  if (question.type === "fib") {
    return userAnswer.fillInBlankAnswer || [];
  }
  return userAnswer.selectedAnswers || [];
}
