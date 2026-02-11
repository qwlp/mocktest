import React, { useState, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { QuestionView } from "../questions/QuestionView";
import { QuestionNav } from "../navigation/QuestionNav";
import { toast } from "sonner";
import { PracticeTestPageProps } from "../../types";
import { useTestState, useKeyboardShortcuts, QuestionType } from "../../hooks";
import { getQuestionStatus, getQuestionTypeLabel } from "../../utils";
import { MobileNavToggle } from "./MobileNavToggle";
import { MobileNavOverlay } from "./MobileNavOverlay";
import { TestHeader } from "./TestHeader";
import { ProgressBar } from "./ProgressBar";
import { ScoreDisplay } from "./ScoreDisplay";
import { ConfirmModal } from "./ConfirmModal";
import { NavigationControls } from "./NavigationControls";
import { Confetti } from "./Confetti";
import {
  KeyboardShortcutsPanel,
  KeyboardShortcutsButton,
} from "./KeyboardShortcutsPanel";
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export function PracticeTestPage({
  testId,
  onExitTest,
}: PracticeTestPageProps) {
  const test = useQuery(api.practiceTest.getTest, { testId });
  const questions = useQuery(api.practiceTest.getQuestions, { testId });
  const [showShortcuts, setShowShortcuts] = useState(false);

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
  const currentQuestionType = currentQuestion?.type as QuestionType;

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

  // Keyboard shortcuts handlers
  const handleNextQuestion = useCallback(() => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, questions, setCurrentQuestionIndex]);

  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex, setCurrentQuestionIndex]);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (!currentQuestion || isSubmitted) return;

      const option = currentQuestion.options[index];
      if (option) {
        if (currentQuestion.type === "mcq" || currentQuestion.type === "tf") {
          handleAnswerChange([option]);
        } else if (currentQuestion.type === "ms") {
          const currentAnswers = getCurrentAnswerArray() || [];
          const isSelected = currentAnswers.includes(option);

          if (isSelected) {
            handleAnswerChange(currentAnswers.filter((a) => a !== option));
          } else {
            handleAnswerChange([...currentAnswers, option]);
          }
        }
      }
    },
    [currentQuestion, isSubmitted, handleAnswerChange, getCurrentAnswerArray],
  );

  const handleJumpToType = useCallback(
    (type: QuestionType) => {
      if (!questions) return;
      const targetIndex = questions.findIndex((q) => q.type === type);
      if (targetIndex !== -1) {
        setCurrentQuestionIndex(targetIndex);
        setShowShortcuts(false);
        toast.info(`Jumped to ${getQuestionTypeLabel(type)} questions`);
      }
    },
    [questions, setCurrentQuestionIndex],
  );

  // Handle Alt + key for question type navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts(true);
      }

      if (e.altKey) {
        const typeMap: Record<string, QuestionType> = {
          m: "mcq",
          t: "tf",
          s: "ms",
          a: "matching",
          i: "fib",
        };

        const type = typeMap[e.key.toLowerCase()];
        if (type) {
          e.preventDefault();
          handleJumpToType(type);
        }
      }
    },
    [handleJumpToType],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onNextQuestion: handleNextQuestion,
    onPrevQuestion: handlePrevQuestion,
    onSubmitTest: () => setShowConfirmModal(true),
    onExitTest,
    onSelectOption: handleSelectOption,
    isSubmitted,
    optionsLength: currentQuestion?.options?.length || 0,
  });

  if (!test || !questions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[var(--color-rose-200)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <p className="text-[var(--color-text-secondary)] font-medium animate-pulse">
          Loading test...
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="card p-12 text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-rose-100)] dark:bg-[var(--color-rose-900)]/30 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-[var(--color-rose-500)]" />
          </div>
          <p className="text-[var(--color-text-secondary)] text-lg mb-4">
            No questions found for this test.
          </p>
          <button onClick={handleExitTest} className="btn btn-primary">
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
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
        {/* Sidebar Navigation */}
        <div className="hidden lg:block lg:col-span-1">
          <QuestionNav
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={handleQuestionSelect}
            getQuestionStatus={getQuestionStatusForIndex}
            isSubmitted={isSubmitted}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <TestHeader
                test={test}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                onExitTest={handleExitTest}
                onSubmit={() => setShowConfirmModal(true)}
                isSubmitted={isSubmitted}
              />
              <KeyboardShortcutsButton onClick={() => setShowShortcuts(true)} />
            </div>

            {/* Progress */}
            <ProgressBar
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              progress={progress}
            />

            {/* Score Display (after submission) */}
            {isSubmitted && <ScoreDisplay score={score} />}

            {/* Confetti on success */}
            <Confetti
              trigger={isSubmitted && (score.correct / score.total) * 100 >= 40}
            />

            {/* Question */}
            {currentQuestion && (
              <div className="mb-8 animate-slide-up">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="badge badge-rose">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {getQuestionTypeLabel(
                        currentQuestion.type as QuestionType,
                      )}
                    </span>
                  </div>

                  {/* Flag button */}
                  <button
                    className="btn btn-ghost btn-sm tooltip"
                    data-tooltip="Flag for review (F)"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <div className="prose prose-base max-w-none text-[var(--color-text)] leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentQuestion.text}
                    </ReactMarkdown>
                  </div>
                  {currentQuestion.type === "ms" && (
                    <p className="text-sm text-[var(--color-rose-600)] dark:text-[var(--color-rose-400)] mt-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Select all that apply
                    </p>
                  )}
                </div>

                {/* Question Options */}
                <QuestionView
                  question={currentQuestion}
                  userAnswer={getCurrentAnswerArray()}
                  onAnswerChange={handleAnswerChange}
                  showFeedback={showFeedback}
                  isSubmitted={isSubmitted}
                />

                {/* Keyboard hint */}
                {!isSubmitted && (
                  <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1">
                      Press <kbd className="kbd mx-1">1</kbd> -{" "}
                      <kbd className="kbd mx-1">9</kbd> to select
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">
                      Use arrow keys to navigate
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Modal */}
            <ConfirmModal
              isOpen={showConfirmModal}
              onCancel={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmSubmit}
            />

            {/* Navigation Controls */}
            <NavigationControls
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              isSubmitted={isSubmitted}
              onPrevious={handlePrevQuestion}
              onNext={handleNextQuestion}
              onSubmit={() => setShowConfirmModal(true)}
            />
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        currentQuestionType={currentQuestionType}
        onJumpToType={handleJumpToType}
      />
    </div>
  );
}
