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
            className="h-full rounded-full transition-all duration-500 ease-out relative"
            style={{
              width: `${progress}%`,
              backgroundColor: "var(--color-primary)",
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Progress markers */}
        <div className="absolute top-0 left-0 right-0 h-full flex justify-between px-0.5">
          {Array.from({ length: Math.min(totalQuestions, 20) }).map((_, i) => {
            const position = ((i + 1) / totalQuestions) * 100;
            return (
              <div
                key={i}
                className="w-0.5 h-full rounded-full transition-colors duration-300"
                style={{
                  backgroundColor:
                    progress >= position
                      ? "rgba(255,255,255,0.3)"
                      : "transparent",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
