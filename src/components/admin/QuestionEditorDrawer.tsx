import React from "react";
import { createPortal } from "react-dom";
import { Id } from "../../../convex/_generated/dataModel";
import {
  parseQuestionInput,
  type NormalizedQuestionInput,
  type QuestionFieldName,
  type QuestionInput,
  type QuestionType,
} from "../../../shared/adminSchema";
import { QuestionView } from "../questions/QuestionView";
import { MatchingQuestion } from "../questions/MatchingQuestion";
import { FillInBlankQuestion } from "../questions/FillInBlankQuestion";
import {
  Eye,
  EyeOff,
  Plus,
  X,
  CheckSquare,
  Circle,
  LayoutPanelTop,
} from "lucide-react";

interface QuestionEditorDrawerProps {
  open: boolean;
  testId: Id<"tests">;
  mode: "create" | "edit";
  initialValue?: QuestionInput;
  isSaving: boolean;
  onClose: () => void;
  onSave: (value: NormalizedQuestionInput) => Promise<void> | void;
  onDirtyChange: (dirty: boolean) => void;
}

interface QuestionFormState {
  questionId: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswers: string[];
  matchingPairs: Array<{ prompt: string; answer: string }>;
  matchingAnswers: string[];
}

const QUESTION_TYPE_OPTIONS: Array<{ type: QuestionType; label: string }> = [
  { type: "mcq", label: "MCQ" },
  { type: "tf", label: "True / False" },
  { type: "ms", label: "Multi-Select" },
  { type: "matching", label: "Matching" },
  { type: "fib", label: "Fill in Blank" },
];

const emptyQuestionFormState: QuestionFormState = {
  questionId: "",
  text: "",
  type: "mcq",
  options: ["", "", "", ""],
  correctAnswers: [],
  matchingPairs: [
    { prompt: "", answer: "" },
    { prompt: "", answer: "" },
  ],
  matchingAnswers: [],
};

function buildStateFromInput(input?: QuestionInput): QuestionFormState {
  if (!input) {
    return emptyQuestionFormState;
  }

  return {
    questionId: input.questionId ?? "",
    text: input.text ?? "",
    type: input.type ?? "mcq",
    options:
      input.type === "matching" || input.type === "fib"
        ? []
        : input.options && input.options.length > 0
          ? [...input.options]
          : input.type === "tf"
            ? ["True", "False"]
            : ["", "", "", ""],
    correctAnswers: input.correctAnswers ? [...input.correctAnswers] : [],
    matchingPairs:
      input.matchingPairs && input.matchingPairs.length > 0
        ? input.matchingPairs.map((pair) => ({ ...pair }))
        : [
            { prompt: "", answer: "" },
            { prompt: "", answer: "" },
          ],
    matchingAnswers: input.matchingAnswers ? [...input.matchingAnswers] : [],
  };
}

function createBlankStateForType(type: QuestionType): QuestionFormState {
  switch (type) {
    case "tf":
      return {
        ...emptyQuestionFormState,
        type,
        options: ["True", "False"],
      };
    case "matching":
      return {
        ...emptyQuestionFormState,
        type,
        options: [],
        correctAnswers: [],
      };
    case "fib":
      return {
        ...emptyQuestionFormState,
        type,
        options: [],
        correctAnswers: [""],
      };
    case "mcq":
    case "ms":
    default:
      return {
        ...emptyQuestionFormState,
        type,
        options: ["", "", "", ""],
      };
  }
}

function getFieldError(
  fieldErrors: Partial<Record<QuestionFieldName, string[]>>,
  field: QuestionFieldName,
) {
  return fieldErrors[field]?.[0];
}

function dedupeAnswers(values: string[]) {
  return Array.from(new Set(values));
}

function resolvePreviewAnswers(formState: QuestionFormState) {
  if (formState.type === "fib") {
    return formState.correctAnswers.filter((answer) => answer.trim());
  }

  if (formState.type === "matching") {
    return [];
  }

  return dedupeAnswers(
    formState.correctAnswers.filter((answer) => answer.trim()),
  );
}

