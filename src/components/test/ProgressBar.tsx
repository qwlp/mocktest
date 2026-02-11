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
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
        <span className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
          {Math.round(progress)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
