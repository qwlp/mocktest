import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getTests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tests").collect();
  },
});

export const getTest = query({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.testId);
  },
});

export const getQuestions = query({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_testId", (q) => q.eq("testId", args.testId))
      .collect();
  },
});

export const createSampleTest = mutation({
  args: {},
  handler: async (ctx) => {
    // Create a test
    const testId = await ctx.db.insert("tests", {
      name: "Sample Practice Test with All Question Types",
      description: "A comprehensive test including all question types: MCQ, True/False, Multiple Select, Matching, and Fill-in-the-Blank"
    });

    // Create sample questions including all types
    const questions = [
      {
        testId,
        text: "What is the **capital** of France?",
        type: "mcq" as const,
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswers: ["Paris"],
        questionId: "q1",
      },
      {
        testId,
        text: "Which of the following are **programming languages**? *(Select all that apply)*",
        type: "ms" as const,
        options: ["JavaScript", "HTML", "Python", "CSS", "Java"],
        correctAnswers: ["JavaScript", "Python", "Java"],
        questionId: "q2",
      },
      {
        testId,
        text: "The Earth is `flat`.",
        type: "tf" as const,
        options: ["True", "False"],
        correctAnswers: ["False"],
        questionId: "q3",
      },
      {
        testId,
        text: "Match each **country** with its *capital city*:",
        type: "matching" as const,
        options: [], // Not used for matching questions
        correctAnswers: [], // Not used for matching questions
        questionId: "q4",
        matchingPairs: [
          { prompt: "**United Kingdom**", answer: "London" },
          { prompt: "**Germany**", answer: "Berlin" },
          { prompt: "**Italy**", answer: "Rome" },
          { prompt: "**Spain**", answer: "Madrid" },
          { prompt: "**Japan**", answer: "Tokyo" }
        ]
      },
      {
        testId,
        text: "Match each programming concept with its description:\n\n*Drag and drop to match the concepts with their definitions.*",
        type: "matching" as const,
        options: [],
        correctAnswers: [],
        questionId: "q5",
        matchingPairs: [
          { prompt: "`Variable`", answer: "A **container** for storing data values" },
          { prompt: "`Function`", answer: "A *reusable* block of code that performs a specific task" },
          { prompt: "`Loop`", answer: "A programming construct that **repeats** a block of code" },
          { prompt: "`Array`", answer: "A data structure that holds *multiple values* in a single variable" }
        ]
      },
      {
        testId,
        text: "What is the **largest planet** in our solar system?\n\n*Type your answer below:*",
        type: "fib" as const,
        options: [], // Not used for fill-in-the-blank questions
        correctAnswers: ["Jupiter", "jupiter"], // Multiple acceptable answers
        questionId: "q6",
      },
      {
        testId,
        text: "Complete the sentence: The **chemical symbol** for water is ___.",
        type: "fib" as const,
        options: [],
        correctAnswers: ["H2O", "h2o", "H₂O"], // Multiple formats accepted
        questionId: "q7",
      },
      {
        testId,
        text: "What programming language was created by **Guido van Rossum**?\n\n*Hint: It's named after a British comedy group.*",
        type: "fib" as const,
        options: [],
        correctAnswers: ["Python", "python"],
        questionId: "q8",
      },
      {
        testId,
        text: "Based on the following comparison table, which programming language is **statically typed**?\n\n| Language | Typing | Compilation |\n|----------|--------|-------------|\n| JavaScript | Dynamic | Interpreted |\n| Python | Dynamic | Interpreted |\n| Java | **Static** | Compiled |\n| C++ | **Static** | Compiled |",
        type: "mcq" as const,
        options: ["JavaScript", "Python", "Java", "All of the above"],
        correctAnswers: ["Java"],
        questionId: "q9",
      }
    ];

    for (const question of questions) {
      await ctx.db.insert("questions", question);
    }

    return testId;
  },
});

// Internal functions for seeding
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tests", {
      name: args.name,
      description: args.description,
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
      v.literal("fib")
    ),
    options: v.array(v.string()),
    correctAnswers: v.array(v.string()),
    questionId: v.string(),
    matchingPairs: v.optional(v.array(v.object({
      prompt: v.string(),
      answer: v.string()
    }))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("questions", {
      testId: args.testId,
      text: args.text,
      type: args.type,
      options: args.options,
      correctAnswers: args.correctAnswers,
      questionId: args.questionId,
      matchingPairs: args.matchingPairs,
    });
  },
});
