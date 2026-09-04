import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Play, HelpCircle, ArrowRight, Folder, ChevronRight, Home } from "lucide-react";

interface TestListPageProps {
  onStartTest: (testId: Id<"tests">) => void;
}

function TestCard({
  test,
  onStart,
  index,
}: {
  test: any;
  onStart: (id: Id<"tests">) => void;
  index: number;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="group relative animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card p-6 sm:p-8 transition-all duration-300 hover:shadow-soft-lg">
        <div />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="badge badge-rose">Test {index + 1}</span>
              {test.questionCount && (
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  {test.questionCount} questions
                </span>
              )}
            </div>

            <h2 className="text-2xl font-display font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary-light)] transition-colors">
              {test.name}
            </h2>

            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
              {test.description || "I got bored."}
            </p>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => onStart(test._id)}
              className="btn btn-primary group/btn whitespace-nowrap"
            >
              <Play className="w-4 h-4" />
              <span>Start Test</span>
              <ArrowRight
                className={`w-4 h-4 transition-transform duration-300 ${
                  isHovered ? "translate-x-1" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(179, 136, 163, 0.1) 0%, transparent 70%)",
            opacity: isHovered ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
}

export function TestListPage({ onStartTest }: TestListPageProps) {
  const tests = useQuery(api.practiceTest.getTests);
  const folders = useQuery(api.practiceTest.getFolders);
  const [selectedFolderId, setSelectedFolderId] = React.useState<Id<"folders"> | null>(null);

  if (tests === undefined || folders === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <p className="text-[var(--color-text-secondary)] font-medium animate-pulse">
          Loading your tests...
        </p>
      </div>
    );
  }

  const childFolders = folders.filter(
    (folder) => (folder.parentId ?? null) === selectedFolderId,
  );
  const visibleTests = tests.filter(
    (test) => (test.folderId ?? null) === selectedFolderId,
  );
  const breadcrumbs: typeof folders = [];
  let currentId = selectedFolderId;
  while (currentId) {
    const folder = folders.find((item) => item._id === currentId);
    if (!folder) break;
    breadcrumbs.unshift(folder);
    currentId = folder.parentId ?? null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-[var(--color-text-secondary)]" aria-label="Folder breadcrumb">
        <button type="button" onClick={() => setSelectedFolderId(null)} className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]"><Home className="h-4 w-4" /> All folders</button>
        {breadcrumbs.map((folder) => <React.Fragment key={folder._id}><ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" /><button type="button" onClick={() => setSelectedFolderId(folder._id)} className="rounded-lg px-2 py-1 hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]">{folder.name}</button></React.Fragment>)}
      </nav>

      {childFolders.length > 0 && (
        <section className="mb-8">
          <h1 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Folders</h1>
          <div className="grid gap-4 sm:grid-cols-2">
            {childFolders.map((folder) => {
              const directQuizCount = tests.filter((test) => test.folderId === folder._id).length;
              return <button key={folder._id} type="button" onClick={() => setSelectedFolderId(folder._id)} className="card group flex items-center gap-4 p-5 text-left transition-all hover:border-[var(--color-primary)] hover:shadow-soft-lg">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"><Folder className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-lg font-semibold text-[var(--color-text)]">{folder.name}</span><span className="text-sm text-[var(--color-text-muted)]">{directQuizCount} {directQuizCount === 1 ? "quiz" : "quizzes"}</span></span>
                <ChevronRight className="h-5 w-5 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1" />
              </button>;
            })}
          </div>
        </section>
      )}

      {visibleTests.length === 0 && childFolders.length === 0 ? (
        <div className="text-center py-16 card animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-primary-subtle)] flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <p className="text-[var(--color-text-secondary)] text-lg mb-2">
            No quizzes in this folder
          </p>
          <p className="text-[var(--color-text-muted)] text-sm">
            Check back later for new content!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleTests.map((test, index) => (
            <TestCard
              key={test._id}
              test={test}
              onStart={onStartTest}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div
        className="mt-12 text-center text-sm text-[var(--color-text-muted)] animate-fade-in"
        style={{ animationDelay: "0.5s" }}
      >
        <p>
          Questions? Contact{" "}
          <a
            href="https://t.me/sokpiseththin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] hover:underline"
          >
            @sokpiseththin
          </a>{" "}
          on Telegram
        </p>
      </div>
    </div>
  );
}
