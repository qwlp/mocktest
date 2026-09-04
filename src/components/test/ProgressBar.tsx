import React from "react";

interface ProgressBarProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  progress: number;
}

export function ProgressBar({
  currentQuestionIndex,
  totalQuestions,
  progress,
}: ProgressBarProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text)]">
            Question {currentQuestionIndex + 1}
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            of {totalQuestions}
          </span>
        </div>
        <span className="text-sm font-semibold text-[var(--color-primary-light)]">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="relative">
        <div
          className="w-full h-2.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--color-border)" }}
        >
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
