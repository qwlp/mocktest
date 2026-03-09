import React from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { Search, Plus, FileText } from "lucide-react";

interface AdminTestSummary {
  _id: Id<"tests">;
  name: string;
  description?: string;
  questionCount: number;
  status: "draft" | "published";
  updatedAt: number;
}

interface TestsSidebarProps {
  tests: AdminTestSummary[];
  selectedTestId: Id<"tests"> | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelectTest: (testId: Id<"tests">) => void;
  onCreateDraft: () => void;
  onOpenImport: () => void;
}

function formatUpdatedAt(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function TestsSidebar({
  tests,
  selectedTestId,
  searchValue,
  onSearchChange,
  onSelectTest,
  onCreateDraft,
  onOpenImport,
}: TestsSidebarProps) {
  return (
    <aside className="card h-full flex flex-col overflow-hidden">
      <div className="p-5 border-b border-[var(--color-border)] space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Tests</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Manage drafts, published tests, and question order.
            </p>
          </div>
          <span className="badge badge-rose">{tests.length}</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tests..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button onClick={onCreateDraft} className="btn btn-primary justify-center">
            <Plus className="w-4 h-4" />
            New Draft
          </button>
          <button onClick={onOpenImport} className="btn btn-secondary justify-center">
            <FileText className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              No tests match the current filter.
            </p>
          </div>
        ) : (
          tests.map((test) => {
            const isSelected = selectedTestId === test._id;
            return (
              <button
                key={test._id}
                type="button"
                onClick={() => onSelectTest(test._id)}
                className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--color-text)] truncate">
                      {test.name}
                    </h3>
                    {test.description && (
                      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-1">
                        {test.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      test.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {test.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <span>{test.questionCount} questions</span>
                  <span>Updated {formatUpdatedAt(test.updatedAt)}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
