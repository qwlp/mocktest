import React from "react";
import { Id } from "../../../convex/_generated/dataModel";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Search, GripVertical, Copy, Pencil, Trash2, ChevronUp, ChevronDown, CheckSquare, Square } from "lucide-react";
import { MarkdownRenderer } from "../markdown/MarkdownRenderer";
import { QuestionType } from "../../../shared/adminSchema";

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

interface QuestionListProps {
  questions: AdminQuestion[];
  filters: {
    search: string;
    questionType: QuestionType | "all";
  };
  bulkSelection: Id<"questions">[];
  onFiltersChange: (next: QuestionListProps["filters"]) => void;
  onSelectionChange: (questionIds: Id<"questions">[]) => void;
  onEdit: (questionId: Id<"questions">) => void;
  onDuplicate: (questionId: Id<"questions">) => void;
  onDelete: (questionIds: Id<"questions">[]) => void;
  onReorder: (orderedQuestionIds: Id<"questions">[]) => void;
}

function SortableQuestionItem({
  question,
  index,
  selected,
  canReorder,
  onToggleSelection,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  question: AdminQuestion;
  index: number;
  selected: boolean;
  canReorder: boolean;
  onToggleSelection: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: question._id,
      disabled: !canReorder,
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`rounded-2xl border p-4 bg-[var(--color-surface)] ${
        isDragging ? "shadow-soft-lg border-[var(--color-primary)]" : "border-[var(--color-border)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <button type="button" onClick={onToggleSelection} className="mt-1">
          {selected ? (
            <CheckSquare className="w-5 h-5 text-[var(--color-primary)]" />
          ) : (
            <Square className="w-5 h-5 text-[var(--color-text-muted)]" />
          )}
        </button>

        <button
          type="button"
          className={`mt-1 ${canReorder ? "cursor-grab text-[var(--color-text-muted)]" : "cursor-not-allowed text-[var(--color-border)]"}`}
          {...attributes}
          {...listeners}
          disabled={!canReorder}
          title={canReorder ? "Drag to reorder" : "Clear search/filter to reorder"}
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="badge badge-rose">Q{index + 1}</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--color-bg)] text-[var(--color-text-secondary)]">
              {question.type.toUpperCase()}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {question.questionId}
            </span>
          </div>
          <MarkdownRenderer
            content={question.text}
            className="prose prose-sm max-w-none dark:prose-invert text-[var(--color-text)]"
          />
          {question.options.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {question.options.slice(0, 4).map((option) => (
                <span
                  key={option}
                  className={`text-xs px-2 py-1 rounded-full ${
                    question.correctAnswers.includes(option)
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {option}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button type="button" onClick={onMoveUp} className="btn btn-ghost" disabled={!canReorder}>
            <ChevronUp className="w-4 h-4" />
          </button>
          <button type="button" onClick={onMoveDown} className="btn btn-ghost" disabled={!canReorder}>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button type="button" onClick={onDuplicate} className="btn btn-ghost">
            <Copy className="w-4 h-4" />
          </button>
          <button type="button" onClick={onEdit} className="btn btn-ghost">
            <Pencil className="w-4 h-4" />
          </button>
          <button type="button" onClick={onDelete} className="btn btn-ghost text-[var(--color-error)]">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuestionList({
  questions,
  filters,
  bulkSelection,
  onFiltersChange,
  onSelectionChange,
  onEdit,
  onDuplicate,
  onDelete,
  onReorder,
}: QuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const filteredQuestions = React.useMemo(() => {
    return questions.filter((question) => {
      const matchesSearch = filters.search.trim()
        ? question.text.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const matchesType =
        filters.questionType === "all" || question.type === filters.questionType;
      return matchesSearch && matchesType;
    });
  }, [filters.questionType, filters.search, questions]);

  const reorderEnabled =
    filters.search.trim().length === 0 && filters.questionType === "all";

  const handleDragEnd = (event: DragEndEvent) => {
    if (!reorderEnabled || !event.over || event.active.id === event.over.id) {
      return;
    }

    const oldIndex = questions.findIndex((question) => question._id === event.active.id);
    const newIndex = questions.findIndex((question) => question._id === event.over?.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const nextOrder = arrayMove(questions, oldIndex, newIndex).map(
      (question) => question._id,
    );
    onReorder(nextOrder);
  };

  const toggleSelection = (questionId: Id<"questions">) => {
    const nextSelection = bulkSelection.includes(questionId)
      ? bulkSelection.filter((id) => id !== questionId)
      : [...bulkSelection, questionId];
    onSelectionChange(nextSelection);
  };

  const selectAllVisible = () => {
    if (filteredQuestions.length === bulkSelection.length) {
      onSelectionChange([]);
      return;
    }
    onSelectionChange(filteredQuestions.map((question) => question._id));
  };

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--color-border)] space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Questions</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Reorder by drag and drop or the move buttons. Reordering is disabled while filtered.
            </p>
          </div>
          {bulkSelection.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onDelete(bulkSelection)}
                className="btn btn-secondary text-[var(--color-error)]"
              >
                <Trash2 className="w-4 h-4" />
                Delete {bulkSelection.length}
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={filters.search}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  search: event.target.value,
                })
              }
              placeholder="Search questions..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <select
            value={filters.questionType}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                questionType: event.target.value as QuestionType | "all",
              })
            }
            className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="all">All types</option>
            <option value="mcq">MCQ</option>
            <option value="tf">True/False</option>
            <option value="ms">Multi Select</option>
            <option value="matching">Matching</option>
            <option value="fib">Fill in Blank</option>
          </select>
          <button type="button" onClick={selectAllVisible} className="btn btn-secondary">
            {bulkSelection.length === filteredQuestions.length && filteredQuestions.length > 0
              ? "Clear Selection"
              : "Select Visible"}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              No questions match the current search or filter.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((question) => question._id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredQuestions.map((question, index) => {
                const currentIndex = questions.findIndex(
                  (candidate) => candidate._id === question._id,
                );
                return (
                  <SortableQuestionItem
                    key={question._id}
                    question={question}
                    index={currentIndex}
                    selected={bulkSelection.includes(question._id)}
                    canReorder={reorderEnabled}
                    onToggleSelection={() => toggleSelection(question._id)}
                    onEdit={() => onEdit(question._id)}
                    onDuplicate={() => onDuplicate(question._id)}
                    onDelete={() => onDelete([question._id])}
                    onMoveUp={() => {
                      if (currentIndex <= 0) {
                        return;
                      }
                      const nextOrder = arrayMove(questions, currentIndex, currentIndex - 1).map(
                        (candidate) => candidate._id,
                      );
                      onReorder(nextOrder);
                    }}
                    onMoveDown={() => {
                      if (currentIndex === -1 || currentIndex >= questions.length - 1) {
                        return;
                      }
                      const nextOrder = arrayMove(questions, currentIndex, currentIndex + 1).map(
                        (candidate) => candidate._id,
                      );
                      onReorder(nextOrder);
                    }}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
