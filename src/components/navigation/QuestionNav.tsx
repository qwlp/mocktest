import React, { useState } from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import { QuestionStatus } from "../../types";

interface QuestionNavProps {
  questions: Doc<"questions">[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  getQuestionStatus: (index: number) => QuestionStatus;
  isSubmitted: boolean;
}

export function QuestionNav({
  questions,
  currentQuestionIndex,
  onQuestionSelect,
  getQuestionStatus,
  isSubmitted,
}: QuestionNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const answeredCount = questions.filter(
    (_, index) => getQuestionStatus(index) === "answered",
  ).length;
  const progressPercentage = Math.round(
    (answeredCount / questions.length) * 100,
  );

  return (
    <div
      className={`
      relative bg-gray-100 dark:bg-dark-surface rounded-lg shadow-lg transition-all duration-300 ease-in-out
      ${isCollapsed ? "w-16" : "w-64"}
    `}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-4 z-10 w-6 h-6 bg-blue-500 dark:bg-dark-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 dark:hover:bg-dark-primary-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-dark-primary"
        aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
        aria-expanded={!isCollapsed}
      >
        <svg
          className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="p-4 overflow-hidden">
        {/* Header */}
        <div
          className={`transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-dark-text">
            Questions
          </h3>

          {/* Progress Summary */}
          <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                Progress
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {answeredCount}/{questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              {progressPercentage}% Complete
            </div>
          </div>
        </div>

        {/* Collapsed State Indicator */}
        {isCollapsed && (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {answeredCount}
              </span>
            </div>
            <div className="w-2 bg-gray-200 dark:bg-gray-600 rounded-full h-16 relative">
              <div
                className="bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500 absolute bottom-0 w-full"
                style={{ height: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {questions.length}
            </div>
          </div>
        )}

        {/* Questions List */}
        <div
          className={`
          transition-all duration-300 overflow-y-auto
          ${isCollapsed ? "opacity-0 max-h-0" : "opacity-100 max-h-96"}
        `}
        >
          <ul className="space-y-2">
            {questions.map((q, index) => (
              <li key={q._id}>
                <button
                  onClick={() => onQuestionSelect(index)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 transform hover:scale-105
                    ${
                      currentQuestionIndex === index
                        ? "bg-blue-500 text-white dark:bg-dark-primary dark:text-white shadow-md"
                        : "bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-dark-text-secondary hover:shadow-sm"
                    }
                    ${getQuestionStatus(index) === "answered" ? "border-l-4 border-green-500 dark:border-green-400" : "border-l-4 border-transparent"}
                  `}
                  aria-label={`Go to question ${index + 1}`}
                  aria-current={
                    currentQuestionIndex === index ? "true" : "false"
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Question {index + 1}</span>
                    {getQuestionStatus(index) === "answered" && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {q.type === "mcq" && "Multiple Choice"}
                    {q.type === "tf" && "True/False"}
                    {q.type === "ms" && "Multiple Select"}
                    {q.type === "matching" && "Matching"}
                    {q.type === "fib" && "Fill in the Blank"}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer (when expanded) */}
        <div
          className={`
          mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 transition-opacity duration-300
          ${isCollapsed ? "opacity-0" : "opacity-100"}
        `}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {isSubmitted ? "Test Submitted" : "Click questions to navigate"}
          </div>
        </div>
      </div>
    </div>
  );
}
