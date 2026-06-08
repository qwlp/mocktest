import { Id } from "../../convex/_generated/dataModel";
import { UserAnswer } from "../types";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 259,200,000 ms

export interface SavedTestProgress {
  userAnswers: UserAnswer[];
  currentQuestionIndex: number;
  timestamp: number;
  testId: string;
  userId: string;
  // Store standard option order so resumed attempts keep the same numbering
  shuffledOptionOrders?: Record<string, string[]>;
  // Store shuffled matching answers per question ID to ensure consistent scoring
  shuffledMatchingOrders?: Record<string, string[]>;
}

function getStorageKey(testId: string, userId: string): string {
  return `test-progress-${testId}-${userId}`;
}

export function saveTestProgress(
  testId: Id<"tests">,
  userId: string,
  userAnswers: UserAnswer[],
  currentQuestionIndex: number,
  shuffledOptionOrders?: Map<string, string[]>,
  shuffledMatchingOrders?: Map<string, string[]>,
): void {
  try {
    const shuffledOptionsRecord: Record<string, string[]> = {};
    if (shuffledOptionOrders) {
      shuffledOptionOrders.forEach((value, key) => {
        shuffledOptionsRecord[key] = value;
      });
    }

    // Convert Map to Record for JSON serialization
    const shuffledOrdersRecord: Record<string, string[]> = {};
    if (shuffledMatchingOrders) {
      shuffledMatchingOrders.forEach((value, key) => {
        shuffledOrdersRecord[key] = value;
      });
    }

    const data: SavedTestProgress = {
      userAnswers,
      currentQuestionIndex,
      timestamp: Date.now(),
      testId: testId.toString(),
      userId,
      shuffledOptionOrders:
        Object.keys(shuffledOptionsRecord).length > 0
          ? shuffledOptionsRecord
          : undefined,
      shuffledMatchingOrders:
        Object.keys(shuffledOrdersRecord).length > 0
          ? shuffledOrdersRecord
          : undefined,
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
