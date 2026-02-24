import { Clock, RotateCcw, Play } from "lucide-react";

interface ResumeDialogProps {
  isOpen: boolean;
  onResume: () => void;
  onStartFresh: () => void;
  savedQuestionIndex: number;
  totalQuestions: number;
}

export function ResumeDialog({
  isOpen,
  onResume,
  onStartFresh,
  savedQuestionIndex,
  totalQuestions,
}: ResumeDialogProps) {
  if (!isOpen) return null;

  const progressPercent = Math.round(
    ((savedQuestionIndex + 1) / totalQuestions) * 100,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md mx-4 p-6 animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-mint-100)] dark:bg-[var(--color-mint-900)]/30 flex items-center justify-center">
            <Clock className="w-8 h-8 text-[var(--color-mint-600)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">
            Resume Your Test?
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            We found your previous progress from this test.
          </p>
        </div>

        <div className="bg-[var(--color-background-alt)] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-text-secondary)]">
              Progress
            </span>
            <span className="text-sm font-medium text-[var(--color-text)]">
              {savedQuestionIndex + 1} of {totalQuestions} questions
            </span>
          </div>
          <div className="w-full bg-[var(--color-border)] rounded-full h-2 mb-2">
            <div
              className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Your progress will be saved for 3 days
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onResume}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Resume Test
          </button>
          <button
            onClick={onStartFresh}
            className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}
