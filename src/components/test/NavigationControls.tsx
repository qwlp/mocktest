import React from "react";
import { ChevronLeft, ChevronRight, Send, CheckCircle } from "lucide-react";

interface NavigationControlsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  isSubmitted: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function NavigationControls({
  currentQuestionIndex,
  totalQuestions,
  isSubmitted,
  onPrevious,
  onNext,
  onSubmit,
}: NavigationControlsProps) {
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[var(--color-border)]">
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

      {/* Center Info */}
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] order-first sm:order-none">
        <span className="font-semibold text-[var(--color-text)]">
          {currentQuestionIndex + 1}
        </span>
        <span>/</span>
        <span>{totalQuestions}</span>
      </div>

      {/* Next/Submit Buttons */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {!isSubmitted && (
          <button
            onClick={onSubmit}
            className="btn btn-primary ripple w-full sm:w-auto group"
          >
            <Send
              className={`w-4 h-4 transition-transform duration-300 ${!isLastQuestion ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5" : ""}`}
            />
            <span>Submit</span>
            <span className="hidden sm:inline text-white/70 text-xs ml-2">
              <kbd className="kbd !bg-white/20 !border-white/30 !text-white text-[10px]">
                Ctrl+S
              </kbd>
            </span>
          </button>
        )}

        {isSubmitted && (
          <div className="flex items-center gap-2 text-[var(--color-success)]">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Completed</span>
          </div>
        )}

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
    </div>
  );
}
