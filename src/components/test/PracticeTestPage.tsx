import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
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
import { ResumeDialog } from "./ResumeDialog";
import { MarkdownRenderer } from "../markdown/MarkdownRenderer";
import {
  loadTestProgress,
  clearTestProgress,
  SavedTestProgress,
  cleanupExpiredProgress,
} from "../../lib/testStorage";
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
  const user = useQuery(api.auth.loggedInUser);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState<SavedTestProgress | null>(
    null,
  );

  const userId = user?._id?.toString() || null;
  const progressKey =
    user === undefined ? null : `${testId.toString()}:${userId ?? "guest"}`;
  const [hydratedProgressKey, setHydratedProgressKey] = useState<string | null>(
    null,
  );

  // Store a random seed for this session - generated once for new sessions
  const sessionSeedRef = useRef<string | null>(null);

  // Deterministic shuffle function using a simple seeded random
  const seededShuffle = useCallback(<T,>(array: T[], seed: string): T[] => {
    // Create a simple hash from the seed string
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      // Generate deterministic random index based on hash
      const randomIndex =
        Math.abs((hash * (i + 1) * 9301 + 49297) % 233280) % (i + 1);
      hash = (hash * 9301 + 49297) % 233280;
      [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
    }
    return result;
  }, []);

  // Store shuffled matching answers per question ID - computed once when questions load
  const [shuffledMatchingOrders, setShuffledMatchingOrders] = useState<
    Map<string, string[]>
  >(new Map());

  // Check for saved progress before initializing matching shuffles.
  useEffect(() => {
    if (!progressKey) {
      setSavedProgress(null);
      setShowResumeDialog(false);
      setHydratedProgressKey(null);
      setShuffledMatchingOrders(new Map());
      return;
    }

    cleanupExpiredProgress();

    const progress = userId ? loadTestProgress(testId, userId) : null;
    setSavedProgress(progress);
    setShowResumeDialog(Boolean(progress));
    setHydratedProgressKey(progressKey);
    setShuffledMatchingOrders(new Map());
  }, [progressKey, testId, userId]);

  const isSavedProgressHydrated =
    progressKey !== null && hydratedProgressKey === progressKey;

  // Initialize shuffled matching orders once saved progress has been resolved.
  useEffect(() => {
    if (!questions || !isSavedProgressHydrated) return;

    // Generate a random seed for new sessions (no saved progress)
    if (!savedProgress && !sessionSeedRef.current) {
      sessionSeedRef.current = Math.random().toString(36).substring(2, 15);
    }

    const newShuffledOrders = new Map<string, string[]>();
    questions.forEach((question) => {
      if (question.type === "matching" && question.matchingPairs) {
        // Check if we have saved shuffled order for this question from prior session
        const savedOrder =
          savedProgress?.shuffledMatchingOrders?.[question._id];
        if (savedOrder && savedOrder.length > 0) {
          newShuffledOrders.set(question._id, savedOrder);
        } else {
          // Build answers list: use matchingAnswers as base, ensure all correct answers are included
          const correctAnswers = question.matchingPairs.map(
            (pair) => pair.answer,
          );
          const uniqueCorrectAnswers = Array.from(new Set(correctAnswers));

          let answers: string[];
          if (question.matchingAnswers && question.matchingAnswers.length > 0) {
            // Start with matchingAnswers and add any missing correct answers
            answers = [...question.matchingAnswers];
            uniqueCorrectAnswers.forEach((answer) => {
              if (!answers.includes(answer)) {
                answers.push(answer);
              }
            });
          } else {
            answers = uniqueCorrectAnswers;
          }

          // Use session seed so it's random per session but stable within session
          // Ensure we have a seed (generate one if needed)
          if (!sessionSeedRef.current) {
            sessionSeedRef.current = Math.random()
              .toString(36)
              .substring(2, 15);
          }
          newShuffledOrders.set(
            question._id,
            seededShuffle(answers, sessionSeedRef.current),
          );
        }
      }
    });
    setShuffledMatchingOrders(newShuffledOrders);
  }, [questions, savedProgress, seededShuffle, isSavedProgressHydrated]);

  const handleResume = () => {
    setShowResumeDialog(false);
    // Progress is already loaded via savedProgress state
  };

  const handleStartFresh = () => {
    if (userId) {
      clearTestProgress(testId, userId);
    }
    setSavedProgress(null);
    sessionSeedRef.current = null; // Reset to generate new random shuffle
    setShowResumeDialog(false);
  };

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
  } = useTestState({
    testId,
    questions,
    onExitTest,
    userId,
    savedProgress,
    shuffledMatchingOrders,
    canAutoSave: isSavedProgressHydrated && !showResumeDialog,
  });

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
        userAnswers={userAnswers}
        shuffledMatchingOrders={shuffledMatchingOrders}
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
            userAnswers={userAnswers}
            shuffledMatchingOrders={shuffledMatchingOrders}
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
                  <MarkdownRenderer
                    content={currentQuestion.text}
                    className="prose prose-base max-w-none text-[var(--color-text)] leading-relaxed"
                  />
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
                  shuffledMatchingAnswers={shuffledMatchingOrders.get(
                    currentQuestion._id,
                  )}
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

      {/* Resume Dialog */}
      {questions && (
        <ResumeDialog
          isOpen={showResumeDialog}
          onResume={handleResume}
          onStartFresh={handleStartFresh}
          savedQuestionIndex={savedProgress?.currentQuestionIndex ?? 0}
          totalQuestions={questions.length}
        />
      )}
    </div>
  );
}
