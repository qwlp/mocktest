import React from "react";
import { Doc } from "../../../convex/_generated/dataModel";

interface TestHeaderProps {
  test: Doc<"tests">;
  currentQuestionIndex: number;
  totalQuestions: number;
  onExitTest: () => void;
  onSubmit: () => void;
  isSubmitted: boolean;
}

export function TestHeader({
  test,
  currentQuestionIndex,
  totalQuestions,
  onExitTest,
  onSubmit,
  isSubmitted,
}: TestHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="hidden sm:flex items-center gap-12"></div>

      <div className="flex gap-4">
        {!isSubmitted && (
          <button onClick={onSubmit} className="btn btn-primary ripple">
            Submit
          </button>
        )}

        <button onClick={onExitTest} className="btn btn-secondary">
          Exit Test
        </button>
      </div>
    </div>
  );
}
