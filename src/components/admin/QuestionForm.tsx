import React, { useState, useEffect } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { X, Plus, Check, Eye, EyeOff } from "lucide-react";
import { QuestionView } from "../questions/QuestionView";
import { MatchingQuestion } from "../questions/MatchingQuestion";
import { FillInBlankQuestion } from "../questions/FillInBlankQuestion";

type QuestionType = "mcq" | "tf" | "ms" | "matching" | "fib";

interface QuestionFormData {
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswers: string[];
  matchingPairs: Array<{ prompt: string; answer: string }>;
  matchingAnswers?: string[];
}

interface QuestionFormProps {
  testId: Id<"tests">;
  initialData?: Partial<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const initialFormData: QuestionFormData = {
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

export function QuestionForm({
  testId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: QuestionFormProps) {
  const [formData, setFormData] = useState<QuestionFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialFormData,
        ...initialData,
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.text.trim()) {
      newErrors.text = "Question text is required";
    }

    if (formData.type === "mcq" || formData.type === "tf") {
      if (formData.correctAnswers.length === 0) {
        newErrors.correctAnswers = "Please select a correct answer";
      }
    }

    if (formData.type === "ms" && formData.correctAnswers.length === 0) {
      newErrors.correctAnswers = "Please select at least one correct answer";
    }

    if (formData.type === "matching") {
      const validPairs = formData.matchingPairs.filter(
        (p) => p.prompt.trim() && p.answer.trim(),
      );
      if (validPairs.length < 2) {
        newErrors.matchingPairs = "Please provide at least 2 matching pairs";
      }
    }

    if (
      formData.type === "fib" &&
      formData.correctAnswers.filter((answer) => answer.trim()).length === 0
    ) {
      newErrors.correctAnswers = "Please provide a correct answer";
    } else if (formData.type === "fib") {
      const blankCount = formData.text.match(/_{3,}/g)?.length || 0;
      const providedAnswers = formData.correctAnswers.filter((answer) =>
        answer.trim(),
      ).length;

      if (blankCount > 1 && providedAnswers < blankCount) {
        newErrors.correctAnswers = `This question has ${blankCount} blanks but only ${providedAnswers} answers`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const cleanedCorrectAnswers =
        formData.type === "fib"
          ? formData.correctAnswers.map((answer) => answer.trim()).filter(Boolean)
          : formData.correctAnswers;

      onSubmit({
        ...formData,
        correctAnswers: cleanedCorrectAnswers,
      });
    }
  };

  const handleTypeChange = (type: QuestionType) => {
    let newForm: QuestionFormData = { ...formData, type };

    switch (type) {
      case "mcq":
        newForm.options = ["", "", "", ""];
        newForm.correctAnswers = [];
        break;
      case "tf":
        newForm.options = ["True", "False"];
        newForm.correctAnswers = [];
        break;
      case "ms":
        newForm.options = ["", "", "", ""];
        newForm.correctAnswers = [];
        break;
      case "matching":
        newForm.options = [];
        newForm.correctAnswers = [];
        newForm.matchingPairs = [
          { prompt: "", answer: "" },
          { prompt: "", answer: "" },
        ];
        newForm.matchingAnswers = [];
        break;
      case "fib":
        newForm.options = [];
        newForm.correctAnswers = [""];
        break;
    }

    setFormData(newForm);
    setErrors({});
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectAnswerToggle = (option: string) => {
    if (formData.type === "mcq" || formData.type === "tf") {
      setFormData({ ...formData, correctAnswers: [option] });
    } else if (formData.type === "ms") {
      const currentAnswers = formData.correctAnswers;
      if (currentAnswers.includes(option)) {
        setFormData({
          ...formData,
          correctAnswers: currentAnswers.filter((a) => a !== option),
        });
      } else {
        setFormData({
          ...formData,
          correctAnswers: [...currentAnswers, option],
        });
      }
    }
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""],
    });
  };

