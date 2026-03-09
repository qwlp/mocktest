import React from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Plus, Trash2, Globe, FilePenLine } from "lucide-react";
import {
  type NormalizedQuestionInput,
  type QuestionInput,
  type QuestionType,
} from "../../../shared/adminSchema";
import { QuestionEditorDrawer } from "./QuestionEditorDrawer";
import { QuestionList } from "./QuestionList";

interface AdminQuestion {
  _id: Id<"questions">;
  questionId: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswers: string[];
  matchingPairs?: Array<{ prompt: string; answer: string }>;
  matchingAnswers?: string[];
  sortOrder: number;
}

interface AdminTest {
  _id: Id<"tests">;
  name: string;
  description?: string;
  status: "draft" | "published";
  updatedAt: number;
}

interface TestEditorPageProps {
  test: AdminTest;
  questions: AdminQuestion[];
  filters: {
    search: string;
    questionType: QuestionType | "all";
  };
  bulkSelection: Id<"questions">[];
  editorMode: "create" | "edit" | null;
  selectedQuestionId: Id<"questions"> | null;
  pendingAction: string | null;
  onFiltersChange: (filters: TestEditorPageProps["filters"]) => void;
  onSelectionChange: (questionIds: Id<"questions">[]) => void;
  onOpenCreateQuestion: () => void;
  onEditQuestion: (questionId: Id<"questions">) => void;
  onCloseQuestionEditor: () => void;
  onTestDirtyChange: (dirty: boolean) => void;
  onQuestionDirtyChange: (dirty: boolean) => void;
  onSaveTest: (draft: { name: string; description?: string }) => Promise<void>;
  onToggleStatus: (status: "draft" | "published") => Promise<void>;
  onDeleteTest: () => Promise<void>;
  onSaveQuestion: (
    mode: "create" | "edit",
    questionId: Id<"questions"> | null,
    value: NormalizedQuestionInput,
  ) => Promise<void>;
  onDuplicateQuestion: (questionId: Id<"questions">) => Promise<void>;
  onDeleteQuestions: (questionIds: Id<"questions">[]) => Promise<void>;
  onReorderQuestions: (questionIds: Id<"questions">[]) => Promise<void>;
}

function formatUpdatedAt(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function TestEditorPage({
  test,
  questions,
  filters,
  bulkSelection,
  editorMode,
  selectedQuestionId,
  pendingAction,
  onFiltersChange,
  onSelectionChange,
  onOpenCreateQuestion,
  onEditQuestion,
  onCloseQuestionEditor,
  onTestDirtyChange,
  onQuestionDirtyChange,
  onSaveTest,
  onToggleStatus,
  onDeleteTest,
  onSaveQuestion,
  onDuplicateQuestion,
  onDeleteQuestions,
  onReorderQuestions,
}: TestEditorPageProps) {
  const [draftName, setDraftName] = React.useState(test.name);
  const [draftDescription, setDraftDescription] = React.useState(
    test.description ?? "",
  );

  React.useEffect(() => {
    setDraftName(test.name);
    setDraftDescription(test.description ?? "");
  }, [test.description, test.name, test._id]);

  React.useEffect(() => {
    onTestDirtyChange(
      draftName.trim() !== test.name || draftDescription.trim() !== (test.description ?? ""),
    );
  }, [draftDescription, draftName, onTestDirtyChange, test.description, test.name]);

  const activeQuestion = selectedQuestionId
    ? questions.find((question) => question._id === selectedQuestionId)
    : undefined;

  const initialQuestionValue = React.useMemo<QuestionInput | undefined>(() => {
    if (editorMode !== "edit" || !activeQuestion) {
      return undefined;
    }

    return {
      questionId: activeQuestion.questionId,
      text: activeQuestion.text,
      type: activeQuestion.type,
      options: activeQuestion.options,
      correctAnswers: activeQuestion.correctAnswers,
      matchingPairs: activeQuestion.matchingPairs,
      matchingAnswers: activeQuestion.matchingAnswers,
    };
  }, [activeQuestion, editorMode]);

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                  test.status === "published"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {test.status}
              </span>
              <span className="text-sm text-[var(--color-text-muted)]">
                Updated {formatUpdatedAt(test.updatedAt)}
              </span>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Test Name
                </label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Description
                </label>
                <textarea
                  value={draftDescription}
                  onChange={(event) => setDraftDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>

          <div className="xl:w-[300px] space-y-3">
            <button
              type="button"
              onClick={() =>
                void onSaveTest({
                  name: draftName.trim(),
                  description: draftDescription.trim() || undefined,
                })
              }
              className="btn btn-primary w-full justify-center"
              disabled={pendingAction === "save-test"}
            >
              <FilePenLine className="w-4 h-4" />
              {pendingAction === "save-test" ? "Saving..." : "Save Test Details"}
            </button>
            <button
              type="button"
              onClick={() =>
                void onToggleStatus(test.status === "draft" ? "published" : "draft")
              }
              className="btn btn-secondary w-full justify-center"
              disabled={pendingAction === "toggle-status"}
            >
              <Globe className="w-4 h-4" />
              {test.status === "draft" ? "Publish Test" : "Move to Draft"}
            </button>
            <button
              type="button"
              onClick={() => void onDeleteTest()}
              className="btn btn-secondary w-full justify-center text-[var(--color-error)]"
              disabled={pendingAction === "delete-test"}
            >
              <Trash2 className="w-4 h-4" />
              Delete Test
            </button>
            <button
              type="button"
              onClick={onOpenCreateQuestion}
              className="btn btn-primary w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>
      </section>

      <QuestionList
        questions={questions}
        filters={filters}
        bulkSelection={bulkSelection}
        onFiltersChange={onFiltersChange}
        onSelectionChange={onSelectionChange}
        onEdit={onEditQuestion}
        onDuplicate={(questionId) => void onDuplicateQuestion(questionId)}
        onDelete={(questionIds) => {
          const label =
            questionIds.length === 1
              ? "this question"
              : `${questionIds.length} questions`;
          if (!window.confirm(`Delete ${label}? This cannot be undone.`)) {
            return;
          }
          void onDeleteQuestions(questionIds);
        }}
        onReorder={(questionIds) => void onReorderQuestions(questionIds)}
      />

      <QuestionEditorDrawer
        open={editorMode !== null}
        testId={test._id}
        mode={editorMode ?? "create"}
        initialValue={initialQuestionValue}
        isSaving={pendingAction === "save-question"}
        onClose={onCloseQuestionEditor}
        onDirtyChange={onQuestionDirtyChange}
        onSave={async (value) => {
          await onSaveQuestion(editorMode ?? "create", selectedQuestionId, value);
          toast.success(
            editorMode === "edit" ? "Question updated." : "Question added.",
          );
        }}
      />
    </div>
  );
}
