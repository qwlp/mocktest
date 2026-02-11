import React, { useState, useEffect } from "react";
import { FillInBlankQuestionProps } from "../../types";
import { getFibInputClassName, normalizeText } from "../../utils";

export function FillInBlankQuestion({
  question,
  userAnswer,
  onAnswerChange,
  showFeedback = false,
  isSubmitted = false,
}: FillInBlankQuestionProps) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (userAnswer && userAnswer.length > 0) {
      setInputValue(userAnswer[0] || "");
    } else {
      setInputValue("");
    }
  }, [userAnswer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitted) return;

    const value = e.target.value;
    setInputValue(value);
    onAnswerChange([value]);
  };

  const checkAnswer = (): boolean | null => {
    if (!inputValue.trim()) return null;

    const userAnswerTrimmed = inputValue.trim().toLowerCase();
    const correctAnswers = question.correctAnswers.map((answer) =>
      answer.toLowerCase(),
    );

    return correctAnswers.some((correctAnswer) => {
      if (userAnswerTrimmed === correctAnswer) return true;

      const normalizedUser = normalizeText(userAnswerTrimmed);
      const normalizedCorrect = normalizeText(correctAnswer);

      return normalizedUser === normalizedCorrect;
    });
  };

  const isCorrect = showFeedback ? checkAnswer() : null;

  const getTextColor = () => {
    if (!showFeedback || !inputValue.trim())
      return "text-gray-900 dark:text-dark-text";

    return isCorrect
      ? "text-green-800 dark:text-green-200"
      : "text-red-800 dark:text-red-200";
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label
          htmlFor="fib-input"
          className="block text-sm font-medium text-gray-700 dark:text-white mb-2"
        >
          Type your answer below:
        </label>
        <div className="relative">
          <input
            id="fib-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={isSubmitted}
            placeholder="Enter your answer here..."
            className={`
              ${getFibInputClassName(isCorrect, isSubmitted)}
              ${getTextColor()}
            `}
          />

          {showFeedback && inputValue.trim() && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isCorrect ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>

        {showFeedback && inputValue.trim() && (
          <div className="mt-2">
            {isCorrect ? (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Correct!
              </p>
            ) : (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Incorrect. Try again!
              </p>
            )}
          </div>
        )}
      </div>

      {showFeedback && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
          <h4 className="font-semibold text-gray-800 dark:text-dark-text mb-2">
            Correct Answers:
          </h4>
          <div className="space-y-1">
            {question.correctAnswers.map((answer, index) => (
              <div
                key={index}
                className="text-sm text-gray-600 dark:text-white"
              >
                • {answer}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
