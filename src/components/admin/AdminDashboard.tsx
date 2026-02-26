import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { Shield, FileJson, ChevronLeft, LogOut } from "lucide-react";
import { TestList } from "./TestList";
import { QuestionManager } from "./QuestionManager";
import { ImportTestPage } from "./ImportTestPage";
import { DeleteConfirmation } from "./DeleteConfirmation";

interface Test {
  _id: Id<"tests">;
  _creationTime: number;
  name: string;
  description?: string;
  questionCount: number;
}

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

type ActiveTab = "tests" | "import";

export function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tests");
  const [selectedTestId, setSelectedTestId] = useState<Id<"tests"> | null>(
    null,
  );
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "test" | "question";
    id: Id<"tests"> | Id<"questions">;
    name: string;
    count?: number;
  }>({
    isOpen: false,
    type: "test",
    id: "" as Id<"tests">,
    name: "",
    count: 0,
  });

  const [testFormData, setTestFormData] = useState({
    name: "",
    description: "",
  });

  const tests = useQuery(api.admin.getAllTests);
  const testWithQuestions = useQuery(
    api.admin.getTestWithQuestions,
    selectedTestId ? { testId: selectedTestId } : "skip",
  );

  const createTest = useMutation(api.admin.createTest);
  const updateTest = useMutation(api.admin.updateTest);
  const deleteTest = useMutation(api.admin.deleteTest);
  const addQuestion = useMutation(api.admin.addQuestion);
  const updateQuestion = useMutation(api.admin.updateQuestion);
  const deleteQuestion = useMutation(api.admin.deleteQuestion);

  const selectedTest = tests?.find((t) => t._id === selectedTestId);

  const handleCreateTest = async () => {
    if (!testFormData.name.trim()) {
      toast.error("Test name is required");
      return;
    }

    try {
      await createTest({
        name: testFormData.name,
        description: testFormData.description || undefined,
      });
      toast.success("Test created successfully!");
      setTestFormData({ name: "", description: "" });
      setShowTestForm(false);
    } catch (error) {
      toast.error(
        "Failed to create test: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const handleUpdateTest = async () => {
    if (!editingTest || !testFormData.name.trim()) {
      toast.error("Test name is required");
      return;
    }

    try {
      await updateTest({
        testId: editingTest._id,
        name: testFormData.name,
        description: testFormData.description || undefined,
      });
      toast.success("Test updated successfully!");
      setTestFormData({ name: "", description: "" });
      setEditingTest(null);
      setShowTestForm(false);
    } catch (error) {
      toast.error(
        "Failed to update test: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const handleDeleteTest = async () => {
    if (!deleteConfirm.isOpen || deleteConfirm.type !== "test") return;

    try {
      await deleteTest({ testId: deleteConfirm.id as Id<"tests"> });
      toast.success("Test deleted successfully!");
      setDeleteConfirm({ ...deleteConfirm, isOpen: false });
      if (selectedTestId === deleteConfirm.id) {
        setSelectedTestId(null);
      }
    } catch (error) {
      toast.error(
        "Failed to delete test: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const handleAddQuestion = async (data: {
    text: string;
    type: QuestionType;
    options: string[];
    correctAnswers: string[];
    matchingPairs?: Array<{ prompt: string; answer: string }>;
    matchingAnswers?: string[];
  }) => {
    if (!selectedTestId) {
      toast.error("Please select a test first");
      return;
    }

    try {
      await addQuestion({
        testId: selectedTestId,
        text: data.text,
        type: data.type,
        options: data.options,
        correctAnswers: data.correctAnswers,
        matchingPairs: data.matchingPairs,
        matchingAnswers: data.matchingAnswers,
      });
      toast.success("Question added successfully!");
    } catch (error) {
      toast.error(
        "Failed to add question: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const handleUpdateQuestion = async (
    questionId: Id<"questions">,
    data: {
      text: string;
      type: QuestionType;
      options: string[];
      correctAnswers: string[];
      matchingPairs?: Array<{ prompt: string; answer: string }>;
      matchingAnswers?: string[];
    },
  ) => {
    try {
      await updateQuestion({
        questionId,
        text: data.text,
        type: data.type,
        options: data.options,
        correctAnswers: data.correctAnswers,
        matchingPairs: data.matchingPairs,
        matchingAnswers: data.matchingAnswers,
      });
      toast.success("Question updated successfully!");
    } catch (error) {
      toast.error(
        "Failed to update question: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const handleDeleteQuestions = async (questionIds: Id<"questions">[]) => {
    try {
      for (const questionId of questionIds) {
        await deleteQuestion({ questionId });
      }
      toast.success(`${questionIds.length} question(s) deleted successfully!`);
      setDeleteConfirm({ ...deleteConfirm, isOpen: false });
    } catch (error) {
      toast.error(
        "Failed to delete questions: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const handleDuplicateQuestion = async (question: Question) => {
    if (!selectedTestId) return;

    try {
      await addQuestion({
        testId: selectedTestId,
        text: `${question.text} (Copy)`,
        type: question.type,
        options: question.options,
        correctAnswers: question.correctAnswers,
        matchingPairs: question.matchingPairs,
        matchingAnswers: question.matchingAnswers,
      });
      toast.success("Question duplicated successfully!");
    } catch (error) {
      toast.error(
        "Failed to duplicate question: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const openCreateTest = () => {
    setEditingTest(null);
    setTestFormData({ name: "", description: "" });
    setShowTestForm(true);
  };

  const openEditTest = (test: Test) => {
    setEditingTest(test);
    setTestFormData({
      name: test.name,
      description: test.description || "",
    });
    setShowTestForm(true);
  };

  const openDeleteTest = (test: Test) => {
    setDeleteConfirm({
      isOpen: true,
      type: "test",
      id: test._id,
      name: test.name,
      count: test.questionCount,
    });
  };

  if (tests === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--color-text-secondary)]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="bg-white dark:bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[var(--color-text)]">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Manage tests and questions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1">
            <button
              onClick={() => {
                setActiveTab("tests");
                setSelectedTestId(null);
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "tests"
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              Tests ({tests.length})
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "import"
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              <FileJson className="w-4 h-4" />
              Import JSON
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "tests" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Test List */}
            <div className="lg:col-span-1 h-full">
              <TestList
                tests={tests}
                selectedTestId={selectedTestId}
                onSelectTest={setSelectedTestId}
                onEditTest={openEditTest}
                onDeleteTest={openDeleteTest}
                onCreateTest={openCreateTest}
              />
            </div>

            {/* Question Manager */}
            <div className="lg:col-span-2 h-full">
              {selectedTestId && selectedTest ? (
                <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] h-full flex flex-col">
                  <QuestionManager
                    testId={selectedTestId}
                    testName={selectedTest.name}
                    questions={
                      (testWithQuestions?.questions as Question[]) || []
                    }
                    onAddQuestion={handleAddQuestion}
                    onUpdateQuestion={handleUpdateQuestion}
                    onDeleteQuestions={handleDeleteQuestions}
                    onDuplicateQuestion={handleDuplicateQuestion}
                    onBack={() => setSelectedTestId(null)}
                  />
                </div>
              ) : (
                <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] h-full flex items-center justify-center">
                  <div className="text-center px-4">
                    <div className="w-16 h-16 bg-[var(--color-primary-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileJson className="w-8 h-8 text-[var(--color-primary)]" />
                    </div>
                    <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
                      Select a Test
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-sm max-w-sm">
                      Choose a test from the list on the left to view and manage
                      its questions
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "import" && (
          <ImportTestPage onBack={() => setActiveTab("tests")} />
        )}
      </main>

      {/* Test Form Modal */}
      {showTestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95">
            <div className="p-6 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                {editingTest ? "Edit Test" : "Create New Test"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Test Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={testFormData.name}
                  onChange={(e) =>
                    setTestFormData({ ...testFormData, name: e.target.value })
                  }
                  placeholder="Enter test name"
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Description
                </label>
                <textarea
                  value={testFormData.description}
                  onChange={(e) =>
                    setTestFormData({
                      ...testFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter test description (optional)"
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[var(--color-border)] flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTestForm(false);
                  setEditingTest(null);
                  setTestFormData({ name: "", description: "" });
                }}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-[var(--color-bg)] hover:bg-[var(--color-surface-elevated)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingTest ? handleUpdateTest : handleCreateTest}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors"
              >
                {editingTest ? "Save Changes" : "Create Test"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmation
        isOpen={deleteConfirm.isOpen}
        type={deleteConfirm.type}
        name={deleteConfirm.name}
        count={deleteConfirm.count}
        onConfirm={handleDeleteTest}
        onCancel={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
      />
    </div>
  );
}