  const removeOption = (index: number) => {
    const optionToRemove = formData.options[index];
    const newOptions = formData.options.filter((_, i) => i !== index);
    const newCorrectAnswers = formData.correctAnswers.filter(
      (a) => a !== optionToRemove,
    );
    setFormData({
      ...formData,
      options: newOptions,
      correctAnswers: newCorrectAnswers,
    });
  };

  const handleMatchingPairChange = (
    index: number,
    field: "prompt" | "answer",
    value: string,
  ) => {
    const newPairs = [...formData.matchingPairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    setFormData({ ...formData, matchingPairs: newPairs });
  };

  const addMatchingPair = () => {
    setFormData({
      ...formData,
      matchingPairs: [...formData.matchingPairs, { prompt: "", answer: "" }],
    });
  };

  const removeMatchingPair = (index: number) => {
    if (formData.matchingPairs.length <= 2) return;
    setFormData({
      ...formData,
      matchingPairs: formData.matchingPairs.filter((_, i) => i !== index),
    });
  };

  const addStandaloneAnswer = () => {
    setFormData({
      ...formData,
      matchingAnswers: [...(formData.matchingAnswers || []), ""],
    });
  };

  const handleStandaloneAnswerChange = (index: number, value: string) => {
    const newAnswers = [...(formData.matchingAnswers || [])];
    newAnswers[index] = value;
    setFormData({ ...formData, matchingAnswers: newAnswers });
  };

  const removeStandaloneAnswer = (index: number) => {
    setFormData({
      ...formData,
      matchingAnswers: (formData.matchingAnswers || []).filter(
        (_, i) => i !== index,
      ),
    });
  };

  // Preview question object
  const previewQuestion = {
    _id: "preview" as Id<"questions">,
    _creationTime: Date.now(),
    testId,
    text: formData.text || "Question text will appear here...",
    type: formData.type,
    options: formData.options.filter((o) => o.trim()),
    correctAnswers: formData.correctAnswers,
    questionId: "preview",
    matchingPairs: formData.matchingPairs.filter(
      (p) => p.prompt.trim() && p.answer.trim(),
    ),
    matchingAnswers: [
      ...formData.matchingPairs
        .filter((p) => p.answer.trim())
        .map((p) => p.answer),
      ...(formData.matchingAnswers || []).filter((a) => a.trim()),
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header with Preview Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {initialData ? "Edit Question" : "Add New Question"}
        </h3>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            showPreview
              ? "bg-[var(--color-primary)] text-white"
              : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          }`}
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show Preview
            </>
          )}
        </button>
      </div>

      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : ""}`}>
        {/* Form */}
        <div className="space-y-5">
          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Question Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["mcq", "tf", "ms", "matching", "fib"] as QuestionType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                      formData.type === type
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                        : "bg-white dark:bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    {getQuestionTypeLabel(type)}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Question Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              rows={3}
              placeholder="Enter your question here..."
              className={`w-full px-4 py-3 bg-white dark:bg-[var(--color-surface)] border rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none transition-all ${
                errors.text ? "border-red-500" : "border-[var(--color-border)]"
              }`}
            />
            {errors.text && (
              <p className="mt-1 text-sm text-red-500">{errors.text}</p>
            )}
          </div>

          {/* Options for MCQ/TF/MS */}
          {(formData.type === "mcq" ||
            formData.type === "tf" ||
            formData.type === "ms") && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Options
                {formData.type === "mcq" && (
                  <span className="text-[var(--color-text-muted)] font-normal ml-1">
                    (Select one correct answer)
                  </span>
                )}
                {formData.type === "ms" && (
                  <span className="text-[var(--color-text-muted)] font-normal ml-1">
                    (Select all correct answers)
                  </span>
                )}
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type={formData.type === "ms" ? "checkbox" : "radio"}
                      name="correctAnswer"
                      checked={formData.correctAnswers.includes(option)}
                      onChange={() => handleCorrectAnswerToggle(option)}
                      disabled={!option.trim()}
                      className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                    {formData.type !== "tf" && formData.options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {formData.type !== "tf" && (
                <button
                  onClick={addOption}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              )}
              {errors.correctAnswers && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.correctAnswers}
                </p>
              )}
            </div>
          )}

          {/* Fill in the Blank */}
          {formData.type === "fib" && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Correct Answers <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.correctAnswers.join("\n")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    correctAnswers: e.target.value.split("\n"),
                  })
                }
                placeholder="Use one line per answer. For multiple blanks, use one line per blank in order."
                className={`w-full px-4 py-3 bg-white dark:bg-[var(--color-surface)] border rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${
                  errors.correctAnswers
                    ? "border-red-500"
                    : "border-[var(--color-border)]"
                }`}
              />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Single blank: each line is an accepted variation. Multiple
                blanks (____ ____): each line matches blank 1, blank 2, etc.
              </p>
              {errors.correctAnswers && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.correctAnswers}
                </p>
              )}
            </div>
          )}

          {/* Matching Pairs */}
          {formData.type === "matching" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Matching Pairs <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {formData.matchingPairs.map((pair, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pair.prompt}
                        onChange={(e) =>
                          handleMatchingPairChange(
                            index,
                            "prompt",
                            e.target.value,
                          )
                        }
                        placeholder="Prompt"
                        className="flex-1 px-3 py-2 bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                      <span className="text-[var(--color-text-muted)]">→</span>
                      <input
                        type="text"
                        value={pair.answer}
                        onChange={(e) =>
                          handleMatchingPairChange(
                            index,
                            "answer",
                            e.target.value,
                          )
                        }
                        placeholder="Answer"
                        className="flex-1 px-3 py-2 bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                      {formData.matchingPairs.length > 2 && (
                        <button
                          onClick={() => removeMatchingPair(index)}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addMatchingPair}
                  className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Pair
                </button>
                {errors.matchingPairs && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.matchingPairs}
                  </p>
                )}
              </div>

              {/* Standalone Answers (Distractors) */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Extra Answers (Distractors)
                  <span className="text-[var(--color-text-muted)] font-normal ml-1">
                    (Optional - Additional answers not assigned to any prompt)
                  </span>
                </label>
                <div className="space-y-2">
                  {(formData.matchingAnswers || []).map((answer, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-[var(--color-text-muted)] text-sm">
                        •
                      </span>
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) =>
                          handleStandaloneAnswerChange(index, e.target.value)
                        }
                        placeholder="Enter distractor answer"
                        className="flex-1 px-3 py-2 bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                      <button
                        onClick={() => removeStandaloneAnswer(index)}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addStandaloneAnswer}
                  className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Extra Answer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] p-6">
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4 uppercase tracking-wide">
              Preview
            </h4>
            <div className="bg-white dark:bg-[var(--color-surface)] rounded-lg p-6 shadow-sm">
              {formData.type === "matching" ? (
                <MatchingQuestion
                  question={previewQuestion}
                  userAnswer={[]}
                  onAnswerChange={() => {}}
                  showFeedback={false}
                />
              ) : formData.type === "fib" ? (
                <FillInBlankQuestion
                  question={previewQuestion}
                  userAnswer={[]}
                  onAnswerChange={() => {}}
                  showFeedback={false}
                />
              ) : (
                <QuestionView
                  question={previewQuestion}
                  userAnswer={[]}
                  onAnswerChange={() => {}}
                  showFeedback={false}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-[var(--color-bg)] hover:bg-[var(--color-surface-elevated)] rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors disabled:opacity-50 shadow-sm"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : initialData ? (
            <>
              <Check className="w-4 h-4" />
              Save Changes
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Question
            </>
          )}
        </button>
      </div>
    </div>
  );
}
