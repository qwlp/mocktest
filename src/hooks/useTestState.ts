import { useState, useEffect, useCallback } from "react";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { UserAnswer } from "../types";
import { calculateScore, getQuestionStatus } from "../utils";

interface UseTestStateProps {
  testId: Id<"tests">;
  questions: Doc<"questions">[] | undefined;
  onExitTest: () => void;
}

interface UseTestStateReturn {
  userAnswers: UserAnswer[];
  currentQuestionIndex: number;
  isSubmitted: boolean;
  showFeedback: boolean;
  isMobileNavOpen: boolean;
  showConfirmModal: boolean;
  score: { correct: number; total: number };
  progress: number;
  setCurrentQuestionIndex: (index: number) => void;
  setIsMobileNavOpen: (isOpen: boolean) => void;
  setShowConfirmModal: (show: boolean) => void;
  handleAnswerChange: (answer: string[]) => void;
  handleSubmitTest: () => void;
  handleExitTest: () => void;
  getCurrentAnswerArray: () => string[];
  getCurrentQuestionStatus: () => "answered" | "unanswered";
}

export function useTestState({
  questions,
  onExitTest,
}: UseTestStateProps): UseTestStateReturn {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  useEffect(() => {
    setUserAnswers([]);
    setIsSubmitted(false);
    setShowFeedback(false);
    setCurrentQuestionIndex(0);
  }, [questions]);

  const currentQuestion = questions?.[currentQuestionIndex];
  const currentUserAnswer = userAnswers.find(
    (answer) => answer.questionId === currentQuestion?._id,
  );

  const getCurrentAnswerArray = useCallback(() => {
    if (!currentUserAnswer) return [];

    if (currentQuestion?.type === "matching") {
      return currentUserAnswer.matchingAnswers || [];
    }
    if (currentQuestion?.type === "fib") {
      return currentUserAnswer.fillInBlankAnswer || [];
    }
    return currentUserAnswer.selectedAnswers || [];
  }, [currentUserAnswer, currentQuestion]);

  const handleAnswerChange = useCallback(
    (newAnswer: string[]) => {
      if (!currentQuestion || isSubmitted) return;

      setUserAnswers((prev) => {
        const existingIndex = prev.findIndex(
          (answer) => answer.questionId === currentQuestion._id,
        );
        const newUserAnswer: UserAnswer = {
          questionId: currentQuestion._id,
          selectedAnswers:
            currentQuestion.type === "matching" ||
            currentQuestion.type === "fib"
              ? []
              : newAnswer,
          matchingAnswers:
            currentQuestion.type === "matching" ? newAnswer : undefined,
          fillInBlankAnswer:
            currentQuestion.type === "fib" ? newAnswer : undefined,
        };

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newUserAnswer;
          return updated;
        } else {
          return [...prev, newUserAnswer];
        }
      });
    },
    [currentQuestion, isSubmitted],
  );

  const handleSubmitTest = useCallback(() => {
    setIsSubmitted(true);
    setShowFeedback(true);
  }, []);

  const handleExitTest = useCallback(() => {
    setUserAnswers([]);
    setIsSubmitted(false);
    setShowFeedback(false);
    setCurrentQuestionIndex(0);
    onExitTest();
  }, [onExitTest]);

  const getCurrentQuestionStatus = useCallback(() => {
    if (!currentQuestion) return "unanswered";
    return getQuestionStatus(currentQuestion, userAnswers);
  }, [currentQuestion, userAnswers]);

  const score = questions
    ? calculateScore(questions, userAnswers)
    : { correct: 0, total: 0 };
  const progress = questions
    ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100)
    : 0;

  return {
    userAnswers,
    currentQuestionIndex,
    isSubmitted,
    showFeedback,
    isMobileNavOpen,
    showConfirmModal,
    score,
    progress,
    setCurrentQuestionIndex,
    setIsMobileNavOpen,
    setShowConfirmModal,
    handleAnswerChange,
    handleSubmitTest,
    handleExitTest,
    getCurrentAnswerArray,
    getCurrentQuestionStatus,
  };
}
