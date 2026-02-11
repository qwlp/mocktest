import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  tests: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }),

  questions: defineTable({
    testId: v.id("tests"), 
    text: v.string(),
    type: v.union(
      v.literal("mcq"),
      v.literal("tf"),
      v.literal("ms"),
      v.literal("matching"),
      v.literal("fib")
    ),
    options: v.array(v.string()),
    correctAnswers: v.array(v.string()),
    questionId: v.string(),
    // For matching questions
    matchingPairs: v.optional(v.array(v.object({
      prompt: v.string(),
      answer: v.string()
    }))),
  })
  .index("by_questionId", ["questionId"])
  .index("by_testId", ["testId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
