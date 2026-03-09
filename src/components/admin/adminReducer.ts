import { Id } from "../../../convex/_generated/dataModel";
import { QuestionType } from "../../../shared/adminSchema";

export type AdminView = "tests" | "import";
export type QuestionEditorMode = "create" | "edit" | null;

export interface AdminState {
  view: AdminView;
  selectedTestId: Id<"tests"> | null;
  selectedQuestionId: Id<"questions"> | null;
  questionEditorMode: QuestionEditorMode;
  dirtyState: {
    test: boolean;
    question: boolean;
    import: boolean;
  };
  pendingAction: string | null;
  filters: {
    testSearch: string;
    questionSearch: string;
    questionType: QuestionType | "all";
  };
  bulkSelection: Id<"questions">[];
}

type AdminAction =
  | { type: "set_view"; view: AdminView }
  | { type: "select_test"; testId: Id<"tests"> | null }
  | { type: "open_create_question" }
  | { type: "open_edit_question"; questionId: Id<"questions"> }
  | { type: "close_question_editor" }
  | {
      type: "set_dirty_state";
      key: keyof AdminState["dirtyState"];
      value: boolean;
    }
  | { type: "set_pending_action"; value: string | null }
  | {
      type: "set_filter";
      key: keyof AdminState["filters"];
      value: string;
    }
  | { type: "set_bulk_selection"; questionIds: Id<"questions">[] }
  | { type: "clear_bulk_selection" };

export const initialAdminState: AdminState = {
  view: "tests",
  selectedTestId: null,
  selectedQuestionId: null,
  questionEditorMode: null,
  dirtyState: {
    test: false,
    question: false,
    import: false,
  },
  pendingAction: null,
  filters: {
    testSearch: "",
    questionSearch: "",
    questionType: "all",
  },
  bulkSelection: [],
};

export function adminReducer(
  state: AdminState,
  action: AdminAction,
): AdminState {
  switch (action.type) {
    case "set_view":
      return {
        ...state,
        view: action.view,
        selectedQuestionId: null,
        questionEditorMode: null,
        bulkSelection: [],
      };
    case "select_test":
      return {
        ...state,
        selectedTestId: action.testId,
        selectedQuestionId: null,
        questionEditorMode: null,
        bulkSelection: [],
        filters: {
          ...state.filters,
          questionSearch: "",
          questionType: "all",
        },
      };
    case "open_create_question":
      return {
        ...state,
        questionEditorMode: "create",
        selectedQuestionId: null,
      };
    case "open_edit_question":
      return {
        ...state,
        questionEditorMode: "edit",
        selectedQuestionId: action.questionId,
      };
    case "close_question_editor":
      return {
        ...state,
        questionEditorMode: null,
        selectedQuestionId: null,
      };
    case "set_dirty_state":
      return {
        ...state,
        dirtyState: {
          ...state.dirtyState,
          [action.key]: action.value,
        },
      };
    case "set_pending_action":
      return {
        ...state,
        pendingAction: action.value,
      };
    case "set_filter":
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.key]: action.value,
        },
      };
    case "set_bulk_selection":
      return {
        ...state,
        bulkSelection: action.questionIds,
      };
    case "clear_bulk_selection":
      return {
        ...state,
        bulkSelection: [],
      };
    default:
      return state;
  }
}
