import React from "react";

interface MobileNavToggleProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileNavToggle({
  currentQuestionIndex,
  totalQuestions,
  isOpen,
  onToggle,
}: MobileNavToggleProps) {
  return (
    <div className="lg:hidden mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-border"
        aria-label="Toggle question navigation"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
        <svg
          className={`w-5 h-5 text-gray-600 dark:text-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
}
