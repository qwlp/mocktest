import React from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmationProps {
  isOpen: boolean;
  type: "test" | "question" | "questions";
  name: string;
  count?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmation({
  isOpen,
  type,
  name,
  count,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case "test":
        return "Delete Test";
      case "question":
        return "Delete Question";
      case "questions":
        return `Delete ${count} Questions`;
      default:
        return "Delete";
    }
  };

  const getMessage = () => {
    switch (type) {
      case "test":
        return `Are you sure you want to delete "${name}"? This will also delete all ${count || 0} questions in this test. This action cannot be undone.`;
      case "question":
        return `Are you sure you want to delete "${name}"? This action cannot be undone.`;
      case "questions":
        return `Are you sure you want to delete ${count} selected questions? This action cannot be undone.`;
      default:
        return "Are you sure? This action cannot be undone.";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[var(--color-surface)] rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                {getTitle()}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                {getMessage()}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-[var(--color-bg)] hover:bg-[var(--color-surface-elevated)] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
