import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MatchingQuestion } from "./MatchingQuestion";
import { FillInBlankQuestion } from "./FillInBlankQuestion";
import { QuestionViewProps } from "../../types";
import { Check, X, AlertTriangle } from "lucide-react";

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
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const feedback = getOptionFeedback(option);
        const isSelected = userAnswer?.includes(option);
        const optionNumber = index + 1;

        return (
          <div
            key={index}
            className={`
              option-card group
              ${isSelected ? "selected" : ""}
              ${feedback === "correct" ? "correct" : ""}
              ${feedback === "incorrect" ? "incorrect" : ""}
              ${feedback === "missed" ? "correct" : ""}
            `}
            onClick={() => handleOptionClick(option)}
            role="button"
            tabIndex={isSubmitted ? -1 : 0}
            onKeyDown={(e) => handleKeyDown(e, option)}
            aria-pressed={isSelected}
            aria-describedby={feedback ? `feedback-${index}` : undefined}
          >
            <div className="flex items-center gap-4">
              {/* Option Number */}
              <span
                className={`
                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                font-semibold text-sm transition-colors
                ${
                  isSelected
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-primary-subtle)] group-hover:text-[var(--color-text)]"
                }
              `}
              >
                {optionNumber}
              </span>

              {/* Selection Indicator */}
              <div
                className={`
                flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                transition-all duration-200
                ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                    : "border-[var(--color-border-strong)] group-hover:border-[var(--color-primary-light)]"
                }
                ${question.type === "ms" ? "rounded-md" : "rounded-full"}
              `}
              >
                {isSelected &&
                  (question.type === "ms" ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  ))}
              </div>

              {/* Option Content */}
              <div className="flex-1 min-w-0">
                <div className="text-[var(--color-text)] prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {option}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Feedback Icon */}
              {feedback && (
                <div className="flex-shrink-0">
                  {feedback === "correct" && (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-success)] flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {feedback === "incorrect" && (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-error)] flex items-center justify-center">
                      <X className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {feedback === "missed" && (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-warning)] flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                  )}
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
