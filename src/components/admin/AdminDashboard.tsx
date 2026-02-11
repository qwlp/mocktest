import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

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
}

type QuestionType = "mcq" | "tf" | "ms" | "matching" | "fib";

interface TestFormData {
  name: string;
  description: string;
}

interface QuestionFormData {
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswers: string[];
  matchingPairs: Array<{ prompt: string; answer: string }>;
}

const initialTestForm: TestFormData = {
  name: "",
  description: "",
};

const initialQuestionForm: QuestionFormData = {
  text: "",
  type: "mcq",
  options: ["", "", "", ""],
  correctAnswers: [""],
  matchingPairs: [
    { prompt: "", answer: "" },
    { prompt: "", answer: "" },
  ],
};

export function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"tests" | "questions" | "import">(
    "tests",
  );
  const [selectedTestId, setSelectedTestId] = useState<Id<"tests"> | null>(
    null,
  );
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [testFormData, setTestFormData] =
    useState<TestFormData>(initialTestForm);
  const [questionFormData, setQuestionFormData] =
    useState<QuestionFormData>(initialQuestionForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "test" | "question";
    id: Id<"tests"> | Id<"questions">;
    name: string;
  } | null>(null);

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
      setTestFormData(initialTestForm);
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
      setTestFormData(initialTestForm);
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
    if (!deleteConfirm || deleteConfirm.type !== "test") return;

    try {
      await deleteTest({ testId: deleteConfirm.id as Id<"tests"> });
      toast.success("Test deleted successfully!");
      setDeleteConfirm(null);
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

  const handleAddQuestion = async () => {
    if (!selectedTestId) {
      toast.error("Please select a test first");
      return;
    }
    if (!questionFormData.text.trim()) {
      toast.error("Question text is required");
      return;
    }

    try {
      const options =
        questionFormData.type === "mcq" ||
        questionFormData.type === "tf" ||
        questionFormData.type === "ms"
          ? questionFormData.options.filter((o) => o.trim() !== "")
          : [];

      const correctAnswers =
        questionFormData.type === "mcq" || questionFormData.type === "tf"
          ? questionFormData.correctAnswers.filter((a) => a !== "")
          : questionFormData.correctAnswers.filter((a) => a.trim() !== "");

      if (questionFormData.type === "mcq" && correctAnswers.length !== 1) {
        toast.error(
          "Multiple choice questions must have exactly one correct answer",
        );
        return;
      }

      await addQuestion({
        testId: selectedTestId,
        text: questionFormData.text,
        type: questionFormData.type,
        options,
        correctAnswers,
        matchingPairs:
          questionFormData.type === "matching"
            ? questionFormData.matchingPairs
            : undefined,
      });
      toast.success("Question added successfully!");
      setQuestionFormData(initialQuestionForm);
      setShowQuestionForm(false);
    } catch (error) {
      toast.error(
        "Failed to add question: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    if (!questionFormData.text.trim()) {
      toast.error("Question text is required");
      return;
    }

    try {
      const options =
        questionFormData.type === "mcq" ||
        questionFormData.type === "tf" ||
        questionFormData.type === "ms"
          ? questionFormData.options.filter((o) => o.trim() !== "")
          : [];

      const correctAnswers =
        questionFormData.type === "mcq" || questionFormData.type === "tf"
          ? questionFormData.correctAnswers.filter((a) => a !== "")
          : questionFormData.correctAnswers.filter((a) => a.trim() !== "");

      await updateQuestion({
        questionId: editingQuestion._id,
        text: questionFormData.text,
        type: questionFormData.type,
        options,
        correctAnswers,
        matchingPairs:
          questionFormData.type === "matching"
            ? questionFormData.matchingPairs
            : undefined,
      });
      toast.success("Question updated successfully!");
      setQuestionFormData(initialQuestionForm);
      setEditingQuestion(null);
      setShowQuestionForm(false);
    } catch (error) {
      toast.error(
        "Failed to update question: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "question") return;

    try {
      await deleteQuestion({ questionId: deleteConfirm.id as Id<"questions"> });
      toast.success("Question deleted successfully!");
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(
        "Failed to delete question: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const openEditTest = (test: Test) => {
    setEditingTest(test);
    setTestFormData({
      name: test.name,
      description: test.description || "",
    });
    setShowTestForm(true);
  };

  const openAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionFormData(initialQuestionForm);
    setShowQuestionForm(true);
  };

  const openEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionFormData({
      text: question.text,
      type: question.type,
      options:
        question.options.length > 0 ? question.options : ["", "", "", ""],
      correctAnswers:
        question.correctAnswers.length > 0 ? question.correctAnswers : [""],
      matchingPairs: question.matchingPairs || [
        { prompt: "", answer: "" },
        { prompt: "", answer: "" },
      ],
    });
    setShowQuestionForm(true);
  };

  if (tests === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage tests and questions
          </p>
        </div>
        <button onClick={onBack} className="btn btn-secondary">
          Back to Tests
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("tests")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "tests"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Tests ({tests.length})
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "import"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Import JSON
          </button>
        </nav>
      </div>

      {activeTab === "tests" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Tests
                </h2>
                <button
                  onClick={() => {
                    setEditingTest(null);
                    setTestFormData(initialTestForm);
                    setShowTestForm(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  + New Test
                </button>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {tests.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No tests yet. Create your first test!
                  </div>
                ) : (
                  tests.map((test) => (
                    <div
                      key={test._id}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        selectedTestId === test._id
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                      onClick={() => setSelectedTestId(test._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {test.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {test.questionCount} questions
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditTest(test);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title="Edit test"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm({
                                type: "test",
                                id: test._id,
                                name: test.name,
                              });
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete test"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Questions Panel */}
          <div className="lg:col-span-2">
            {selectedTestId ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {testWithQuestions?.test.name || "Questions"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testWithQuestions?.questions.length || 0} questions
                    </p>
                  </div>
                  <button
                    onClick={openAddQuestion}
                    className="btn btn-primary btn-sm"
                  >
                    + Add Question
                  </button>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                  {testWithQuestions?.questions.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No questions yet. Add your first question!
                    </div>
                  ) : (
                    testWithQuestions?.questions.map((question, index) => (
                      <div key={question._id} className="px-4 py-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                Q{index + 1}
                              </span>
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                {getQuestionTypeLabel(question.type)}
                              </span>
                            </div>
                            <p className="text-gray-900 dark:text-white text-sm line-clamp-2">
                              {question.text}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditQuestion(question)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              title="Edit question"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: "question",
                                  id: question._id,
                                  name: `Question ${index + 1}`,
                                })
                              }
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Delete question"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {question.options.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {question.options.map((option, i) => (
                              <span
                                key={i}
                                className={`text-xs px-2 py-1 rounded ${
                                  question.correctAnswers.includes(option)
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                }`}
                              >
                                {option}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Select a test</p>
                  <p className="text-sm mt-1">
                    Choose a test from the list to view and manage its questions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "import" && (
        <ImportTestPageView onBack={() => setActiveTab("tests")} />
      )}

      {/* Test Form Modal */}
      {showTestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {editingTest ? "Edit Test" : "Create New Test"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Test Name *
                </label>
                <input
                  type="text"
                  value={testFormData.name}
                  onChange={(e) =>
                    setTestFormData({ ...testFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter test name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Enter description (optional)"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTestForm(false);
                  setEditingTest(null);
                  setTestFormData(initialTestForm);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={editingTest ? handleUpdateTest : handleCreateTest}
                className="btn btn-primary"
              >
                {editingTest ? "Save Changes" : "Create Test"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question Type
                </label>
                <select
                  value={questionFormData.type}
                  onChange={(e) => {
                    const type = e.target.value as QuestionType;
                    let newForm = { ...questionFormData, type };

                    if (type === "mcq") {
                      newForm.options = ["", "", "", ""];
                      newForm.correctAnswers = [""];
                      newForm.matchingPairs = [
                        { prompt: "", answer: "" },
                        { prompt: "", answer: "" },
                      ];
                    } else if (type === "tf") {
                      newForm.options = ["True", "False"];
                      newForm.correctAnswers = [""];
                      newForm.matchingPairs = [
                        { prompt: "", answer: "" },
                        { prompt: "", answer: "" },
                      ];
                    } else if (type === "ms") {
                      newForm.options = ["", "", "", ""];
                      newForm.correctAnswers = [""];
                      newForm.matchingPairs = [
                        { prompt: "", answer: "" },
                        { prompt: "", answer: "" },
                      ];
                    } else if (type === "matching") {
                      newForm.options = [];
                      newForm.correctAnswers = [];
                      newForm.matchingPairs = [
                        { prompt: "", answer: "" },
                        { prompt: "", answer: "" },
                      ];
                    } else if (type === "fib") {
                      newForm.options = [];
                      newForm.correctAnswers = [""];
                      newForm.matchingPairs = [
                        { prompt: "", answer: "" },
                        { prompt: "", answer: "" },
                      ];
                    }

                    setQuestionFormData(newForm);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="tf">True/False</option>
                  <option value="ms">Multiple Select</option>
                  <option value="matching">Matching</option>
                  <option value="fib">Fill-in-the-Blank</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question Text *
                </label>
                <textarea
                  value={questionFormData.text}
                  onChange={(e) =>
                    setQuestionFormData({
                      ...questionFormData,
                      text: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Enter question text"
                />
              </div>

              {(questionFormData.type === "mcq" ||
                questionFormData.type === "tf" ||
                questionFormData.type === "ms") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {questionFormData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type={
                            questionFormData.type === "mcq" ||
                            questionFormData.type === "tf"
                              ? "radio"
                              : "checkbox"
                          }
                          name="correctAnswer"
                          checked={questionFormData.correctAnswers.includes(
                            option,
                          )}
                          onChange={() => {
                            if (
                              questionFormData.type === "mcq" ||
                              questionFormData.type === "tf"
                            ) {
                              setQuestionFormData({
                                ...questionFormData,
                                correctAnswers: [option],
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionFormData.options];
                            newOptions[index] = e.target.value;
                            setQuestionFormData({
                              ...questionFormData,
                              options: newOptions,
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {questionFormData.type === "fib" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Correct Answer(s)
                  </label>
                  <input
                    type="text"
                    value={questionFormData.correctAnswers[0] || ""}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        correctAnswers: [e.target.value],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the correct answer"
                  />
                </div>
              )}

              {questionFormData.type === "matching" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Matching Pairs
                  </label>
                  <div className="space-y-3">
                    {questionFormData.matchingPairs.map((pair, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={pair.prompt}
                          onChange={(e) => {
                            const newPairs = [
                              ...questionFormData.matchingPairs,
                            ];
                            newPairs[index] = {
                              ...pair,
                              prompt: e.target.value,
                            };
                            setQuestionFormData({
                              ...questionFormData,
                              matchingPairs: newPairs,
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Prompt"
                        />
                        <span className="text-gray-500">→</span>
                        <input
                          type="text"
                          value={pair.answer}
                          onChange={(e) => {
                            const newPairs = [
                              ...questionFormData.matchingPairs,
                            ];
                            newPairs[index] = {
                              ...pair,
                              answer: e.target.value,
                            };
                            setQuestionFormData({
                              ...questionFormData,
                              matchingPairs: newPairs,
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Answer"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionFormData({
                          ...questionFormData,
                          matchingPairs: [
                            ...questionFormData.matchingPairs,
                            { prompt: "", answer: "" },
                          ],
                        })
                      }
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Add another pair
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowQuestionForm(false);
                  setEditingQuestion(null);
                  setQuestionFormData(initialQuestionForm);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={
                  editingQuestion ? handleUpdateQuestion : handleAddQuestion
                }
                className="btn btn-primary"
              >
                {editingQuestion ? "Save Changes" : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Delete {deleteConfirm.type === "test" ? "Test" : "Question"}
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete "{deleteConfirm.name}"?{" "}
                {deleteConfirm.type === "test"
                  ? "This will also delete all questions in this test."
                  : "This action cannot be undone."}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={
                  deleteConfirm.type === "test"
                    ? handleDeleteTest
                    : handleDeleteQuestion
                }
                className="btn bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
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

function ImportTestPageView({ onBack }: { onBack: () => void }) {
  const [jsonInput, setJsonInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    tests: Array<{
      name: string;
      description: string;
      questionCount: number;
      questionBreakdown: Record<string, number>;
    }>;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const validateTestJson = useMutation(api.admin.validateTestJson);
  const importTestsFromJson = useMutation(api.admin.importTestsFromJson);

  const handleFileUpload = useCallback((file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("Please upload a JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonInput(content);
      toast.success(`File "${file.name}" loaded successfully`);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload],
  );

  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      toast.error("Please enter or upload JSON data");
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateTestJson({ jsonData: jsonInput });
      setValidationResult(result);

      if (result.valid) {
        toast.success(
          `Validation passed! Found ${result.tests.length} test(s).`,
        );
      } else {
        toast.error(`Validation failed with ${result.errors.length} error(s).`);
      }
    } catch (error) {
      toast.error(
        "Validation failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!validationResult?.valid) {
      toast.error("Please validate the JSON first");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importTestsFromJson({ jsonData: jsonInput });

      if (result.success) {
        toast.success(`Successfully imported ${result.importedCount} test(s)!`);
        setJsonInput("");
        setValidationResult(null);
      } else {
        toast.error(
          `Import completed with errors: ${result.errors.join(", ")}`,
        );
      }
    } catch (error) {
      toast.error(
        "Import failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
            }`}
          >
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Drag and drop your JSON file here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or</p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <span className="btn btn-primary inline-block">Choose File</span>
            </label>
          </div>

          {/* JSON Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Or paste JSON directly:
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`Paste your JSON here. Example format:

{
  "name": "Test Name",
  "description": "Test description",
  "questions": [
    {
      "id": "q1",
      "text": "Question text",
      "type": "mcq",
      "options": ["A", "B", "C", "D"],
      "correctAnswers": ["B"]
    }
  ]
}`}
              className="w-full h-48 p-4 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-white"
              spellCheck={false}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleValidate}
              disabled={isValidating || !jsonInput.trim()}
              className="btn btn-secondary flex-1"
            >
              {isValidating ? "Validating..." : "Validate JSON"}
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting || !validationResult?.valid}
              className="btn btn-primary flex-1"
            >
              {isImporting ? "Importing..." : "Import Tests"}
            </button>
          </div>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg border ${validationResult.valid ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold ${validationResult.valid ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}
                >
                  {validationResult.valid
                    ? "Validation Passed"
                    : `Validation Failed (${validationResult.errors.length} errors)`}
                </span>
              </div>
            </div>

            {validationResult.tests.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Tests to Import ({validationResult.tests.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {validationResult.tests.map((test, index) => (
                    <div key={index} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {test.name}
                          </h4>
                          {test.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {test.description}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                          {test.questionCount} questions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validationResult.errors.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 overflow-hidden">
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                  <h3 className="font-semibold text-red-800 dark:text-red-200">
                    Errors ({validationResult.errors.length})
                  </h3>
                </div>
                <ul className="divide-y divide-red-100 dark:divide-red-900/30">
                  {validationResult.errors.map((error, index) => (
                    <li
                      key={index}
                      className="px-4 py-3 text-sm text-red-700 dark:text-red-300"
                    >
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
