import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  tests: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    sortOrder: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_status", ["status"]),

  questions: defineTable({
    testId: v.id("tests"),
    text: v.string(),
    type: v.union(
      v.literal("mcq"),
      v.literal("tf"),
      v.literal("ms"),
      v.literal("matching"),
      v.literal("fib"),
    ),
    options: v.array(v.string()),
    correctAnswers: v.array(v.string()),
    questionId: v.string(),
    sortOrder: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    // For matching questions
    matchingPairs: v.optional(
      v.array(
        v.object({
          prompt: v.string(),
          answer: v.string(),
        }),
      ),
    ),
    // Additional answers for matching questions (can include distractors)
    matchingAnswers: v.optional(v.array(v.string())),
  })
    .index("by_questionId", ["questionId"])
    .index("by_testId", ["testId"])
    .index("by_testId_questionId", ["testId", "questionId"]),

  adminUsers: defineTable({
    userId: v.id("users"),
    email: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
