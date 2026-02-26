import React, { useState, useMemo } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckSquare,
  Square,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Filter,
} from "lucide-react";
import { QuestionForm } from "./QuestionForm";

interface Question {
  _id: Id<"questions">;
  _creationTime: number;
  testId: Id<"tests">;
  text: string;
  type: "mcq" | "tf" | "ms" | "matching" | "fib";
  options: string[];
  correctAnswers: string[];
  questionId: string;
  matchingPairs?: Array<{ prompt: string; answer: string }>;
  matchingAnswers?: string[];
}

type QuestionType = "mcq" | "tf" | "ms" | "matching" | "fib";

interface QuestionManagerProps {
  testId: Id<"tests">;
  testName: string;
  questions: Question[];
  onAddQuestion: (data: {
    text: string;
    type: QuestionType;
    options: string[];
    correctAnswers: string[];
    matchingPairs?: Array<{ prompt: string; answer: string }>;
    matchingAnswers?: string[];
  }) => void;
  onUpdateQuestion: (
    questionId: Id<"questions">,
    data: {
      text: string;
      type: QuestionType;
      options: string[];
      correctAnswers: string[];
      matchingPairs?: Array<{ prompt: string; answer: string }>;
      matchingAnswers?: string[];
    },
  ) => void;
  onDeleteQuestions: (questionIds: Id<"questions">[]) => void;
  onDuplicateQuestion: (question: Question) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

const getQuestionTypeLabel = (type: QuestionType): string => {
  const labels: Record<QuestionType, string> = {
    mcq: "Multiple Choice",
    tf: "True/False",
    ms: "Multiple Select",
    matching: "Matching",
    fib: "Fill-in-the-Blank",
  };
  return labels[type];
};

const getQuestionTypeColor = (type: QuestionType): string => {
  const colors: Record<QuestionType, string> = {
    mcq: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    tf: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    ms: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    matching:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    fib: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  };
  return colors[type];
};

export function QuestionManager({
  testId,
  testName,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestions,
  onDuplicateQuestion,
  onBack,
  isSubmitting = false,
}: QuestionManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<QuestionType | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] =
    useState<Id<"questions"> | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] =
    useState<Id<"questions"> | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<
    Set<Id<"questions">>
  >(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((q) => q.text.toLowerCase().includes(query));
    }

    if (filterType !== "all") {
      filtered = filtered.filter((q) => q.type === filterType);
    }

    return filtered;
  }, [questions, searchQuery, filterType]);

  const handleSelectAll = () => {
    if (selectedQuestionIds.size === filteredQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(filteredQuestions.map((q) => q._id)));
    }
  };

  const handleSelectQuestion = (questionId: Id<"questions">) => {
    const newSelected = new Set(selectedQuestionIds);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestionIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedQuestionIds.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    onDeleteQuestions(Array.from(selectedQuestionIds));
    setSelectedQuestionIds(new Set());
    setShowDeleteConfirm(false);
  };

  const handleDuplicateSelected = () => {
    selectedQuestionIds.forEach((id) => {
      const question = questions.find((q) => q._id === id);
      if (question) {
        onDuplicateQuestion(question);
      }
    });
    setSelectedQuestionIds(new Set());
  };

  const editingQuestion = editingQuestionId
    ? questions.find((q) => q._id === editingQuestionId)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={onBack}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-1"
            >
              ← Back to Tests
            </button>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              {testName}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as QuestionType | "all")
              }
              className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="all">All Types</option>
              <option value="mcq">Multiple Choice</option>
              <option value="tf">True/False</option>
              <option value="ms">Multiple Select</option>
              <option value="matching">Matching</option>
              <option value="fib">Fill-in-the-Blank</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedQuestionIds.size > 0 && (
          <div className="mt-4 p-3 bg-[var(--color-primary-subtle)] rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--color-primary)]">
                {selectedQuestionIds.size} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDuplicateSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] hover:bg-white dark:hover:bg-[var(--color-surface)] rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Question Form */}
      {showAddForm && (
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
          <QuestionForm
            testId={testId}
            onSubmit={(data) => {
              onAddQuestion(data);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-[var(--color-primary-subtle)] rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">
              {searchQuery || filterType !== "all"
                ? "No questions match your filters"
                : "No questions yet"}
            </h3>
            <p className="text-[var(--color-text-secondary)] text-sm mb-4">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Add your first question to get started"}
            </p>
            {!searchQuery && filterType === "all" && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {/* Select All Header */}
            <div className="px-4 py-2 bg-[var(--color-bg)] flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                {selectedQuestionIds.size === filteredQuestions.length ? (
                  <CheckSquare className="w-4 h-4 text-[var(--color-primary)]" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                Select All
              </button>
            </div>

            {filteredQuestions.map((question, index) => (
              <div
                key={question._id}
                className={`group ${
                  editingQuestionId === question._id
                    ? "bg-[var(--color-bg)]"
                    : "hover:bg-[var(--color-bg)]"
                } transition-colors`}
              >
                {editingQuestionId === question._id ? (
                  <div className="p-4">
                    <QuestionForm
                      testId={testId}
                      initialData={{
                        text: question.text,
                        type: question.type,
                        options: question.options,
                        correctAnswers: question.correctAnswers,
                        matchingPairs: question.matchingPairs,
                        matchingAnswers: question.matchingAnswers,
                      }}
                      onSubmit={(data) => {
                        onUpdateQuestion(question._id, data);
                        setEditingQuestionId(null);
                      }}
                      onCancel={() => setEditingQuestionId(null)}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Selection Checkbox */}
                      <button
                        onClick={() => handleSelectQuestion(question._id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {selectedQuestionIds.has(question._id) ? (
                          <CheckSquare className="w-5 h-5 text-[var(--color-primary)]" />
                        ) : (
                          <Square className="w-5 h-5 text-[var(--color-text-muted)]" />
                        )}
                      </button>

                      {/* Drag Handle */}
                      <div className="mt-1 flex-shrink-0 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 cursor-grab">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-bg)] px-2 py-0.5 rounded">
                                Q{index + 1}
                              </span>
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded ${getQuestionTypeColor(
                                  question.type,
                                )}`}
                              >
                                {getQuestionTypeLabel(question.type)}
                              </span>
                            </div>
                            <p className="text-[var(--color-text)] text-sm line-clamp-2">
                              {question.text}
                            </p>

                            {/* Options Preview */}
                            {question.options.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {question.options
                                  .slice(0, 4)
                                  .map((option, i) => (
                                    <span
                                      key={i}
                                      className={`text-xs px-2 py-1 rounded ${
                                        question.correctAnswers.includes(option)
                                          ? "bg-[var(--color-success-light)] text-[var(--color-success)] font-medium"
                                          : "bg-[var(--color-bg)] text-[var(--color-text-muted)]"
                                      }`}
                                    >
                                      {option.length > 30
                                        ? option.slice(0, 30) + "..."
                                        : option}
                                    </span>
                                  ))}
                                {question.options.length > 4 && (
                                  <span className="text-xs px-2 py-1 text-[var(--color-text-muted)]">
                                    +{question.options.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Matching Pairs Preview */}
                            {question.matchingPairs &&
                              question.matchingPairs.length > 0 && (
                                <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                                  {question.matchingPairs.length} matching pair
                                  {question.matchingPairs.length !== 1
                                    ? "s"
                                    : ""}
                                </div>
                              )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                setExpandedQuestionId(
                                  expandedQuestionId === question._id
                                    ? null
                                    : question._id,
                                )
                              }
                              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
                              title="Toggle details"
                            >
                              {expandedQuestionId === question._id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => onDuplicateQuestion(question)}
                              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] rounded-lg transition-colors"
                              title="Duplicate question"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingQuestionId(question._id)}
                              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] rounded-lg transition-colors"
                              title="Edit question"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedQuestionIds(new Set([question._id]));
                                setShowDeleteConfirm(true);
                              }}
                              className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedQuestionId === question._id && (
                          <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                            <div className="text-sm text-[var(--color-text-secondary)]">
                              <p className="font-medium text-[var(--color-text)] mb-1">
                                Full Question:
                              </p>
                              <p className="mb-3">{question.text}</p>

                              {question.options.length > 0 && (
                                <>
                                  <p className="font-medium text-[var(--color-text)] mb-1">
                                    Options:
                                  </p>
                                  <ul className="space-y-1 mb-3">
                                    {question.options.map((option, i) => (
                                      <li
                                        key={i}
                                        className={`flex items-center gap-2 ${
                                          question.correctAnswers.includes(
                                            option,
                                          )
                                            ? "text-[var(--color-success)] font-medium"
                                            : ""
                                        }`}
                                      >
                                        {question.correctAnswers.includes(
                                          option,
                                        ) && (
                                          <span className="text-[var(--color-success)]">
                                            ✓
                                          </span>
                                        )}
                                        {option}
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}

                              {question.matchingPairs &&
                                question.matchingPairs.length > 0 && (
                                  <>
                                    <p className="font-medium text-[var(--color-text)] mb-1">
                                      Matching Pairs:
                                    </p>
                                    <ul className="space-y-1">
                                      {question.matchingPairs.map((pair, i) => (
                                        <li
                                          key={i}
                                          className="flex items-center gap-2"
                                        >
                                          <span>{pair.prompt}</span>
                                          <span className="text-[var(--color-text-muted)]">
                                            →
                                          </span>
                                          <span className="text-[var(--color-success)]">
                                            {pair.answer}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                Delete {selectedQuestionIds.size} Question
                {selectedQuestionIds.size !== 1 ? "s" : ""}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Are you sure you want to delete these questions? This action
                cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-[var(--color-bg)] hover:bg-[var(--color-surface-elevated)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
