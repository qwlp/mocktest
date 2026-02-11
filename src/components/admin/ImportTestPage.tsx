import React, { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

interface TestPreview {
  name: string;
  description: string;
  questionCount: number;
  questionBreakdown: Record<string, number>;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  tests: TestPreview[];
}

interface ImportTestPageProps {
  onBack: () => void;
}

export function ImportTestPage({ onBack }: ImportTestPageProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
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

  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      mcq: "Multiple Choice",
      tf: "True/False",
      ms: "Multiple Select",
      matching: "Matching",
      fib: "Fill-in-the-Blank",
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Import Tests
          </h1>
          <p className="text-gray-600 dark:text-white mt-1">
            Import test questions from JSON files
          </p>
        </div>
        <button onClick={onBack} className="btn btn-secondary">
          Back to Tests
        </button>
      </div>

      <div className="space-y-6">
        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
            }
          `}
        >
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-500 dark:text-white"
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
          <p className="text-gray-700 dark:text-white mb-2">
            Drag and drop your JSON file here
          </p>
          <p className="text-sm text-gray-500 dark:text-white mb-4">or</p>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
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
            className="w-full h-64 p-4 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
            {isValidating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Validating...
              </span>
            ) : (
              "Validate JSON"
            )}
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || !validationResult?.valid}
            className="btn btn-primary flex-1"
          >
            {isImporting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Importing...
              </span>
            ) : (
              "Import Tests"
            )}
          </button>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-4">
            {/* Validation Status */}
            <div
              className={`p-4 rounded-lg border ${
                validationResult.valid
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {validationResult.valid ? (
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span
                  className={`font-semibold ${
                    validationResult.valid
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {validationResult.valid
                    ? "Validation Passed"
                    : `Validation Failed (${validationResult.errors.length} errors)`}
                </span>
              </div>
            </div>

            {/* Test Preview */}
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
                            <p className="text-sm text-gray-600 dark:text-white mt-1">
                              {test.description}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                          {test.questionCount} questions
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(test.questionBreakdown).map(
                          ([type, count]) => (
                            <span
                              key={type}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded"
                            >
                              {count} {getQuestionTypeLabel(type)}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error List */}
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

        {/* Help Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            JSON Format Help
          </h3>
          <p className="text-sm text-gray-600 dark:text-white mb-2">
            Your JSON can contain a single test object or an array of tests.
            Each test must have:
          </p>
          <ul className="text-sm text-gray-600 dark:text-white list-disc list-inside space-y-1">
            <li>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                name
              </code>{" "}
              - Test name (required)
            </li>
            <li>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                description
              </code>{" "}
              - Test description (optional)
            </li>
            <li>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                questions
              </code>{" "}
              - Array of questions (required)
            </li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-white mt-2">
            Supported question types:{" "}
            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
              mcq
            </code>
            ,{" "}
            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
              tf
            </code>
            ,{" "}
            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
              ms
            </code>
            ,{" "}
            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
              matching
            </code>
            ,{" "}
            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
              fib
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
