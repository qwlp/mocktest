import React from "react";

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
  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-dark-border">
      <button
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
        className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <div className="flex space-x-3">
        {!isSubmitted && (
          <button onClick={onSubmit} className="btn btn-primary">
            Submit Test
          </button>
        )}

        <button
          onClick={onNext}
          disabled={currentQuestionIndex === totalQuestions - 1}
          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
