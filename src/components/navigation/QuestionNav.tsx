import React, { useState } from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import { QuestionStatus } from "../../types";
import { Check, ChevronLeft } from "lucide-react";

interface QuestionNavProps {
  questions: Doc<"questions">[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  getQuestionStatus: (index: number) => QuestionStatus;
  isSubmitted: boolean;
}

function QuestionTypeBadge({ type }: { type: string }) {
  const typeLabels: Record<string, string> = {
    mcq: "MC",
    tf: "T/F",
    ms: "MS",
    matching: "M",
    fib: "FIB",
  };

  return (
    <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
      {typeLabels[type] || type}
    </span>
  );
}

export function QuestionNav({
  questions,
  currentQuestionIndex,
  onQuestionSelect,
  getQuestionStatus,
  isSubmitted,
}: QuestionNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`
      relative rounded-2xl shadow-soft transition-all duration-300 ease-out overflow-hidden
      ${isCollapsed ? "w-16" : "w-full"}
    `}
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-0 top-1 z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
        }}
        aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
        aria-expanded={!isCollapsed}
      >
        <ChevronLeft
          className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
        />
      </button>

      <div className="p-4">
        {/* Header */}
        <div
          className={`transition-all duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}
        >
          <h3 className="text-lg font-display font-bold mb-1 text-[var(--color-text)]">
            Questions
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">
            {
              questions.filter((_, i) => getQuestionStatus(i) === "answered")
                .length
            }{" "}
            of {questions.length} answered
          </p>
        </div>

        {/* Questions Grid */}
        <div
          className={`
          transition-all duration-300
          ${isCollapsed ? "opacity-0 max-h-0" : "opacity-100"}
        `}
        >
          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, index) => {
              const status = getQuestionStatus(index);
              const isActive = currentQuestionIndex === index;
              const isAnswered = status === "answered";

              return (
                <button
                  key={q._id}
                  onClick={() => onQuestionSelect(index)}
                  className={`
                    relative aspect-square rounded-xl flex items-center justify-center
                    font-semibold text-sm transition-all duration-200
                    ${
                      isActive
                        ? "ring-2 ring-[var(--color-primary)] ring-offset-2"
                        : ""
                    }
                    ${
                      isAnswered
                        ? "bg-[var(--color-success)] text-white shadow-md"
                        : isActive
                          ? "bg-[var(--color-primary)] text-white shadow-md"
                          : "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:opacity-80"
                    }
                  `}
                  aria-label={`Go to question ${index + 1}`}
                  aria-current={isActive ? "true" : "false"}
                >
                  {isAnswered ? <Check className="w-4 h-4" /> : index + 1}

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-primary-light)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsed View - Just numbers */}
        <div
          className={`
          transition-all duration-300 flex flex-col items-center gap-2
          ${isCollapsed ? "opacity-100" : "opacity-0 max-h-0"}
        `}
        >
          {questions.map((q, index) => {
            const status = getQuestionStatus(index);
            const isActive = currentQuestionIndex === index;
            const isAnswered = status === "answered";

            return (
              <button
                key={q._id}
                onClick={() => onQuestionSelect(index)}
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                  transition-all duration-200
                  ${
                    isAnswered
                      ? "bg-[var(--color-success)] text-white"
                      : isActive
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
                  }
                `}
              >
                {isAnswered ? "✓" : index + 1}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={`
          mt-4 pt-4 border-t border-[var(--color-border)] transition-all duration-300
          ${isCollapsed ? "opacity-0" : "opacity-100"}
        `}
        >
          <div className="text-xs text-center text-[var(--color-text-muted)]">
            {isSubmitted ? (
              <span className="text-[var(--color-success)] font-medium flex items-center justify-center gap-1">
                <Check className="w-3 h-3" />
                Test Submitted
              </span>
            ) : (
              "Click to navigate"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
