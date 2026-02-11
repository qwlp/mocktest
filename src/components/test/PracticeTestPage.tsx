import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { QuestionView } from "../questions/QuestionView";
import { QuestionNav } from "../navigation/QuestionNav";
import { toast } from "sonner";
import { PracticeTestPageProps } from "../../types";
import { useTestState } from "../../hooks";
import { getQuestionStatus } from "../../utils";
import { MobileNavToggle } from "./MobileNavToggle";
import { MobileNavOverlay } from "./MobileNavOverlay";
import { TestHeader } from "./TestHeader";
import { ProgressBar } from "./ProgressBar";
import { ScoreDisplay } from "./ScoreDisplay";
import { ConfirmModal } from "./ConfirmModal";
import { NavigationControls } from "./NavigationControls";

export function PracticeTestPage({
  testId,
  onExitTest,
}: PracticeTestPageProps) {
  const test = useQuery(api.practiceTest.getTest, { testId });
  const questions = useQuery(api.practiceTest.getQuestions, { testId });

  const {
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
  } = useTestState({ testId, questions, onExitTest });

  const currentQuestion = questions?.[currentQuestionIndex];

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsMobileNavOpen(false);
  };

  const getQuestionStatusForIndex = (index: number) => {
    if (!questions) return "unanswered";
    return getQuestionStatus(questions[index], userAnswers);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    handleSubmitTest();
    toast.success("Test submitted! Review your answers below.");
  };

  if (!test || !questions) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 dark:text-dark-text-secondary">
          Loading test...
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-dark-text-secondary">
            No questions found for this test.
          </p>
          <button onClick={handleExitTest} className="mt-4 btn btn-primary">
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <MobileNavToggle
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        isOpen={isMobileNavOpen}
        onToggle={() => setIsMobileNavOpen(!isMobileNavOpen)}
      />

      <MobileNavOverlay
        isOpen={isMobileNavOpen}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        onQuestionSelect={handleQuestionSelect}
        getQuestionStatus={getQuestionStatusForIndex}
        isSubmitted={isSubmitted}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="hidden lg:block lg:col-span-1">
          <QuestionNav
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={handleQuestionSelect}
            getQuestionStatus={getQuestionStatusForIndex}
            isSubmitted={isSubmitted}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="card p-6">
            <TestHeader test={test} onExitTest={handleExitTest} />

            <ProgressBar
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              progress={progress}
            />

            {isSubmitted && <ScoreDisplay score={score} />}

            {currentQuestion && (
              <div className="mb-8">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <div className="prose prose-base max-w-none dark:prose-invert text-gray-700 dark:text-dark-text-secondary leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentQuestion.text}
                    </ReactMarkdown>
                  </div>
                  {currentQuestion.type === "ms" && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      Select all that apply
                    </p>
                  )}
                </div>

                <QuestionView
                  question={currentQuestion}
                  userAnswer={getCurrentAnswerArray()}
                  onAnswerChange={handleAnswerChange}
                  showFeedback={showFeedback}
                  isSubmitted={isSubmitted}
                />
              </div>
            )}

            <ConfirmModal
              isOpen={showConfirmModal}
              onCancel={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmSubmit}
            />

            <NavigationControls
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              isSubmitted={isSubmitted}
              onPrevious={() =>
                setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
              }
              onNext={() =>
                setCurrentQuestionIndex(
                  Math.min(questions.length - 1, currentQuestionIndex + 1),
                )
              }
              onSubmit={() => setShowConfirmModal(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
