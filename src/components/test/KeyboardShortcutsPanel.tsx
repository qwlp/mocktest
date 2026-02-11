import React, { useState } from "react";
import {
  Keyboard,
  X,
  Command,
  ArrowLeft,
  ArrowRight,
  CornerDownLeft,
  Hash,
  Flag,
} from "lucide-react";

// Custom Escape key icon
const EscapeIcon = () => (
  <svg
    className="w-3 h-3"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16v16H4z" />
    <path d="M8 8h8M8 12h8M8 16h4" />
  </svg>
);
import { QuestionType } from "../../types";
import {
  getQuestionTypeShortcut,
  getQuestionTypeLabel,
  getQuestionTypeIcon,
} from "../../hooks/useKeyboardShortcuts";

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestionType?: QuestionType;
  onJumpToType?: (type: QuestionType) => void;
}

interface ShortcutItemProps {
  keys: React.ReactNode[];
  description: string;
  highlight?: boolean;
}

function ShortcutItem({ keys, description, highlight }: ShortcutItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        highlight
          ? "bg-[var(--color-primary-subtle)]"
          : "hover:bg-[var(--color-surface-elevated)]"
      }`}
    >
      <span className="text-sm text-[var(--color-text-secondary)]">
        {description}
      </span>
      <div className="flex items-center gap-1.5">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            {key}
            {index < keys.length - 1 && (
              <span className="text-[var(--color-text-muted)] text-xs">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

export function KeyboardShortcutsPanel({
  isOpen,
  onClose,
  currentQuestionType,
  onJumpToType,
}: KeyboardShortcutsPanelProps) {
  const [activeTab, setActiveTab] = useState<"navigation" | "questions">(
    "navigation",
  );

  const questionTypes: QuestionType[] = ["mcq", "tf", "ms", "matching", "fib"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-scale-in">
        <div
          className="card overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-[var(--color-text)]">
                  Keyboard Shortcuts
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Navigate faster with your keyboard
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--color-border)]">
            <button
              onClick={() => setActiveTab("navigation")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === "navigation"
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              Navigation
              {activeTab === "navigation" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === "questions"
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              Question Types
              {activeTab === "questions" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {activeTab === "navigation" ? (
              <div className="space-y-2">
                <ShortcutItem
                  keys={[
                    <Kbd>
                      <ArrowLeft className="w-3 h-3" />
                    </Kbd>,
                    <Kbd>K</Kbd>,
                  ]}
                  description="Previous question"
                />
                <ShortcutItem
                  keys={[
                    <Kbd>
                      <ArrowRight className="w-3 h-3" />
                    </Kbd>,
                    <Kbd>J</Kbd>,
                  ]}
                  description="Next question"
                />
                <ShortcutItem
                  keys={[
                    <Kbd>1</Kbd>,
                    <Kbd>2</Kbd>,
                    <Kbd>3</Kbd>,
                    <Kbd>...</Kbd>,
                  ]}
                  description="Select option"
                />
                <ShortcutItem
                  keys={[
                    <Kbd>
                      <Command className="w-3 h-3" />
                    </Kbd>,
                    <Kbd>S</Kbd>,
                  ]}
                  description="Submit test"
                  highlight
                />
                <ShortcutItem
                  keys={[<Kbd>F</Kbd>]}
                  description="Flag question for review"
                />
                <ShortcutItem
                  keys={[
                    <Kbd>
                      <EscapeIcon />
                    </Kbd>,
                  ]}
                  description="Exit test"
                />
                <ShortcutItem
                  keys={[
                    <Kbd>
                      <CornerDownLeft className="w-3 h-3" />
                    </Kbd>,
                  ]}
                  description="Confirm selection"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Jump to questions by type using <Kbd>Alt</Kbd> + key
                </p>
                {questionTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => onJumpToType?.(type)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left ${
                      currentQuestionType === type
                        ? "bg-[var(--color-primary)] text-white shadow-md"
                        : "hover:bg-[var(--color-surface-elevated)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {getQuestionTypeIcon(type)}
                      </span>
                      <span
                        className={
                          currentQuestionType === type
                            ? "text-white"
                            : "text-[var(--color-text)]"
                        }
                      >
                        {getQuestionTypeLabel(type)}
                      </span>
                    </div>
                    <Kbd>{getQuestionTypeShortcut(type)}</Kbd>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50">
            <p className="text-xs text-center text-[var(--color-text-muted)]">
              Press <Kbd>?</Kbd> anytime to show this help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function KeyboardShortcutsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tooltip flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
      data-tooltip="Keyboard shortcuts (?)"
    >
      <Keyboard className="w-4 h-4" />
      <span className="hidden sm:inline">Shortcuts</span>
      <Kbd>?</Kbd>
    </button>
  );
}
