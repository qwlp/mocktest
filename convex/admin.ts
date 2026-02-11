import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Hash function for admin password (simple SHA-256)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Admin password - should be set via environment variable or initial setup
// For this demo, we'll use a default password "admin123"
const DEFAULT_ADMIN_PASSWORD = "admin123";

// Check if admin is already configured
export const isAdminConfigured = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("adminConfig").collect();
    return configs.length > 0;
  },
});

// Initialize admin password (can only be called once)
export const initializeAdmin = mutation({
  args: {
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if admin already exists
    const existingConfigs = await ctx.db.query("adminConfig").collect();
    if (existingConfigs.length > 0) {
      throw new Error("Admin already configured");
    }

    const password = args.password || DEFAULT_ADMIN_PASSWORD;
    const passwordHash = await hashPassword(password);

    await ctx.db.insert("adminConfig", {
      passwordHash,
      createdAt: Date.now(),
    });

    return { success: true, message: "Admin configured successfully" };
  },
});

// Verify admin password
export const verifyAdminPassword = mutation({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const configs = await ctx.db.query("adminConfig").collect();
    if (configs.length === 0) {
      // Auto-initialize with default password if not configured
      const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
      await ctx.db.insert("adminConfig", {
        passwordHash,
        createdAt: Date.now(),
      });

      // Verify against the newly created password
      return args.password === DEFAULT_ADMIN_PASSWORD;
    }

    const config = configs[0];
    const passwordHash = await hashPassword(args.password);
    return passwordHash === config.passwordHash;
  },
});

// Update admin password
export const updateAdminPassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify current password
    const configs = await ctx.db.query("adminConfig").collect();
    if (configs.length === 0) {
      throw new Error("Admin not configured");
    }

    const config = configs[0];
    const currentHash = await hashPassword(args.currentPassword);
    if (currentHash !== config.passwordHash) {
      throw new Error("Current password is incorrect");
    }

    // Update to new password
    const newHash = await hashPassword(args.newPassword);
    await ctx.db.patch(config._id, {
      passwordHash: newHash,
      createdAt: Date.now(),
    });

    return { success: true, message: "Password updated successfully" };
  },
});

// Validation helper for questions
function validateQuestion(question: any, index: number): string[] {
  const errors: string[] = [];
  const questionNum = index + 1;

  // Check required fields
  if (!question.id) {
    errors.push(`Question ${questionNum}: Missing "id" field`);
  }
  if (!question.text) {
    errors.push(`Question ${questionNum}: Missing "text" field`);
  }
  if (!question.type) {
    errors.push(`Question ${questionNum}: Missing "type" field`);
  }
  if (!question.correctAnswers || !Array.isArray(question.correctAnswers)) {
    errors.push(
      `Question ${questionNum}: Missing or invalid "correctAnswers" field (must be an array)`,
    );
  }

  // Validate question type
  const validTypes = ["mcq", "tf", "ms", "matching", "fib"];
  if (question.type && !validTypes.includes(question.type)) {
    errors.push(
      `Question ${questionNum}: Invalid type "${question.type}". Must be one of: ${validTypes.join(", ")}`,
    );
  }

  // Type-specific validation
  if (question.type) {
    switch (question.type) {
      case "mcq":
        if (!question.options || question.options.length < 2) {
          errors.push(
            `Question ${questionNum} (MCQ): Must have at least 2 options`,
          );
        }
        if (question.correctAnswers && question.correctAnswers.length !== 1) {
          errors.push(
            `Question ${questionNum} (MCQ): Must have exactly 1 correct answer`,
          );
        }
        break;

      case "tf":
        if (!question.options || question.options.length !== 2) {
          errors.push(
            `Question ${questionNum} (True/False): Must have exactly 2 options (True, False)`,
          );
        }
        if (question.correctAnswers && question.correctAnswers.length !== 1) {
          errors.push(
            `Question ${questionNum} (True/False): Must have exactly 1 correct answer`,
          );
        }
        if (
          question.correctAnswers &&
          !["True", "False"].includes(question.correctAnswers[0])
        ) {
          errors.push(
            `Question ${questionNum} (True/False): Correct answer must be "True" or "False"`,
          );
        }
        break;

      case "ms":
        if (!question.options || question.options.length < 2) {
          errors.push(
            `Question ${questionNum} (Multiple Select): Must have at least 2 options`,
          );
        }
        if (question.correctAnswers && question.correctAnswers.length < 1) {
          errors.push(
            `Question ${questionNum} (Multiple Select): Must have at least 1 correct answer`,
          );
        }
        break;

      case "matching":
        if (
          !question.matchingPairs ||
          !Array.isArray(question.matchingPairs) ||
          question.matchingPairs.length < 2
        ) {
          errors.push(
            `Question ${questionNum} (Matching): Must have at least 2 matching pairs`,
          );
        }
        if (question.matchingPairs) {
          question.matchingPairs.forEach((pair: any, pairIndex: number) => {
            if (!pair.prompt) {
              errors.push(
                `Question ${questionNum} (Matching): Pair ${pairIndex + 1} is missing "prompt"`,
              );
            }
            if (!pair.answer) {
              errors.push(
                `Question ${questionNum} (Matching): Pair ${pairIndex + 1} is missing "answer"`,
              );
            }
          });
        }
        break;

      case "fib":
        if (!question.correctAnswers || question.correctAnswers.length < 1) {
          errors.push(
            `Question ${questionNum} (Fill-in-the-Blank): Must have at least 1 correct answer`,
          );
        }
        break;
    }
  }

  return errors;
}