export function QuestionEditorDrawer({
  open,
  testId,
  mode,
  initialValue,
  isSaving,
  onClose,
  onSave,
  onDirtyChange,
}: QuestionEditorDrawerProps) {
  const isEditMode = mode === "edit";
  const [showPreview, setShowPreview] = React.useState(true);
  const [formState, setFormState] = React.useState<QuestionFormState>(
    buildStateFromInput(initialValue),
  );
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<QuestionFieldName, string[]>>
  >({});
  const initialSnapshot = React.useMemo(
    () => JSON.stringify(buildStateFromInput(initialValue)),
    [initialValue],
  );

  React.useEffect(() => {
    if (!open) {
      return;
    }
    setFormState(buildStateFromInput(initialValue));
    setFieldErrors({});
  }, [initialValue, open]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  React.useEffect(() => {
    onDirtyChange(open && JSON.stringify(formState) !== initialSnapshot);
  }, [formState, initialSnapshot, onDirtyChange, open]);

  const previewQuestion = React.useMemo(() => {
    const resolvedCorrectAnswers = resolvePreviewAnswers(formState);
    return {
      _id: "preview" as Id<"questions">,
      _creationTime: Date.now(),
      testId,
      questionId: formState.questionId || "preview",
      text: formState.text || "Question preview",
      type: formState.type,
      options: formState.options.filter((option) => option.trim()),
      correctAnswers: resolvedCorrectAnswers,
      matchingPairs: formState.matchingPairs.filter(
        (pair) => pair.prompt.trim() || pair.answer.trim(),
      ),
      matchingAnswers: formState.matchingAnswers.filter((answer) =>
        answer.trim(),
      ),
      sortOrder: 0,
      updatedAt: Date.now(),
    };
  }, [formState, testId]);

  const contentLayoutClassName = showPreview
    ? "grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(34rem,40rem)] 2xl:grid-cols-[minmax(0,1fr)_minmax(40rem,48rem)]"
    : "mx-auto max-w-5xl";

  if (!open) {
    return null;
  }

  const handleTypeChange = (type: QuestionType) => {
    setFieldErrors({});
    setFormState((current) => {
      const nextState = createBlankStateForType(type);
      return {
        ...nextState,
        text: current.text,
        questionId: current.questionId,
      };
    });
  };

  const toggleCorrectAnswer = (option: string) => {
    setFormState((current) => {
      if (current.type === "mcq" || current.type === "tf") {
        return {
          ...current,
          correctAnswers: [option],
        };
      }

      if (current.type !== "ms") {
        return current;
      }

      return {
        ...current,
        correctAnswers: current.correctAnswers.includes(option)
          ? current.correctAnswers.filter((answer) => answer !== option)
          : [...current.correctAnswers, option],
      };
    });
  };

  const handleChoiceOptionChange = (index: number, nextValue: string) => {
    setFormState((current) => {
      const previousValue = current.options[index] ?? "";
      const options = [...current.options];
      options[index] = nextValue;

      if (
        current.type !== "mcq" &&
        current.type !== "ms" &&
        current.type !== "tf"
      ) {
        return {
          ...current,
          options,
        };
      }

      const correctAnswers = current.correctAnswers.map((answer) =>
        answer === previousValue ? nextValue : answer,
      );

      return {
        ...current,
        options,
        correctAnswers: dedupeAnswers(correctAnswers),
      };
    });
  };

  const handleSubmit = async () => {
    const payload: QuestionInput = {
      ...formState,
      correctAnswers: resolvePreviewAnswers(formState),
    };
    const result = parseQuestionInput(payload);
    if (!result.success) {
      setFieldErrors(result.errors.fieldErrors);
      return;
    }

    setFieldErrors({});
    await onSave(result.data);
  };

  const drawer = (
    <div
      className={`fixed inset-0 z-[100] ${
        isEditMode
          ? "bg-[var(--color-surface)]"
          : "bg-black/70 backdrop-blur-[2px]"
      }`}
    >
      <div
        className={`absolute flex h-full w-full flex-col bg-[var(--color-surface)] ${
          isEditMode
            ? "inset-0"
            : "inset-y-0 right-0 max-w-[min(116rem,100vw)] border-l border-[var(--color-border)] shadow-soft-lg"
        }`}
      >
        {mode === "create" ? (
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 md:px-8">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                Add Question
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Validation runs in the editor and again on the server before
                save.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
                title={showPreview ? "Hide preview" : "Show preview"}
                aria-label={showPreview ? "Hide preview" : "Show preview"}
              >
                {showPreview ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-transparent bg-transparent text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-text)]"
                title="Close editor"
                aria-label="Close editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="pointer-events-none absolute right-6 top-6 z-10 flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/95 p-1.5 shadow-lg backdrop-blur">
            <button
              type="button"
              onClick={() => setShowPreview((value) => !value)}
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-text)]"
              title={showPreview ? "Hide preview" : "Show preview"}
              aria-label={showPreview ? "Hide preview" : "Show preview"}
            >
              {showPreview ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-text)]"
              title="Close editor"
              aria-label="Close editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="scrollbar-hide flex-1 overflow-y-auto">
          <div
            className={`p-5 sm:p-6 lg:p-8 2xl:p-10 ${
              mode === "edit" ? "pt-24 lg:pt-28" : ""
            }`}
          >
            <div className={contentLayoutClassName}>
              <div className="min-w-0 space-y-7">
                <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 lg:p-7">
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Question ID
                  </label>
                  <input
                    type="text"
                    value={formState.questionId}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        questionId: event.target.value,
                      }))
                    }
                    placeholder="Optional. Leave blank to auto-generate."
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  {getFieldError(fieldErrors, "questionId") && (
                    <p className="text-sm text-[var(--color-error)] mt-2">
                      {getFieldError(fieldErrors, "questionId")}
                    </p>
                  )}
                </section>

                <section className="space-y-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 lg:p-7">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                      Question Type
                    </label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-5">
                      {QUESTION_TYPE_OPTIONS.map(({ type, label }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleTypeChange(type)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                            formState.type === type
                              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Question Text
                    </label>
                    <textarea
                      value={formState.text}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          text: event.target.value,
                        }))
                      }
                      rows={8}
                      className="scrollbar-hide min-h-[260px] w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 text-[var(--color-text)] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    {getFieldError(fieldErrors, "text") && (
                      <p className="text-sm text-[var(--color-error)] mt-2">
                        {getFieldError(fieldErrors, "text")}
                      </p>
                    )}
                  </div>
                </section>

                {(formState.type === "mcq" ||
                  formState.type === "tf" ||
                  formState.type === "ms") && (
                  <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 lg:p-7">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-[var(--color-text)]">
                          Options
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {formState.type === "ms"
                            ? "Select every correct answer."
                            : "Select exactly one correct answer."}
                        </p>
                      </div>
                      {formState.type !== "tf" && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((current) => ({
                              ...current,
                              options: [...current.options, ""],
                            }))
                          }
                          className="btn btn-secondary"
                        >
                          <Plus className="w-4 h-4" />
                          Add Option
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {formState.options.map((option, index) => (
                        <div
                          key={`${index}-${formState.type}`}
                          className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5"
                        >
                          <button
                            type="button"
                            onClick={() => toggleCorrectAnswer(option)}
                            disabled={!option.trim()}
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-colors ${
                              formState.correctAnswers.includes(option) &&
                              option.trim()
                                ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"
                                : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                            }`}
                            title={
                              formState.type === "ms"
                                ? "Toggle correct answer"
                                : "Set as correct answer"
                            }
                          >
                            {formState.type === "ms" ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <input
                            type="text"
                            value={option}
                            onChange={(event) =>
                              handleChoiceOptionChange(
                                index,
                                event.target.value,
                              )
                            }
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 bg-transparent text-[var(--color-text)] focus:outline-none"
                          />
                          <span className="text-xs font-medium text-[var(--color-text-muted)]">
                            {formState.correctAnswers.includes(option) &&
                            option.trim()
                              ? "Correct"
                              : `Option ${index + 1}`}
                          </span>
                          {formState.type !== "tf" &&
                            formState.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setFormState((current) => {
                                    const optionToRemove =
                                      current.options[index];
                                    const options = current.options.filter(
                                      (_, optionIndex) => optionIndex !== index,
                                    );
                                    return {
                                      ...current,
                                      options,
                                      correctAnswers:
                                        current.correctAnswers.filter(
                                          (answer) => answer !== optionToRemove,
                                        ),
                                    };
                                  })
                                }
                                className="btn btn-ghost"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {resolvePreviewAnswers(formState).length > 0 ? (
                        resolvePreviewAnswers(formState).map(
                          (answer, index) => (
                            <span
                              key={`${answer}-${index}`}
                              className="rounded-full bg-[var(--color-primary-subtle)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]"
                            >
                              {formState.type === "ms" ? "Selected" : "Correct"}
                              : {answer}
                            </span>
                          ),
                        )
                      ) : (
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {formState.type === "ms"
                            ? "Choose one or more correct options."
                            : "Choose the correct option."}
                        </span>
                      )}
                    </div>
                    {(getFieldError(fieldErrors, "options") ||
                      getFieldError(fieldErrors, "correctAnswers")) && (
                      <div className="mt-3 space-y-1 text-sm text-[var(--color-error)]">
                        {getFieldError(fieldErrors, "options") && (
                          <p>{getFieldError(fieldErrors, "options")}</p>
                        )}
                        {getFieldError(fieldErrors, "correctAnswers") && (
                          <p>{getFieldError(fieldErrors, "correctAnswers")}</p>
                        )}
                      </div>
                    )}
                  </section>
                )}

                {formState.type === "fib" && (
                  <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 lg:p-7">
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Accepted Answers
                    </label>
                    <textarea
                      value={formState.correctAnswers.join("\n")}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          correctAnswers: event.target.value.split("\n"),
                        }))
                      }
                      rows={6}
                      placeholder="Use one line per accepted answer. For multiple blanks, each line maps to the next blank."
                      className="scrollbar-hide min-h-[220px] w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    {getFieldError(fieldErrors, "correctAnswers") && (
                      <p className="text-sm text-[var(--color-error)] mt-2">
                        {getFieldError(fieldErrors, "correctAnswers")}
                      </p>
                    )}
                  </section>
                )}

                {formState.type === "matching" && (
                  <section className="space-y-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 lg:p-7">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-[var(--color-text)]">
                            Matching Pairs
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            Add at least 2 complete pairs.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((current) => ({
                              ...current,
                              matchingPairs: [
                                ...current.matchingPairs,
                                { prompt: "", answer: "" },
                              ],
                            }))
                          }
                          className="btn btn-secondary"
                        >
                          <Plus className="w-4 h-4" />
                          Add Pair
                        </button>
                      </div>

                      <div className="space-y-3">
                        {formState.matchingPairs.map((pair, index) => (
                          <div
                            key={index}
                            className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)_auto] lg:items-center"
                          >
                            <input
                              type="text"
                              value={pair.prompt}
                              onChange={(event) =>
                                setFormState((current) => {
                                  const matchingPairs = [
                                    ...current.matchingPairs,
                                  ];
                                  matchingPairs[index] = {
                                    ...matchingPairs[index],
                                    prompt: event.target.value,
                                  };
                                  return { ...current, matchingPairs };
                                })
                              }
                              placeholder="Prompt"
                              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                            <span className="text-center text-lg text-[var(--color-text-muted)]">
                              →
                            </span>
                            <input
                              type="text"
                              value={pair.answer}
                              onChange={(event) =>
                                setFormState((current) => {
                                  const matchingPairs = [
                                    ...current.matchingPairs,
                                  ];
                                  matchingPairs[index] = {
                                    ...matchingPairs[index],
                                    answer: event.target.value,
                                  };
                                  return { ...current, matchingPairs };
                                })
                              }
                              placeholder="Answer"
                              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                            {formState.matchingPairs.length > 2 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setFormState((current) => ({
                                    ...current,
                                    matchingPairs: current.matchingPairs.filter(
                                      (_, pairIndex) => pairIndex !== index,
                                    ),
                                  }))
                                }
                                className="btn btn-ghost"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {getFieldError(fieldErrors, "matchingPairs") && (
                        <p className="text-sm text-[var(--color-error)] mt-2">
                          {getFieldError(fieldErrors, "matchingPairs")}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-[var(--color-text)]">
                            Extra Answers
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            Optional distractors shown alongside the correct
                            pair answers.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((current) => ({
                              ...current,
                              matchingAnswers: [...current.matchingAnswers, ""],
                            }))
                          }
                          className="btn btn-secondary"
                        >
                          <Plus className="w-4 h-4" />
                          Add Extra Answer
                        </button>
                      </div>

                      <div className="space-y-3">
                        {formState.matchingAnswers.map((answer, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="text"
                              value={answer}
                              onChange={(event) =>
                                setFormState((current) => {
                                  const matchingAnswers = [
                                    ...current.matchingAnswers,
                                  ];
                                  matchingAnswers[index] = event.target.value;
                                  return { ...current, matchingAnswers };
                                })
                              }
                              placeholder="Distractor answer"
                              className="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormState((current) => ({
                                  ...current,
                                  matchingAnswers:
                                    current.matchingAnswers.filter(
                                      (_, answerIndex) => answerIndex !== index,
                                    ),
                                }))
                              }
                              className="btn btn-ghost"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {getFieldError(fieldErrors, "matchingAnswers") && (
                        <p className="text-sm text-[var(--color-error)] mt-2">
                          {getFieldError(fieldErrors, "matchingAnswers")}
                        </p>
                      )}
                    </div>
                  </section>
                )}
              </div>

              {showPreview && (
                <aside className="scrollbar-hide sticky top-0 self-start rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 lg:p-7 xl:top-4 xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto">
                  <div className="mb-4 flex items-center gap-2">
                    <LayoutPanelTop className="h-4 w-4 text-[var(--color-primary)]" />
                    <h3 className="font-semibold text-[var(--color-text)]">
                      Live Preview
                    </h3>
                  </div>
                  <div className="min-w-0 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                    <div className="rounded-2xl bg-[var(--color-bg)] px-4 py-3">
                      <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-1">
                        Preview Mode
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Correct answers are pre-highlighted here so you can
                        confirm the final content quickly.
                      </p>
                    </div>

                    {formState.type === "matching" ? (
                      <div className="pointer-events-none min-w-0">
                        <MatchingQuestion
                          question={previewQuestion}
                          userAnswer={[]}
                          onAnswerChange={() => {}}
                          shuffledAnswers={previewQuestion.matchingAnswers}
                        />
                      </div>
                    ) : formState.type === "fib" ? (
                      <div className="pointer-events-none min-w-0">
                        <FillInBlankQuestion
                          question={previewQuestion}
                          userAnswer={previewQuestion.correctAnswers}
                          onAnswerChange={() => {}}
                        />
                      </div>
                    ) : (
                      <div className="pointer-events-none min-w-0">
                        <QuestionView
                          question={previewQuestion}
                          userAnswer={previewQuestion.correctAnswers}
                          onAnswerChange={() => {}}
                        />
                      </div>
                    )}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 md:px-8">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSaving}
            className="btn btn-primary"
          >
            {isSaving
              ? "Saving..."
              : mode === "create"
                ? "Add Question"
                : "Save Question"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}
