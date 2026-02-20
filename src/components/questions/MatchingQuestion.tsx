import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MatchingQuestionProps, MatchingPair } from "../../types";

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
          if (currentValue !== "") {
            const nextIndex = Math.min(promptIndex + 1, totalPrompts - 1);
            inputRefs.current[nextIndex]?.focus();
          }
          break;
        case "Backspace":
          if (currentValue === "" && promptIndex > 0) {
            inputRefs.current[promptIndex - 1]?.focus();
          }
          break;
        case "Escape":
          e.preventDefault();
          inputRefs.current[promptIndex]?.blur();
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

  return (
    <div className="space-y-6">
      <div className="text-sm text-[var(--color-text-secondary)] mb-4">
        Type the number of the matching answer (1-{shuffledAnswers.length}). Use
        arrow keys to navigate, Enter/Tab to move to the next field.
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 pb-2 border-b border-[var(--color-border)] mb-4">
            <div className="w-6" />
            <span className="font-semibold text-[var(--color-text)]">
              Question
            </span>
          </div>

          <div className="space-y-3">
            {prompts.map((prompt, promptIndex) => {
              const inputValue = inputs[promptIndex] || "";
              const feedback = showFeedback
                ? getFeedback(promptIndex, inputValue)
                : null;

              let inputClassName =
                "w-12 h-10 px-2 text-center rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] font-medium";

              if (isSubmitted) {
                inputClassName += " cursor-not-allowed";
                if (feedback === "correct") {
                  inputClassName =
                    "w-12 h-10 px-2 text-center rounded-lg border-2 bg-[var(--color-success-light)] border-[var(--color-success)] text-[var(--color-text)] font-medium";
                } else if (feedback === "incorrect") {
                  inputClassName =
                    "w-12 h-10 px-2 text-center rounded-lg border-2 bg-[var(--color-error-light)] border-[var(--color-error)] text-[var(--color-text)] font-medium";
                }
              }

              return (
                <div key={promptIndex} className="flex items-start gap-3">
                  <div className="flex items-center gap-2 shrink-0 w-20">
                    <span className="font-medium text-[var(--color-text)]">
                      Q{promptIndex + 1}
                    </span>
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
                      className={inputClassName}
                      aria-label={`Question ${promptIndex + 1} answer`}
                    />
                  </div>
                  <div className="flex-1 prose prose-sm max-w-none dark:prose-invert text-[var(--color-text)] pt-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {prompt}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:w-80 shrink-0">
          <div className="font-semibold text-[var(--color-text)] pb-2 border-b border-[var(--color-border)] mb-4">
            Answers
          </div>
          <div className="space-y-2">
            {shuffledAnswers.map((answer, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
              >
                <span className="font-medium text-[var(--color-text)] mr-2">
                  {index + 1}.
                </span>
                <span className="text-[var(--color-text)]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {answer}
                  </ReactMarkdown>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showFeedback && (
        <div className="mt-6 p-4 bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)]">
          <h4 className="font-semibold text-[var(--color-text)] mb-2">
            Correct Matches:
          </h4>
          <div className="space-y-1 text-sm">
            {matchingPairs.map((pair, index) => (
              <div key={index} className="text-[var(--color-text-secondary)]">
                <span className="font-medium">{pair.prompt}</span> →{" "}
                {pair.answer}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
