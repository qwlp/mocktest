import { describe, expect, it } from "vitest";
import { shouldIgnoreKeyboardShortcutTarget } from "./useKeyboardShortcuts";

describe("shouldIgnoreKeyboardShortcutTarget", () => {
  it("ignores native form controls including selects used by matching questions", () => {
    expect(
      shouldIgnoreKeyboardShortcutTarget({ tagName: "select" } as EventTarget),
    ).toBe(true);
    expect(
      shouldIgnoreKeyboardShortcutTarget({ tagName: "input" } as EventTarget),
    ).toBe(true);
    expect(
      shouldIgnoreKeyboardShortcutTarget(
        { tagName: "textarea" } as EventTarget,
      ),
    ).toBe(true);
  });

  it("ignores contenteditable and combobox-style custom controls", () => {
    expect(
      shouldIgnoreKeyboardShortcutTarget(
        { isContentEditable: true } as EventTarget,
      ),
    ).toBe(true);
    expect(
      shouldIgnoreKeyboardShortcutTarget(
        {
          getAttribute: (name: string) =>
            name === "role" ? "combobox" : null,
        } as EventTarget,
      ),
    ).toBe(true);
  });

  it("allows global shortcuts for non-interactive targets", () => {
    expect(
      shouldIgnoreKeyboardShortcutTarget({ tagName: "div" } as EventTarget),
    ).toBe(false);
    expect(shouldIgnoreKeyboardShortcutTarget(null)).toBe(false);
  });
});
