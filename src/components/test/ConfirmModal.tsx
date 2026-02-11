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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 dark:bg-dark-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-3">
          Submit Test?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to submit the test? You will not be able to
          change your answers after submission.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
}
