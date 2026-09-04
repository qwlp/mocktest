import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

function getStatus(document: Record<string, unknown>): "draft" | "published" {
  return document.status === "draft" ? "draft" : "published";
}

function getSortOrder(
  document: { _creationTime: number } & Record<string, unknown>,
  fallback: number,
): number {
  return typeof document.sortOrder === "number" ? document.sortOrder : fallback;
}

function getUpdatedAt(document: { _creationTime: number } & Record<string, unknown>) {
  return typeof document.updatedAt === "number"
    ? document.updatedAt
    : document._creationTime;
}

async function getSortedQuestions(ctx: any, testId: string) {
  const questions = await ctx.db
    .query("questions")
    .withIndex("by_testId", (query: any) => query.eq("testId", testId))
    .collect();

  return questions
    .map((question: any, index: number) => ({
      ...question,
      sortOrder: getSortOrder(question, index),
      updatedAt: getUpdatedAt(question),
    }))
    .sort((left: any, right: any) => left.sortOrder - right.sortOrder);
}

export const getTests = query({
  args: {},
  handler: async (ctx) => {
    const tests = await ctx.db.query("tests").collect();
    const publishedTests = tests
      .map((test, index) => ({
        ...test,
        status: getStatus(test),
        sortOrder: getSortOrder(test, index),
        updatedAt: getUpdatedAt(test),
      }))
      .filter((test) => test.status === "published")
      .sort((left, right) => left.sortOrder - right.sortOrder);

    return Promise.all(
      publishedTests.map(async (test) => {
        const questions = await ctx.db
          .query("questions")
          .withIndex("by_testId", (query) => query.eq("testId", test._id))
          .collect();
        return {
          ...test,
          questionCount: questions.length,
        };
      }),
    );
  },
});

// Folder names and hierarchy are public, but quiz editing remains admin-only.
export const getFolders = query({
  args: {},
  handler: async (ctx) => {
    const folders = await ctx.db.query("folders").collect();
    return folders
      .map(({ _id, name, parentId, sortOrder }) => ({
        _id,
        name,
        parentId,
        sortOrder,
      }))
      .sort((left, right) =>
        left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
      );
  },
});

export const getTest = query({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    const test = await ctx.db.get(args.testId);
    if (!test) {
      return null;
    }

    const normalizedTest = {
      ...test,
      status: getStatus(test),
      sortOrder: getSortOrder(test, 0),
      updatedAt: getUpdatedAt(test),
    };

    return normalizedTest.status === "published" ? normalizedTest : null;
  },
});

export const getQuestions = query({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    const test = await ctx.db.get(args.testId);
    if (!test || getStatus(test as Record<string, unknown>) !== "published") {
      return [];
    }

    return getSortedQuestions(ctx, args.testId);
  },
});

export const createSampleTest = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const testId = await ctx.db.insert("tests", {
      name: "Sample Practice Test with All Question Types",
      description:
        "A comprehensive test including all question types: MCQ, True/False, Multiple Select, Matching, and Fill-in-the-Blank",
      status: "published",
      sortOrder: 0,
      updatedAt: now,
    });

    const questions = [
      {
        text: "What is the **capital** of France?",
        type: "mcq" as const,
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswers: ["Paris"],
        questionId: "q1",
      },
      {
        text: "Which of the following are **programming languages**? *(Select all that apply)*",
        type: "ms" as const,
        options: ["JavaScript", "HTML", "Python", "CSS", "Java"],
        correctAnswers: ["JavaScript", "Python", "Java"],
        questionId: "q2",
      },
      {
        text: "The Earth is `flat`.",
        type: "tf" as const,
        options: ["True", "False"],
        correctAnswers: ["False"],
        questionId: "q3",
      },
      {
        text: "Match each **country** with its *capital city*:",
        type: "matching" as const,
        options: [],
        correctAnswers: [],
        questionId: "q4",
        matchingPairs: [
          { prompt: "**United Kingdom**", answer: "London" },
          { prompt: "**Germany**", answer: "Berlin" },
          { prompt: "**Italy**", answer: "Rome" },
          { prompt: "**Spain**", answer: "Madrid" },
          { prompt: "**Japan**", answer: "Tokyo" },
        ],
      },
      {
        text: "What is the **largest planet** in our solar system?\n\n*Type your answer below:*",
        type: "fib" as const,
        options: [],
        correctAnswers: ["Jupiter", "jupiter"],
        questionId: "q5",
      },
    ];

    for (const [index, question] of questions.entries()) {
      await ctx.db.insert("questions", {
        testId,
        ...question,
        matchingPairs: question.matchingPairs,
        matchingAnswers: undefined,
        sortOrder: index,
        updatedAt: now,
      });
    }

    return testId;
  },
});

export const countTests = internalQuery({
  args: {},
  handler: async (ctx) => {
    const tests = await ctx.db.query("tests").collect();
    return tests.length;
  },
});

export const countQuestions = internalQuery({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("questions").collect();
    return questions.length;
  },
});

export const addTest = internalMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("tests", {
      name: args.name,
      description: args.description,
      status: args.status ?? "published",
      sortOrder: args.sortOrder ?? 0,
      updatedAt: Date.now(),
    });
  },
});

export const addQuestion = internalMutation({
  args: {
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
    matchingPairs: v.optional(v.array(v.object({
      prompt: v.string(),
      answer: v.string(),
    }))),
    matchingAnswers: v.optional(v.array(v.string())),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("questions", {
      testId: args.testId,
      text: args.text,
      type: args.type,
      options: args.options,
      correctAnswers: args.correctAnswers,
      questionId: args.questionId,
      matchingPairs: args.matchingPairs,
      matchingAnswers: args.matchingAnswers,
      sortOrder: args.sortOrder ?? 0,
      updatedAt: Date.now(),
    });
  },
});
