import React from "react";
import { Score } from "../../types";

interface ScoreDisplayProps {
  score: Score;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const percentage = Math.round((score.correct / score.total) * 100);

  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Test Complete!
        </h3>
        <p className="text-blue-700 dark:text-blue-300">
          Your Score: {score.correct} out of {score.total} ({percentage}%)
        </p>
      </div>
    </div>
  );
}
