import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface TestListPageProps {
  onStartTest: (testId: Id<"tests">) => void;
}

export function TestListPage({ onStartTest }: TestListPageProps) {
  const tests = useQuery(api.practiceTest.getTests) || [];

  if (tests === undefined) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-dark-text-secondary">
        Loading tests...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-dark-primary mb-8 text-justify">
        Mock Tests for Database Design (If anything is wrong contact
        @sokpiseththin in telegram) Good luck! More ER Diagrams are coming I'm
        just lazy
      </h1>
      {tests.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-dark-text-secondary">
          No practice tests available at the moment. Check back later!
        </p>
      ) : (
        <ul className="space-y-6">
          {tests.map((test) => {
            return (
              <li
                key={test._id}
                className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-1">
                      {test.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-3">
                      {test.description || "No description available."}
                    </p>
                  </div>
                  <button
                    onClick={() => onStartTest(test._id)}
                    className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-dark-primary-hover transition-colors"
                  >
                    Start Test
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
