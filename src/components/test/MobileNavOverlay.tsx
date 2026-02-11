import React from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import { QuestionNav } from "../navigation/QuestionNav";
import { QuestionStatus } from "../../types";

interface MobileNavOverlayProps {
  isOpen: boolean;
  questions: Doc<"questions">[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  getQuestionStatus: (index: number) => QuestionStatus;
  isSubmitted: boolean;
  onClose: () => void;
}

export function MobileNavOverlay({
  isOpen,
  questions,
  currentQuestionIndex,
  onQuestionSelect,
  getQuestionStatus,
  isSubmitted,
  onClose,
}: MobileNavOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div className="absolute top-0 left-0 w-80 h-full bg-white dark:bg-dark-surface shadow-xl transform transition-transform duration-300">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
              Navigation
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-white"
              aria-label="Close navigation"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto h-full">
          <QuestionNav
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={onQuestionSelect}
            getQuestionStatus={getQuestionStatus}
            isSubmitted={isSubmitted}
          />
        </div>
      </div>
    </div>
  );
}
