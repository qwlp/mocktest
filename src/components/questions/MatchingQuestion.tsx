import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MatchingQuestionProps, MatchingPair, DragItem } from "../../types";
import { getMatchPromptClassName, getMatchAnswerClassName } from "../../utils";

export function MatchingQuestion({
  question,
  userAnswer,
  onAnswerChange,
  showFeedback = false,
  isSubmitted = false,
}: MatchingQuestionProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const dragCounter = useRef(0);

  const matchingPairs: MatchingPair[] = question.matchingPairs || [];
  const prompts = matchingPairs.map((pair) => pair.prompt);
  const correctAnswers = matchingPairs.map((pair) => pair.answer);

  useEffect(() => {
    const shuffled = [...correctAnswers].sort(() => Math.random() - 0.5);
    setShuffledAnswers(shuffled);
  }, [question._id]);

  useEffect(() => {
    if (userAnswer && userAnswer.length > 0) {
      const matchesFromAnswer: Record<string, string> = {};
      userAnswer.forEach((pair) => {
        const [prompt, answer] = pair.split(":");
        if (prompt && answer) {
          matchesFromAnswer[prompt] = answer;
        }
      });
      setMatches(matchesFromAnswer);
    } else {
      setMatches({});
    }
  }, [userAnswer]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const matchArray = Object.entries(matches).map(
        ([prompt, answer]) => `${prompt}:${answer}`,
      );
      onAnswerChange(matchArray);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [matches, onAnswerChange]);

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    if (isSubmitted) return;
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(item));
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverTarget(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragOverTarget(targetId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetPrompt: string) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragOverTarget(null);

    if (isSubmitted) return;

    try {
      const item: DragItem = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (item.type === "answer") {
        addMatch(item.content, targetPrompt);
      }
    } catch (error) {
      console.error("Error parsing drag data:", error);
    }
  };

  const addMatch = useCallback((answer: string, prompt: string) => {
    setMatches((prevMatches) => {
      const newMatches = { ...prevMatches };
      Object.keys(newMatches).forEach((key) => {
        if (newMatches[key] === answer) {
          delete newMatches[key];
        }
      });
      newMatches[prompt] = answer;
      return newMatches;
    });
  }, []);

  const handleRemoveMatch = (prompt: string) => {
    if (isSubmitted) return;

    setMatches((prevMatches) => {
      const newMatches = { ...prevMatches };
      delete newMatches[prompt];
      return newMatches;
    });
  };

  const getMatchFeedback = (prompt: string, answer: string) => {
    if (!showFeedback) return null;

    const correctPair = matchingPairs.find((pair) => pair.prompt === prompt);
    const isCorrect = correctPair?.answer === answer;

    return isCorrect ? "correct" : "incorrect";
  };

  const getUnusedAnswers = () => {
    const usedAnswers = Object.values(matches);
    return shuffledAnswers.filter((answer) => !usedAnswers.includes(answer));
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-[var(--color-text-secondary)] mb-4">
        Drag and drop or click to match items from the left column with items
        from the right column.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <h3 className="font-semibold text-[var(--color-text)] mb-4">
            Prompts
          </h3>
          {prompts.map((prompt, index) => {
            const matchedAnswer = matches[prompt];
            const feedback = matchedAnswer
              ? getMatchFeedback(prompt, matchedAnswer)
              : null;

            return (
              <div
                key={`prompt-${index}`}
                className={getMatchPromptClassName({
                  isDragOver: dragOverTarget === prompt,
                  isCorrect: feedback === "correct",
                  isIncorrect: feedback === "incorrect",
                  isSubmitted,
                })}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, prompt)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, prompt)}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert text-[var(--color-text)] mb-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {prompt}
                  </ReactMarkdown>
                </div>

                {matchedAnswer && (
                  <div
                    className={getMatchAnswerClassName({
                      isCorrect: feedback === "correct",
                      isIncorrect: feedback === "incorrect",
                    })}
                  >
                    <span className="text-sm font-medium">{matchedAnswer}</span>
                    {!isSubmitted && (
                      <button
                        onClick={() => handleRemoveMatch(prompt)}
                        className="ml-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
                        aria-label={`Remove match for ${prompt}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                {feedback === "correct" && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-success)] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}

                {feedback === "incorrect" && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-error)] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✗</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-[var(--color-text)] mb-4">
            Answers
          </h3>
          <div className="space-y-2">
            {getUnusedAnswers().map((answer, index) => (
              <div
                key={`answer-${index}`}
                draggable={!isSubmitted}
                onDragStart={(e) =>
                  handleDragStart(e, {
                    id: `answer-${index}`,
                    content: answer,
                    type: "answer",
                  })
                }
                onDragEnd={handleDragEnd}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all duration-200
                  ${draggedItem?.content === answer ? "opacity-50 scale-95" : "opacity-100 scale-100"}
                  ${
                    isSubmitted
                      ? "cursor-default bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]"
                  }
                `}
                onClick={() => {
                  if (!isSubmitted) {
                    const unmatchedPrompt = prompts.find(
                      (prompt) => !matches[prompt],
                    );
                    if (unmatchedPrompt) {
                      addMatch(answer, unmatchedPrompt);
                    }
                  }
                }}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert text-[var(--color-text)] text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {answer}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          {getUnusedAnswers().length === 0 && (
            <div className="text-center py-8 text-[var(--color-text-muted)]">
              All answers have been matched
            </div>
          )}
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
