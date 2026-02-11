import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MatchingQuestion } from "./MatchingQuestion";
import { FillInBlankQuestion } from "./FillInBlankQuestion";
import { QuestionViewProps } from "../../types";
import { getOptionClassName } from "../../utils";

type FeedbackType = "correct" | "incorrect" | "missed" | null;

export function QuestionView({
  question,
  userAnswer,
  onAnswerChange,
  showFeedback = false,
  isSubmitted = false,
}: QuestionViewProps) {
  const handleSingleAnswerChange = (selectedOption: string) => {
    if (isSubmitted) return;
    onAnswerChange([selectedOption]);
  };

  const handleMultipleAnswerChange = (selectedOption: string) => {
    if (isSubmitted) return;

    const currentAnswers = userAnswer || [];
    const isSelected = currentAnswers.includes(selectedOption);

    if (isSelected) {
      onAnswerChange(
        currentAnswers.filter((answer) => answer !== selectedOption),
      );
    } else {
      onAnswerChange([...currentAnswers, selectedOption]);
    }
  };

  const getOptionFeedback = (option: string): FeedbackType => {
    if (!showFeedback) return null;

    const isSelected = userAnswer?.includes(option);
    const isCorrect = question.correctAnswers.includes(option);

    if (isSelected && isCorrect) return "correct";
    if (isSelected && !isCorrect) return "incorrect";
    if (!isSelected && isCorrect) return "missed";
    return null;
  };

  const getOptionClasses = (option: string) => {
    const feedback = getOptionFeedback(option);
    const isSelected = userAnswer?.includes(option);

    return getOptionClassName({
      isSelected: !!isSelected,
      isSubmitted,
      feedback,
    });
  };

  const handleOptionClick = (option: string) => {
    if (question.type === "mcq" || question.type === "tf") {
      handleSingleAnswerChange(option);
    } else if (question.type === "ms") {
      handleMultipleAnswerChange(option);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, option: string) => {
    if (!isSubmitted && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleOptionClick(option);
    }
  };

  if (question.type === "matching") {
    return (
      <MatchingQuestion
        question={question}
        userAnswer={userAnswer}
        onAnswerChange={onAnswerChange}
        showFeedback={showFeedback}
        isSubmitted={isSubmitted}
      />
    );
  }

  if (question.type === "fib") {
    return (
      <FillInBlankQuestion
        question={question}
        userAnswer={userAnswer}
        onAnswerChange={onAnswerChange}
        showFeedback={showFeedback}
        isSubmitted={isSubmitted}
      />
    );
  }

  return (
    <div className="space-y-4">
      {question.options.map((option, index) => {
        const feedback = getOptionFeedback(option);
        const isSelected = userAnswer?.includes(option);

        return (
          <div
            key={index}
            className={getOptionClasses(option)}
            onClick={() => handleOptionClick(option)}
            role="button"
            tabIndex={isSubmitted ? -1 : 0}
            onKeyDown={(e) => handleKeyDown(e, option)}
            aria-pressed={isSelected}
            aria-describedby={feedback ? `feedback-${index}` : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {question.type === "ms" ? (
                  <div
                    className={`w-5 h-5 min-w-5 min-h-5 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "border-current bg-current"
                        : "border-gray-400 dark:border-gray-500"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 min-w-5 min-h-5 border-2 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "border-current bg-current"
                        : "border-gray-400 dark:border-gray-500"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                )}
                <div className="text-sm font-medium prose prose-sm max-w-none dark:prose-invert flex-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {option}
                  </ReactMarkdown>
                </div>
              </div>

              {feedback && (
                <div
                  className={`flex items-center space-x-1 ${getFeedbackColor(feedback)}`}
                >
                  {getFeedbackIcon(feedback)}
                </div>
              )}
            </div>

            {feedback && (
              <div id={`feedback-${index}`} className="sr-only">
                {getFeedbackText(feedback)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getFeedbackColor(feedback: FeedbackType): string {
  switch (feedback) {
    case "correct":
      return "text-green-600 dark:text-green-400";
    case "incorrect":
      return "text-red-600 dark:text-red-400";
    case "missed":
      return "text-yellow-600 dark:text-yellow-400";
    default:
      return "";
  }
}

function getFeedbackIcon(feedback: FeedbackType) {
  const icons = {
    correct: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    incorrect: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    ),
    missed: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return feedback ? icons[feedback] : null;
}

function getFeedbackText(feedback: FeedbackType): string {
  switch (feedback) {
    case "correct":
      return "Correct answer";
    case "incorrect":
      return "Incorrect answer";
    case "missed":
      return "This was a correct answer you missed";
    default:
      return "";
  }
}
