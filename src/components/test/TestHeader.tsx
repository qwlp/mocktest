import React from "react";
import { Doc } from "../../../convex/_generated/dataModel";

interface TestHeaderProps {
  test: Doc<"tests">;
  onExitTest: () => void;
}

export function TestHeader({ test, onExitTest }: TestHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text">
          {test.name}
        </h1>
        {test.description && (
          <p className="text-gray-600 dark:text-dark-text-secondary mt-1">
            {test.description}
          </p>
        )}
      </div>
      <button onClick={onExitTest} className="btn btn-secondary">
        Exit Test
      </button>
    </div>
  );
}
