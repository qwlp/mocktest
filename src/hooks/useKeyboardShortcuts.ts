import { useEffect, useCallback } from "react";
import { QuestionType } from "../types";

export interface KeyboardShortcuts {
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onSubmitTest: () => void;
  onExitTest: () => void;
  onSelectOption: (index: number) => void;
  onToggleFlag?: () => void;
  isSubmitted: boolean;
  optionsLength: number;
}

export function useKeyboardShortcuts({
  onNextQuestion,
  onPrevQuestion,
  onSubmitTest,
  onExitTest,
  onSelectOption,
  onToggleFlag,
  isSubmitted,
  optionsLength,
}: KeyboardShortcuts) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const { key, shiftKey, ctrlKey, metaKey, altKey } = event;

      // Navigation shortcuts
      if (key === "ArrowRight" || key === "j" || key === "J") {
        event.preventDefault();
        onNextQuestion();
      }

      if (key === "ArrowLeft" || key === "k" || key === "K") {
        event.preventDefault();
        onPrevQuestion();
      }

      // Number keys for selecting options
      if (/^[1-9]$/.test(key) && !isSubmitted) {
        const optionIndex = parseInt(key, 10) - 1;
        if (optionIndex < optionsLength) {
          event.preventDefault();
          onSelectOption(optionIndex);
        }
      }

      // Submit test
      if ((key === "Enter" && shiftKey) || (key === "s" && ctrlKey)) {
        event.preventDefault();
        onSubmitTest();
      }

      // Exit test
      if (key === "Escape") {
        event.preventDefault();
        onExitTest();
      }

      // Toggle flag (if available)
      if (key === "f" || key === "F") {
        event.preventDefault();
        onToggleFlag?.();
      }

      // Jump to specific question type (with Alt key)
      if (altKey) {
        // These will be handled by the component to filter/navigate to specific question types
        switch (key.toLowerCase()) {
          case "m": // Multiple Choice
          case "t": // True/False
          case "s": // Multiple Select
          case "a": // Matching
          case "i": // Fill in blank
            // These are handled by the parent component
            break;
        }
      }
    },
    [
      onNextQuestion,
      onPrevQuestion,
      onSubmitTest,
      onExitTest,
      onSelectOption,
      onToggleFlag,
      isSubmitted,
      optionsLength,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function getQuestionTypeShortcut(type: QuestionType): string {
  const shortcuts: Record<QuestionType, string> = {
    mcq: "Alt + M",
    tf: "Alt + T",
    ms: "Alt + S",
    matching: "Alt + A",
    fib: "Alt + I",
  };
  return shortcuts[type];
}

export function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    mcq: "Multiple Choice",
    tf: "True / False",
    ms: "Multiple Select",
    matching: "Matching",
    fib: "Fill in Blank",
  };
  return labels[type];
}

export function getQuestionTypeIcon(type: QuestionType): string {
  const icons: Record<QuestionType, string> = {
    mcq: "○",
    tf: "✓",
    ms: "☐",
    matching: "⇄",
    fib: "✎",
  };
  return icons[type];
}
