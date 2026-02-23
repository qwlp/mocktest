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
              background: `linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`,
            }}
          >
            {/* Subtle shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
          </div>
        </div>

        {/* Subtle gradient overlay for depth */}
        <div className="absolute top-0 left-0 right-0 h-full rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
