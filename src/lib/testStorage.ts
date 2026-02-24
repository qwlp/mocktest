import { Id } from "../../convex/_generated/dataModel";
import { UserAnswer } from "../types";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 259,200,000 ms

export interface SavedTestProgress {
  userAnswers: UserAnswer[];
  currentQuestionIndex: number;
  timestamp: number;
  testId: string;
  userId: string;
}

function getStorageKey(testId: string, userId: string): string {
  return `test-progress-${testId}-${userId}`;
}

export function saveTestProgress(
  testId: Id<"tests">,
  userId: string,
  userAnswers: UserAnswer[],
  currentQuestionIndex: number,
): void {
  try {
    const data: SavedTestProgress = {
      userAnswers,
      currentQuestionIndex,
      timestamp: Date.now(),
      testId: testId.toString(),
      userId,
    };
    localStorage.setItem(
      getStorageKey(testId.toString(), userId),
      JSON.stringify(data),
    );
  } catch (error) {
    console.warn("Failed to save test progress:", error);
  }
}

export function loadTestProgress(
  testId: Id<"tests">,
  userId: string,
): SavedTestProgress | null {
  try {
    const key = getStorageKey(testId.toString(), userId);
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    const data: SavedTestProgress = JSON.parse(stored);

    // Check expiration (3 days)
    const now = Date.now();
    const age = now - data.timestamp;

    if (age > THREE_DAYS_MS) {
      // Expired - clean up
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Failed to load test progress:", error);
    return null;
  }
}

export function clearTestProgress(testId: Id<"tests">, userId: string): void {
  try {
    const key = getStorageKey(testId.toString(), userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear test progress:", error);
  }
}

export function hasTestProgress(testId: Id<"tests">, userId: string): boolean {
  return loadTestProgress(testId, userId) !== null;
}

// Clean up all expired test progress entries
export function cleanupExpiredProgress(): void {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("test-progress-")) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const data: SavedTestProgress = JSON.parse(stored);
            const age = now - data.timestamp;
            if (age > THREE_DAYS_MS) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid data, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn("Failed to cleanup expired progress:", error);
  }
}
