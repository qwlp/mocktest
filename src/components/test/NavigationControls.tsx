import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationControlsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  isSubmitted: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function NavigationControls({
  currentQuestionIndex,
  totalQuestions,
  isSubmitted,
  onPrevious,
  onNext,
}: NavigationControlsProps) {
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="flex justify-between items-center gap-4 pt-6 border-t border-[var(--color-border)]">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className="btn btn-secondary w-full sm:w-auto group"
      >
        <ChevronLeft
          className={`w-5 h-5 transition-transform duration-300 ${!isFirstQuestion ? "group-hover:-translate-x-1" : ""}`}
        />
        <span>Previous</span>
        <span className="hidden sm:inline text-[var(--color-text-muted)] text-xs ml-2">
          <kbd className="kbd text-[10px]">←</kbd>
        </span>
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={isLastQuestion}
        className="btn btn-secondary w-full sm:w-auto group"
      >
        <span>Next</span>
        <ChevronRight
          className={`w-5 h-5 transition-transform duration-300 ${!isLastQuestion ? "group-hover:translate-x-1" : ""}`}
        />
        <span className="hidden sm:inline text-[var(--color-text-muted)] text-xs ml-2">
          <kbd className="kbd text-[10px]">→</kbd>
        </span>
      </button>
    </div>
  );
}