// Validate test JSON structure
export const validateTestJson = mutation({
  args: {
    jsonData: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const data = JSON.parse(args.jsonData);
      const errors: string[] = [];
      const tests: any[] = [];

      // Handle both single test and array of tests
      const testArray = Array.isArray(data) ? data : [data];

      if (testArray.length === 0) {
        return {
          valid: false,
          errors: ["No tests found in JSON"],
          tests: [],
        };
      }

      testArray.forEach((test, testIndex) => {
        const testNum = testIndex + 1;

        // Validate test structure
        if (!test.name) {
          errors.push(`Test ${testNum}: Missing "name" field`);
        }
        if (!test.questions || !Array.isArray(test.questions)) {
          errors.push(
            `Test ${testNum}: Missing or invalid "questions" field (must be an array)`,
          );
        } else if (test.questions.length === 0) {
          errors.push(`Test ${testNum}: Questions array cannot be empty`);
        } else {
          // Validate each question
          test.questions.forEach((question: any, qIndex: number) => {
            const questionErrors = validateQuestion(question, qIndex);
            errors.push(...questionErrors);
          });
        }

        // Prepare preview data
        if (test.name && test.questions) {
          const questionBreakdown: Record<string, number> = {};
          test.questions.forEach((q: any) => {
            if (q.type) {
              questionBreakdown[q.type] = (questionBreakdown[q.type] || 0) + 1;
            }
          });

          tests.push({
            name: test.name,
            description: test.description || "",
            questionCount: test.questions.length,
            questionBreakdown,
          });
        }
      });

      return {
        valid: errors.length === 0,
        errors,
        tests,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [
          `Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        tests: [],
      };
    }
  },
});

// Import tests from JSON
export const importTestsFromJson = mutation({
  args: {
    jsonData: v.string(),
  },
  handler: async (ctx, args) => {
    const data = JSON.parse(args.jsonData);
    const testArray = Array.isArray(data) ? data : [data];
    const importedTests: string[] = [];
    const errors: string[] = [];

    for (const testData of testArray) {
      try {
        // Create test
        const testId = await ctx.db.insert("tests", {
          name: testData.name,
          description: testData.description,
        });

        // Create questions
        for (const question of testData.questions) {
          await ctx.db.insert("questions", {
            testId,
            text: question.text,
            type: question.type,
            options: question.options || [],
            correctAnswers: question.correctAnswers,
            questionId: question.id,
            matchingPairs: question.matchingPairs,
          });
        }

        importedTests.push(testData.name);
      } catch (error) {
        errors.push(
          `Failed to import "${testData.name}": ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    return {
      success: errors.length === 0,
      importedCount: importedTests.length,
      importedTests,
      errors,
    };
  },
});
