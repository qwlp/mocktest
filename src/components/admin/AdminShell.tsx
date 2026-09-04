import React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Shield, ChevronLeft } from "lucide-react";
import { AdminAccess } from "../../types";
import { adminReducer, initialAdminState } from "./adminReducer";
import { TestsSidebar, type QuizFolder } from "./TestsSidebar";
import { TestEditorPage } from "./TestEditorPage";
import { ImportReview } from "./ImportReview";

interface AdminShellProps {
  onBack: () => void;
  access: AdminAccess;
  adminPassword: string;
  onLogout: () => void;
}

export function AdminShell({
  onBack,
  access,
  adminPassword,
  onLogout,
}: AdminShellProps) {
  const [state, dispatch] = React.useReducer(adminReducer, initialAdminState);
  const [selectedFolderId, setSelectedFolderId] = React.useState<Id<"folders"> | null>(null);
  const tests =
    useQuery(api.admin.getAdminTests, {
      adminPassword,
    }) ?? [];
  const folders = useQuery(api.admin.getFolders, { adminPassword }) ?? [];
  const firstTestInFolder = tests.find(
    (test) => (test.folderId ?? null) === selectedFolderId,
  );
  const selectedTestId = state.selectedTestId ?? firstTestInFolder?._id ?? null;
  const testEditor = useQuery(
    api.admin.getTestEditor,
    selectedTestId ? { adminPassword, testId: selectedTestId } : "skip",
  );

  const createTestDraft = useMutation(api.admin.createTestDraft);
  const updateTestDetails = useMutation(api.admin.updateTestDetails);
  const setTestStatus = useMutation(api.admin.setTestStatus);
  const deleteTestCascade = useMutation(api.admin.deleteTestCascade);
  const createQuestion = useMutation(api.admin.createQuestion);
  const updateQuestion = useMutation(api.admin.updateQuestion);
  const duplicateQuestion = useMutation(api.admin.duplicateQuestion);
  const deleteQuestionsBulk = useMutation(api.admin.deleteQuestionsBulk);
  const reorderQuestions = useMutation(api.admin.reorderQuestions);
  const createFolder = useMutation(api.admin.createFolder);
  const renameFolder = useMutation(api.admin.renameFolder);
  const deleteFolder = useMutation(api.admin.deleteFolder);
  const moveTestToFolder = useMutation(api.admin.moveTestToFolder);

  React.useEffect(() => {
    if (!state.selectedTestId && firstTestInFolder?._id) {
      dispatch({ type: "select_test", testId: firstTestInFolder._id });
    }
  }, [firstTestInFolder?._id, state.selectedTestId]);

  React.useEffect(() => {
    const dirty =
      state.dirtyState.import ||
      state.dirtyState.question ||
      state.dirtyState.test;
    if (!dirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    state.dirtyState.import,
    state.dirtyState.question,
    state.dirtyState.test,
  ]);

  const confirmDiscardChanges = React.useCallback(() => {
    const dirty =
      state.dirtyState.import ||
      state.dirtyState.question ||
      state.dirtyState.test;
    if (!dirty) {
      return true;
    }
    return window.confirm(
      "You have unsaved changes. Discard them and continue?",
    );
  }, [
    state.dirtyState.import,
    state.dirtyState.question,
    state.dirtyState.test,
  ]);

  const filteredTests = React.useMemo(() => {
    const search = state.filters.testSearch.trim().toLowerCase();
    return tests.filter((test) => {
      if (!search) return (test.folderId ?? null) === selectedFolderId;
      return (
        test.name.toLowerCase().includes(search) ||
        (test.description ?? "").toLowerCase().includes(search)
      );
    });
  }, [selectedFolderId, state.filters.testSearch, tests]);

  const handleSelectTest = (testId: Id<"tests">) => {
    if (!confirmDiscardChanges()) {
      return;
    }
    dispatch({ type: "set_view", view: "tests" });
    dispatch({ type: "select_test", testId });
    dispatch({ type: "set_dirty_state", key: "test", value: false });
    dispatch({ type: "set_dirty_state", key: "question", value: false });
    dispatch({ type: "set_dirty_state", key: "import", value: false });
  };

  const handleCreateDraft = async () => {
    const name = window.prompt("Name the new draft test:");
    if (!name?.trim()) {
      return;
    }

    dispatch({ type: "set_pending_action", value: "create-test" });
    try {
      const testId = await createTestDraft({
        adminPassword,
        name: name.trim(),
        folderId: selectedFolderId ?? undefined,
      });
      dispatch({ type: "select_test", testId });
      dispatch({ type: "set_view", view: "tests" });
      toast.success("Draft test created.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create draft test.",
      );
    } finally {
      dispatch({ type: "set_pending_action", value: null });
    }
  };

  const selectedTest = testEditor?.test;
  const questions = testEditor?.questions ?? [];
  const isEditingQuestion = state.questionEditorMode === "edit";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)]">
      {!isEditingQuestion && (
        <header className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-semibold text-[var(--color-text)]">
                  Admin Editor
                </h1>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Signed in as {access.email ?? "admin"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!confirmDiscardChanges()) {
                    return;
                  }
                  onBack();
                }}
                className="btn btn-secondary"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      <div className="mx-auto grid w-full max-w-[1800px] gap-8 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        <TestsSidebar
          tests={filteredTests}
          folders={folders}
          selectedTestId={selectedTestId}
          selectedFolderId={selectedFolderId}
          searchValue={state.filters.testSearch}
          onSearchChange={(value) =>
            dispatch({ type: "set_filter", key: "testSearch", value })
          }
          onSelectTest={handleSelectTest}
          onSelectFolder={(folderId) => {
            if (!confirmDiscardChanges()) return;
            setSelectedFolderId(folderId);
            dispatch({ type: "select_test", testId: null });
          }}
          onCreateFolder={(parentId) => {
            const name = window.prompt(parentId ? "Name the new subfolder:" : "Name the new folder:");
            if (!name?.trim()) return;
            void createFolder({ adminPassword, name: name.trim(), parentId: parentId ?? undefined })
              .then((folderId) => { setSelectedFolderId(folderId); toast.success("Folder created."); })
              .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to create folder."));
          }}
          onRenameFolder={(folder: QuizFolder) => {
            const name = window.prompt("Rename folder:", folder.name);
            if (!name?.trim() || name.trim() === folder.name) return;
            void renameFolder({ adminPassword, folderId: folder._id, name: name.trim() })
              .then(() => toast.success("Folder renamed."))
              .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to rename folder."));
          }}
          onDeleteFolder={(folder: QuizFolder) => {
            if (!window.confirm(`Delete the empty folder "${folder.name}"?`)) return;
            void deleteFolder({ adminPassword, folderId: folder._id })
              .then(() => { if (selectedFolderId === folder._id) setSelectedFolderId(null); toast.success("Folder deleted."); })
              .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to delete folder."));
          }}
          onMoveTest={(testId, folderId) => {
            void moveTestToFolder({ adminPassword, testId, folderId: folderId ?? undefined })
              .then(() => toast.success("Quiz moved."))
              .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to move quiz."));
          }}
          onCreateDraft={() => void handleCreateDraft()}
          onOpenImport={() => {
            if (!confirmDiscardChanges()) {
              return;
            }
            dispatch({ type: "set_view", view: "import" });
            dispatch({ type: "set_dirty_state", key: "test", value: false });
            dispatch({
              type: "set_dirty_state",
              key: "question",
              value: false,
            });
          }}
        />

        <main className="space-y-6">
          {state.view === "import" ? (
            <ImportReview
              adminPassword={adminPassword}
              onDirtyChange={(dirty) =>
                dispatch({
                  type: "set_dirty_state",
                  key: "import",
                  value: dirty,
                })
              }
              onImported={() => {
                dispatch({
                  type: "set_dirty_state",
                  key: "import",
                  value: false,
                });
                dispatch({ type: "set_view", view: "tests" });
              }}
            />
          ) : selectedTest && selectedTestId ? (
            <TestEditorPage
              test={selectedTest}
              questions={questions}
              filters={{
                search: state.filters.questionSearch,
                questionType: state.filters.questionType,
              }}
              bulkSelection={state.bulkSelection}
              editorMode={state.questionEditorMode}
              selectedQuestionId={state.selectedQuestionId}
              pendingAction={state.pendingAction}
              onFiltersChange={(filters) => {
                dispatch({
                  type: "set_filter",
                  key: "questionSearch",
                  value: filters.search,
                });
                dispatch({
                  type: "set_filter",
                  key: "questionType",
                  value: filters.questionType,
                });
              }}
              onSelectionChange={(questionIds) =>
                dispatch({ type: "set_bulk_selection", questionIds })
              }
              onOpenCreateQuestion={() => {
                if (state.dirtyState.question && !confirmDiscardChanges()) {
                  return;
                }
                dispatch({ type: "open_create_question" });
              }}
              onEditQuestion={(questionId) => {
                if (state.dirtyState.question && !confirmDiscardChanges()) {
                  return;
                }
                dispatch({ type: "open_edit_question", questionId });
              }}
              onCloseQuestionEditor={() => {
                if (state.dirtyState.question && !confirmDiscardChanges()) {
                  return;
                }
                dispatch({ type: "close_question_editor" });
                dispatch({
                  type: "set_dirty_state",
                  key: "question",
                  value: false,
                });
              }}
              onTestDirtyChange={(dirty) =>
                dispatch({ type: "set_dirty_state", key: "test", value: dirty })
              }
              onQuestionDirtyChange={(dirty) =>
                dispatch({
                  type: "set_dirty_state",
                  key: "question",
                  value: dirty,
                })
              }
              onSaveTest={async (draft) => {
                dispatch({ type: "set_pending_action", value: "save-test" });
                try {
                  await updateTestDetails({
                    adminPassword,
                    testId: selectedTestId,
                    name: draft.name,
                    description: draft.description,
                  });
                  dispatch({
                    type: "set_dirty_state",
                    key: "test",
                    value: false,
                  });
                  toast.success("Test details saved.");
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to save test.",
                  );
                } finally {
                  dispatch({ type: "set_pending_action", value: null });
                }
              }}
              onToggleStatus={async (status) => {
                dispatch({
                  type: "set_pending_action",
                  value: "toggle-status",
                });
                try {
                  await setTestStatus({
                    adminPassword,
                    testId: selectedTestId,
                    status,
                  });
                  toast.success(
                    status === "published"
                      ? "Test published."
                      : "Test moved back to draft.",
                  );
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to update test status.",
                  );
                } finally {
                  dispatch({ type: "set_pending_action", value: null });
                }
              }}
              onDeleteTest={async () => {
                if (
                  !window.confirm(
                    `Delete "${selectedTest.name}" and all ${questions.length} questions? This cannot be undone.`,
                  )
                ) {
                  return;
                }
                dispatch({ type: "set_pending_action", value: "delete-test" });
                try {
                  await deleteTestCascade({
                    adminPassword,
                    testId: selectedTestId,
                  });
                  dispatch({ type: "select_test", testId: null });
                  toast.success("Test deleted.");
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to delete test.",
                  );
                } finally {
                  dispatch({ type: "set_pending_action", value: null });
                }
              }}
              onSaveQuestion={async (mode, questionId, value) => {
                dispatch({
                  type: "set_pending_action",
                  value: "save-question",
                });
                try {
                  if (mode === "create") {
                    await createQuestion({
                      adminPassword,
                      testId: selectedTestId,
                      input: value,
                    });
                  } else if (questionId) {
                    await updateQuestion({
                      adminPassword,
                      questionId,
                      input: value,
                    });
                  }
                  dispatch({ type: "close_question_editor" });
                  dispatch({
                    type: "set_dirty_state",
                    key: "question",
                    value: false,
                  });
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to save question.",
                  );
                  throw error;
                } finally {
                  dispatch({ type: "set_pending_action", value: null });
                }
              }}
              onDuplicateQuestion={async (questionId) => {
                dispatch({
                  type: "set_pending_action",
                  value: "duplicate-question",
                });
                try {
                  await duplicateQuestion({ adminPassword, questionId });
                  toast.success("Question duplicated.");
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to duplicate question.",
                  );
                } finally {
                  dispatch({ type: "set_pending_action", value: null });
                }
              }}
              onDeleteQuestions={async (questionIds) => {
                dispatch({
                  type: "set_pending_action",
                  value: "delete-questions",
                });
                try {
                  await deleteQuestionsBulk({
                    adminPassword,
                    testId: selectedTestId,
                    questionIds,
                  });
                  dispatch({ type: "clear_bulk_selection" });
                  toast.success(
                    questionIds.length === 1
                      ? "Question deleted."
                      : `${questionIds.length} questions deleted.`,
                  );
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to delete questions.",
                  );
                } finally {
                  dispatch({ type: "set_pending_action", value: null });
                }
              }}
              onReorderQuestions={async (questionIds) => {
                dispatch({
                  type: "set_pending_action",
                  value: "reorder-questions",
                });
                try {
                  await reorderQuestions({
                    adminPassword,
                    testId: selectedTestId,
                    orderedQuestionIds: questionIds,
                  });
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to reorder questions.",
                  );
                } finally {
                  dispatch({ type: "set_pending_action", value: null });
                }
              }}
            />
          ) : (
            <div className="card p-10 text-center">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                Select a Test
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Choose a draft or published test from the sidebar to edit its
                content.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
