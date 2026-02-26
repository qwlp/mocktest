import React, { useState, useMemo } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { Search, Plus, Edit2, Trash2, MoreVertical } from "lucide-react";

interface Test {
  _id: Id<"tests">;
  _creationTime: number;
  name: string;
  description?: string;
  questionCount: number;
}

interface TestListProps {
  tests: Test[];
  selectedTestId: Id<"tests"> | null;
  onSelectTest: (testId: Id<"tests">) => void;
  onEditTest: (test: Test) => void;
  onDeleteTest: (test: Test) => void;
  onCreateTest: () => void;
}

export function TestList({
  tests,
  selectedTestId,
  onSelectTest,
  onEditTest,
  onDeleteTest,
  onCreateTest,
}: TestListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredTestId, setHoveredTestId] = useState<Id<"tests"> | null>(null);

  const filteredTests = useMemo(() => {
    if (!searchQuery.trim()) return tests;
    const query = searchQuery.toLowerCase();
    return tests.filter(
      (test) =>
        test.name.toLowerCase().includes(query) ||
        (test.description?.toLowerCase() || "").includes(query),
    );
  }, [tests, searchQuery]);

  return (
    <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--color-text)]">Tests</h2>
          <button
            onClick={onCreateTest}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Test
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests..."
            className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Test List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 bg-[var(--color-primary-subtle)] rounded-full flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm">
              {searchQuery
                ? "No tests match your search"
                : "No tests yet. Create your first test!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filteredTests.map((test) => (
              <div
                key={test._id}
                onClick={() => onSelectTest(test._id)}
                onMouseEnter={() => setHoveredTestId(test._id)}
                onMouseLeave={() => setHoveredTestId(null)}
                className={`group p-4 cursor-pointer transition-all ${
                  selectedTestId === test._id
                    ? "bg-[var(--color-primary-subtle)] border-l-4 border-l-[var(--color-primary)]"
                    : "hover:bg-[var(--color-bg)] border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--color-text)] truncate">
                      {test.name}
                    </h3>
                    {test.description && (
                      <p className="text-sm text-[var(--color-text-muted)] mt-0.5 line-clamp-1">
                        {test.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                        {test.questionCount} question
                        {test.questionCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className={`flex items-center gap-1 transition-opacity ${
                      hoveredTestId === test._id || selectedTestId === test._id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTest(test);
                      }}
                      className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] rounded-lg transition-colors"
                      title="Edit test"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTest(test);
                      }}
                      className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
