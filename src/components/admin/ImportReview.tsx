import React from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { parseImportJson, type ImportValidationResult } from "../../../shared/adminSchema";
import { Upload, FileJson } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

interface ImportReviewProps {
  adminPassword: string;
  folderId: Id<"folders"> | null;
  folderName?: string;
  onImported: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

export function ImportReview({
  adminPassword,
  folderId,
  folderName,
  onImported,
  onDirtyChange,
}: ImportReviewProps) {
  const [jsonInput, setJsonInput] = React.useState("");
  const [preview, setPreview] = React.useState<ImportValidationResult | null>(null);
  const [isReviewing, setIsReviewing] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const previewImport = useMutation(api.admin.previewImport);
  const importTests = useMutation(api.admin.importTests);

  React.useEffect(() => {
    onDirtyChange(jsonInput.trim().length > 0 || Boolean(preview));
  }, [jsonInput, onDirtyChange, preview]);

  const handleFileUpload = async (file: File) => {
    const content = await file.text();
    setJsonInput(content);
    setPreview(null);
  };

  const handleReview = async () => {
    if (!jsonInput.trim()) {
      toast.error("Paste or upload JSON before reviewing.");
      return;
    }

    setIsReviewing(true);
    try {
      const localPreview = parseImportJson(jsonInput);
      const serverPreview = await previewImport({
        adminPassword,
        jsonData: jsonInput,
      });
      const result = serverPreview.valid ? serverPreview : localPreview;
      setPreview(result);
      if (result.valid) {
        toast.success(`Ready to import ${result.tests.length} test(s) as drafts.`);
      } else {
        toast.error(`Import review found ${result.errors.length} issue(s).`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to review import JSON.",
      );
    } finally {
      setIsReviewing(false);
    }
  };

  const handleImport = async () => {
    if (!preview?.valid || !preview.normalizedTests) {
      toast.error("Review and fix the JSON before importing.");
      return;
    }

    setIsImporting(true);
    try {
      await importTests({
        adminPassword,
        normalizedTests: preview.normalizedTests,
        publishMode: "draft",
        folderId: folderId ?? undefined,
      });
      toast.success(
        `Imported ${preview.normalizedTests.length} draft test(s) to ${folderName ?? "Unfiled quizzes"}.`,
      );
      setJsonInput("");
      setPreview(null);
      onImported();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import tests.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary-subtle)] flex items-center justify-center">
            <FileJson className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Import JSON</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Parse, validate, review, then import as drafts to {folderName ?? "Unfiled quizzes"}.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] mb-4">
          <textarea
            value={jsonInput}
            onChange={(event) => {
              setJsonInput(event.target.value);
              setPreview(null);
            }}
            rows={18}
            placeholder="Paste a single test object or an array of tests."
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 font-mono text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <label className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-4 flex flex-col items-center justify-center text-center gap-3 cursor-pointer min-h-[160px]">
            <Upload className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-text-secondary)]">
              Upload JSON
            </span>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleFileUpload(file);
                }
              }}
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={handleReview} className="btn btn-secondary" disabled={isReviewing}>
            {isReviewing ? "Reviewing..." : "Review Import"}
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="btn btn-primary"
            disabled={isImporting || !preview?.valid}
          >
            {isImporting ? "Importing..." : "Import Drafts"}
          </button>
        </div>
      </section>

      {preview && (
        <section className="card p-6 space-y-5">
          <div className={`rounded-2xl border p-4 ${
            preview.valid
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
          }`}>
            <h3 className="font-semibold text-[var(--color-text)]">
              {preview.valid
                ? `Validated ${preview.tests.length} test(s)`
                : `Found ${preview.errors.length} issue(s)`}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Imports always create draft tests first.
            </p>
          </div>

          {preview.tests.length > 0 && (
            <div className="space-y-3">
              {preview.tests.map((test) => (
                <div
                  key={`${test.name}-${test.questionCount}`}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-[var(--color-text)]">{test.name}</h4>
                      {test.description && (
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          {test.description}
                        </p>
                      )}
                    </div>
                    <span className="badge badge-rose">{test.questionCount}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(test.questionBreakdown)
                      .filter(([, count]) => count > 0)
                      .map(([type, count]) => (
                        <span
                          key={type}
                          className="text-xs px-2 py-1 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                        >
                          {count} {type.toUpperCase()}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {preview.errors.length > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <h4 className="font-semibold text-[var(--color-text)] mb-3">Validation Errors</h4>
              <ul className="space-y-2 text-sm text-rose-800">
                {preview.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
