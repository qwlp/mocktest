import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-[var(--color-border)]">
        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
          Submit Test?
        </h3>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Are you sure you want to submit the test? You will not be able to
          change your answers after submission.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[var(--color-text)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors shadow-md"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
}
