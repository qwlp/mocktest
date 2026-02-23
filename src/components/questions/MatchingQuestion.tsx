import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MatchingQuestionProps, MatchingPair } from "../../types";
import { Check, X, ArrowRight } from "lucide-react";

export function MatchingQuestion({
  question,
  userAnswer,
  onAnswerChange,
  showFeedback = false,
  isSubmitted = false,
}: MatchingQuestionProps) {
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const matchingPairs: MatchingPair[] = question.matchingPairs || [];
  const prompts = matchingPairs.map((pair) => pair.prompt);
  const correctAnswers = matchingPairs.map((pair) => pair.answer);

  useEffect(() => {
    if (userAnswer && userAnswer.length > 0) {
      const newInputs: Record<number, string> = {};
      userAnswer.forEach((pair) => {
        const [promptIndex, answerNum] = pair.split(":");
        if (promptIndex && answerNum) {
          newInputs[parseInt(promptIndex, 10)] = answerNum;
        }
      });
      setInputs(newInputs);
    } else {
      setInputs({});
    }
  }, [userAnswer]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const answerArray = Object.entries(inputs)
        .filter(([, value]) => value.trim() !== "")
        .map(([promptIndex, answerNum]) => `${promptIndex}:${answerNum}`);
      onAnswerChange(answerArray);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [inputs, onAnswerChange]);

  const handleInputChange = useCallback(
    (promptIndex: number, value: string) => {
      if (isSubmitted) return;

      const cleaned = value.replace(/[^0-9]/g, "");
      const num = parseInt(cleaned, 10);

      // Validate the number is within range
      if (cleaned && (num < 1 || num > shuffledAnswers.length)) {
        return;
      }

      setInputs((prev) => ({
        ...prev,
        [promptIndex]: cleaned,
      }));
    },
    [isSubmitted],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, promptIndex: number, totalPrompts: number) => {
      if (isSubmitted) return;

      const currentValue = inputs[promptIndex] || "";

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (promptIndex > 0) {
            inputRefs.current[promptIndex - 1]?.focus();
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (promptIndex < totalPrompts - 1) {
            inputRefs.current[promptIndex + 1]?.focus();
          }
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          if (currentValue !== "" && promptIndex < totalPrompts - 1) {
            inputRefs.current[promptIndex + 1]?.focus();
          }
          break;
        case "Backspace":
          if (currentValue === "" && promptIndex > 0) {
            inputRefs.current[promptIndex - 1]?.focus();
          }
          break;
      }
    },
    [inputs, isSubmitted],
  );

  const getFeedback = (promptIndex: number, answerNum: string) => {
    if (!showFeedback || !answerNum) return null;

    const answerIndex = parseInt(answerNum, 10) - 1;
    const correctAnswer = correctAnswers[promptIndex];
    const userAnswerText = shuffledAnswers[answerIndex];

    if (userAnswerText === correctAnswer) {
      return "correct";
    }
    return "incorrect";
  };

  const getAnswerByNumber = (num: number): string => {
    const index = num - 1;
    return shuffledAnswers[index] || "";
  };

  const shuffledAnswers = React.useMemo(() => {
    return Array.from(new Set(correctAnswers));
  }, [correctAnswers]);

  const progress = Object.keys(inputs).filter(
    (k) => inputs[parseInt(k)] !== "",
  ).length;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: `${(progress / prompts.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {progress}/{prompts.length}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Prompts Column */}
        <div className="flex-1">
          <div className="flex items-center gap-3 pb-3 mb-4 border-b border-[var(--color-border)]">
            <span className="font-semibold text-[var(--color-text)]">
              Question
            </span>
          </div>

          <div className="space-y-4">
            {prompts.map((prompt, promptIndex) => {
              const inputValue = inputs[promptIndex] || "";
              const feedback = showFeedback
                ? getFeedback(promptIndex, inputValue)
                : null;
              const matchedAnswer = inputValue
                ? getAnswerByNumber(parseInt(inputValue, 10))
                : null;

              return (
                <div
                  key={promptIndex}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-200
                    ${
                      feedback === "correct"
                        ? "border-[var(--color-success)]"
                        : feedback === "incorrect"
                          ? "border-[var(--color-error)]"
                          : inputValue
                            ? "border-[var(--color-primary)]"
                            : "border-[var(--color-border)] hover:border-[var(--color-primary-light)]"
                    }
                    bg-[var(--color-surface)]
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Number Badge */}
                    <div
                      className={`
                        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-semibold
                        ${
                          feedback === "correct"
                            ? "bg-[var(--color-success)] text-white"
                            : feedback === "incorrect"
                              ? "bg-[var(--color-error)] text-white"
                              : inputValue
                                ? "bg-[var(--color-primary)] text-white"
                                : "bg-[var(--color-surface-elevated)] text-[var(--color-text)]"
                        }
                      `}
                    >
                      {promptIndex + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm max-w-none dark:prose-invert text-[var(--color-text)] mb-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {prompt}
                        </ReactMarkdown>
                      </div>

                      {/* Input with Match Display */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <input
                          ref={(el) => {
                            inputRefs.current[promptIndex] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={inputValue}
                          onChange={(e) =>
                            handleInputChange(promptIndex, e.target.value)
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(e, promptIndex, prompts.length)
                          }
                          disabled={isSubmitted}
                          placeholder="#"
                          className={`
                            w-14 h-10 text-center text-lg font-semibold rounded-lg border-2 
                            transition-all duration-200 focus:outline-none
                            ${
                              feedback === "correct"
                                ? "border-[var(--color-success)] focus:border-[var(--color-success)]"
                                : feedback === "incorrect"
                                  ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
                                  : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                            }
                            bg-[var(--color-surface)] text-[var(--color-text)]
                            disabled:cursor-not-allowed
                          `}
                          aria-label={`Match for question ${promptIndex + 1}`}
                        />

                        {/* Matched Answer Preview */}
                        {matchedAnswer && (
                          <div className="flex items-center gap-2 text-sm animate-fade-in">
                            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                            <span
                              className={`
                              px-3 py-1.5 rounded-md font-medium
                              ${
                                feedback === "correct"
                                  ? "bg-[var(--color-success)] text-white"
                                  : feedback === "incorrect"
                                    ? "bg-[var(--color-error)] text-white"
                                    : "bg-[var(--color-primary)] text-white"
                              }
                            `}
                            >
                              {matchedAnswer}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback Icon - Right side of card */}
                    {feedback && (
                      <div className="flex-shrink-0 self-center">
                        {feedback === "correct" ? (
                          <div className="w-10 h-10 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center">
                            <Check className="w-6 h-6 text-[var(--color-success)]" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[var(--color-error)]/20 flex items-center justify-center">
                            <X className="w-6 h-6 text-[var(--color-error)]" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Answers Column */}
        <div className="lg:w-72 shrink-0">
          <div className="font-semibold text-[var(--color-text)] pb-3 mb-4 border-b border-[var(--color-border)]">
            Answers
          </div>
          <div className="space-y-3">
            {shuffledAnswers.map((answer, index) => (
              <div
                key={index}
                className={`
                  p-3 rounded-xl border-2 transition-all duration-200
                  border-[var(--color-border)] bg-[var(--color-surface)]
                `}
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0 prose prose-sm max-w-none dark:prose-invert text-[var(--color-text)]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {answer}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Correct Answer Summary */}
      {showFeedback && (
        <div className="mt-6 p-5 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)]">
          <h4 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-[var(--color-success)]" />
            Correct Matches
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {matchingPairs.map((pair, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
              >
                <span className="font-medium text-[var(--color-text)]">
                  {index + 1}. {pair.prompt}
                </span>
                <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span className="text-[var(--color-success)] font-medium">
                  {pair.answer}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
