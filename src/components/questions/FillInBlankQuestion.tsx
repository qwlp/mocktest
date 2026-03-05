import React, { useEffect, useMemo, useState } from "react";
import { FillInBlankQuestionProps } from "../../types";
import { getFibInputClassName } from "../../utils";
import { getFibAnswerResults, getRequiredFibAnswerCount } from "../../utils";

export function FillInBlankQuestion({
  question,
  userAnswer,
  onAnswerChange,
  showFeedback = false,
  isSubmitted = false,
}: FillInBlankQuestionProps) {
  const inputCount = useMemo(() => getRequiredFibAnswerCount(question), [question]);
  const [inputValues, setInputValues] = useState<string[]>(
    Array.from({ length: inputCount }, (_, index) => userAnswer[index] || ""),
  );

  useEffect(() => {
    const values = Array.from(
      { length: inputCount },
      (_, index) => userAnswer[index] || "",
    );
    setInputValues(values);
  }, [inputCount, userAnswer]);

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isSubmitted) return;

    const value = e.target.value;
    const updatedValues = [...inputValues];
    updatedValues[index] = value;
    setInputValues(updatedValues);
    onAnswerChange(updatedValues);
  };

  const inputResults = showFeedback
    ? getFibAnswerResults(question, inputValues)
    : Array.from({ length: inputCount }, () => null);

  const hasAnyInput = inputValues.some((value) => value.trim().length > 0);
  const allAnswered = inputValues.every((value) => value.trim().length > 0);
  const allCorrect =
    allAnswered &&
    inputResults.length === inputCount &&
    inputResults.every((result) => result === true);

  const getTextColor = (result: boolean | null, value: string) => {
    if (!showFeedback || !value.trim()) return "dark:text-dark-text";
    return result
      ? "text-[var(--color-success)] dark:text-[#d48fa8]"
      : "text-red-800 dark:text-red-200";
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
          Type your answer below:
        </label>

        <div className="space-y-3">
          {Array.from({ length: inputCount }, (_, index) => {
            const value = inputValues[index] || "";
            const result = inputResults[index] ?? null;

            return (
              <div key={index}>
                {inputCount > 1 && (
                  <label
                    htmlFor={`fib-input-${index}`}
                    className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300"
                  >
                    Blank {index + 1}
                  </label>
                )}

                <div className="relative">
                  <input
                    id={`fib-input-${index}`}
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(index, e)}
                    disabled={isSubmitted}
                    placeholder={`Enter answer ${index + 1}...`}
                    className={`
                      ${getFibInputClassName(result, isSubmitted)}
                      ${getTextColor(result, value)}
                    `}
                  />

                  {showFeedback && value.trim() && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {result ? (
                        <div className="w-6 h-6 bg-[var(--color-success)] rounded-full flex items-center justify-center">
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
              </div>
            );
          })}
        </div>

        {showFeedback && hasAnyInput && (
          <div className="mt-2">
            {allCorrect ? (
              <p className="text-sm text-[var(--color-success)] dark:text-[#d48fa8] flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
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
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {allAnswered ? "Some answers are incorrect." : "Complete all blanks."}
              </p>
            )}
          </div>
        )}
      </div>

      {showFeedback && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
          <h4 className="font-semibold dark:text-dark-text mb-2">Correct Answers:</h4>
          <div className="space-y-1">
            {inputCount > 1
              ? Array.from({ length: inputCount }, (_, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 dark:text-white"
                  >
                    • Blank {index + 1}: {question.correctAnswers[index] || "(not configured)"}
                  </div>
                ))
              : question.correctAnswers.map((answer, index) => (
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
