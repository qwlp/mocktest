import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import {
  normalizedImportTestSchema,
  parseImportJson,
  parseQuestionInput,
  testStatusSchema,
  type NormalizedImportTest,
  type QuestionInput,
} from "../shared/adminSchema";

const ADMIN_PASSWORD = "admin123";

const questionTypeValidator = v.union(
  v.literal("mcq"),
  v.literal("tf"),
  v.literal("ms"),
  v.literal("matching"),
  v.literal("fib"),
);

const statusValidator = v.union(v.literal("draft"), v.literal("published"));

const matchingPairValidator = v.object({
  prompt: v.string(),
  answer: v.string(),
});

const questionInputValidator = v.object({
  questionId: v.optional(v.string()),
  text: v.string(),
  type: questionTypeValidator,
  options: v.optional(v.array(v.string())),
  correctAnswers: v.array(v.string()),
  matchingPairs: v.optional(v.array(matchingPairValidator)),
  matchingAnswers: v.optional(v.array(v.string())),
});

const normalizedImportTestValidator = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  questions: v.array(
    v.object({
      questionId: v.string(),
      text: v.string(),
      type: questionTypeValidator,
      options: v.optional(v.array(v.string())),
      correctAnswers: v.array(v.string()),
      matchingPairs: v.optional(v.array(matchingPairValidator)),
      matchingAnswers: v.optional(v.array(v.string())),
    }),
  ),
});

function readOptionalString(
  document: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = document[key];
  return typeof value === "string" ? value : undefined;
}

function readOptionalNumber(
  document: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = document[key];
  return typeof value === "number" ? value : undefined;
}

function getTestStatus(test: Record<string, unknown>): "draft" | "published" {
  return readOptionalString(test, "status") === "draft" ? "draft" : "published";
}

function getTestSortOrder(
  test: { _creationTime: number } & Record<string, unknown>,
  fallback: number,
): number {
  return readOptionalNumber(test, "sortOrder") ?? fallback;
}

function getQuestionSortOrder(
  question: { _creationTime: number } & Record<string, unknown>,
  fallback: number,
): number {
  return readOptionalNumber(question, "sortOrder") ?? fallback;
}

function getUpdatedAt(
  document: { _creationTime: number } & Record<string, unknown>,
): number {
  return readOptionalNumber(document, "updatedAt") ?? document._creationTime;
}

async function getAllTests(ctx: QueryCtx | MutationCtx) {
  const tests = await ctx.db.query("tests").collect();
  return tests
    .map((test, index) => ({
      ...test,
      status: getTestStatus(test),
      sortOrder: getTestSortOrder(test, index),
      updatedAt: getUpdatedAt(test),
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

async function getQuestionsForTest(
  ctx: QueryCtx | MutationCtx,
  testId: Id<"tests">,
) {
  const questions = await ctx.db
    .query("questions")
    .withIndex("by_testId", (query) => query.eq("testId", testId))
    .collect();

  return questions
    .map((question, index) => ({
      ...question,
      sortOrder: getQuestionSortOrder(question, index),
      updatedAt: getUpdatedAt(question),
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

async function backfillAdminDataShape(ctx: MutationCtx) {
  const now = Date.now();
  const tests = await ctx.db.query("tests").collect();
  const sortedTests = [...tests].sort(
    (left, right) => left._creationTime - right._creationTime,
  );

  for (const [index, test] of sortedTests.entries()) {
    const record = test as Record<string, unknown>;
    const patch: Partial<{
      status: "draft" | "published";
      sortOrder: number;
      updatedAt: number;
    }> = {};

    if (readOptionalString(record, "status") !== "draft" && readOptionalString(record, "status") !== "published") {
      patch.status = "published";
    }
    if (readOptionalNumber(record, "sortOrder") === undefined) {
      patch.sortOrder = index;
    }
    if (readOptionalNumber(record, "updatedAt") === undefined) {
      patch.updatedAt = now;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(test._id, patch);
    }
  }

  for (const test of sortedTests) {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_testId", (query) => query.eq("testId", test._id))
      .collect();
    const sortedQuestions = [...questions].sort(
      (left, right) => left._creationTime - right._creationTime,
    );

    for (const [index, question] of sortedQuestions.entries()) {
      const record = question as Record<string, unknown>;
      const patch: Partial<{
        sortOrder: number;
        updatedAt: number;
      }> = {};

      if (readOptionalNumber(record, "sortOrder") === undefined) {
        patch.sortOrder = index;
      }
      if (readOptionalNumber(record, "updatedAt") === undefined) {
        patch.updatedAt = now;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(question._id, patch);
      }
    }
  }
}

async function ensureUniqueQuestionId(
  ctx: QueryCtx | MutationCtx,
  testId: Id<"tests">,
  questionId: string,
  excludeQuestionId?: Id<"questions">,
) {
  const existingQuestions = await ctx.db
    .query("questions")
    .withIndex("by_testId", (query) => query.eq("testId", testId))
    .collect();

  const conflict = existingQuestions.find((question) => {
    return question.questionId === questionId && question._id !== excludeQuestionId;
  });

  if (conflict) {
    throw new Error(`Question ID "${questionId}" already exists in this test.`);
  }
}

async function generateQuestionId(
  ctx: QueryCtx | MutationCtx,
  testId: Id<"tests">,
) {
  const existingQuestions = await ctx.db
    .query("questions")
    .withIndex("by_testId", (query) => query.eq("testId", testId))
    .collect();

  const existingIds = new Set(existingQuestions.map((question) => question.questionId));
  let nextNumber = 1;
  while (existingIds.has(`q${nextNumber}`)) {
    nextNumber += 1;
  }
  return `q${nextNumber}`;
}

async function normalizeQuestionForWrite(
  testId: Id<"tests">,
  input: QuestionInput,
  ctx: QueryCtx | MutationCtx,
  existingQuestionId?: Id<"questions">,
  fallbackQuestionId?: string,
) {
  const parsed = parseQuestionInput(input);
  if (!parsed.success) {
    throw new Error(
      Object.values(parsed.errors.fieldErrors)
        .flatMap((messages) => messages ?? [])
        .concat(parsed.errors.formErrors)
        .join(" "),
    );
  }

  const normalized = parsed.data;
  const questionId =
    normalized.questionId ?? fallbackQuestionId ?? (await generateQuestionId(ctx, testId));
  await ensureUniqueQuestionId(ctx, testId, questionId, existingQuestionId);

  return {
    ...normalized,
    questionId,
  };
}

function requireAdminPassword(password: string | undefined) {
  if (password !== ADMIN_PASSWORD) {
    throw new Error("Invalid admin password.");
  }
}

export const getAdminAccess = query({
  args: {
    adminPassword: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    return {
      isAdmin: args.adminPassword === ADMIN_PASSWORD,
      canBootstrap: false,
      email: "Hard-coded admin",
    };
  },
});

export const verifyAdminPassword = mutation({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const isValid = args.password === ADMIN_PASSWORD;
    if (isValid) {
      await backfillAdminDataShape(ctx);
    }
    return isValid;
  },
});

export const ensureAdminData = mutation({
  args: {
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);
    return { success: true };
  },
});

export const getAdminTests = query({
  args: {
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    const tests = await getAllTests(ctx);

    return Promise.all(
      tests.map(async (test) => {
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

export const getFolders = query({
  args: { adminPassword: v.string() },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    const folders = await ctx.db.query("folders").collect();
    return folders.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  },
});

export const createFolder = mutation({
  args: {
    adminPassword: v.string(),
    name: v.string(),
    parentId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    const name = args.name.trim();
    if (!name) throw new Error("Folder name is required.");
    if (args.parentId && !(await ctx.db.get(args.parentId))) {
      throw new Error("Parent folder not found.");
    }
    const siblings = await ctx.db
      .query("folders")
      .withIndex("by_parentId", (q) => q.eq("parentId", args.parentId))
      .collect();
    if (siblings.some((folder) => folder.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("A folder with that name already exists here.");
    }
    return ctx.db.insert("folders", {
      name,
      parentId: args.parentId,
      sortOrder: siblings.length,
      updatedAt: Date.now(),
    });
  },
});

export const renameFolder = mutation({
  args: { adminPassword: v.string(), folderId: v.id("folders"), name: v.string() },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    const folder = await ctx.db.get(args.folderId);
    if (!folder) throw new Error("Folder not found.");
    const name = args.name.trim();
    if (!name) throw new Error("Folder name is required.");
    const siblings = await ctx.db
      .query("folders")
      .withIndex("by_parentId", (q) => q.eq("parentId", folder.parentId))
      .collect();
    if (siblings.some((item) => item._id !== args.folderId && item.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("A folder with that name already exists here.");
    }
    await ctx.db.patch(args.folderId, { name, updatedAt: Date.now() });
  },
});

export const deleteFolder = mutation({
  args: { adminPassword: v.string(), folderId: v.id("folders") },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    if (!(await ctx.db.get(args.folderId))) throw new Error("Folder not found.");
    const children = await ctx.db.query("folders").withIndex("by_parentId", (q) => q.eq("parentId", args.folderId)).take(1);
    const tests = await ctx.db.query("tests").withIndex("by_folderId", (q) => q.eq("folderId", args.folderId)).take(1);
    if (children.length || tests.length) throw new Error("Move or delete everything in this folder first.");
    await ctx.db.delete(args.folderId);
  },
});

export const moveTestToFolder = mutation({
  args: {
    adminPassword: v.string(),
    testId: v.id("tests"),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    if (!(await ctx.db.get(args.testId))) throw new Error("Test not found.");
    if (args.folderId && !(await ctx.db.get(args.folderId))) throw new Error("Folder not found.");
    await ctx.db.patch(args.testId, { folderId: args.folderId, updatedAt: Date.now() });
  },
});

export const getTestEditor = query({
  args: {
    adminPassword: v.string(),
    testId: v.id("tests"),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found.");
    }

    const questions = await getQuestionsForTest(ctx, args.testId);

    return {
      test: {
        ...test,
        status: getTestStatus(test),
        sortOrder: getTestSortOrder(test, 0),
        updatedAt: getUpdatedAt(test),
      },
      questions,
    };
  },
});

export const createTestDraft = mutation({
  args: {
    adminPassword: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);

    const name = args.name.trim();
    if (!name) {
      throw new Error("Test name is required.");
    }
    if (args.folderId && !(await ctx.db.get(args.folderId))) {
      throw new Error("Folder not found.");
    }

    const tests = await getAllTests(ctx);
    const sortOrder =
      tests.length === 0
        ? 0
        : Math.max(...tests.map((test) => test.sortOrder)) + 1;
    const now = Date.now();

    return ctx.db.insert("tests", {
      name,
      description: args.description?.trim() || undefined,
      status: "draft",
      sortOrder,
      updatedAt: now,
      folderId: args.folderId,
    });
  },
});

export const updateTestDetails = mutation({
  args: {
    adminPassword: v.string(),
    testId: v.id("tests"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);

    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found.");
    }

    const name = args.name.trim();
    if (!name) {
      throw new Error("Test name is required.");
    }

    await ctx.db.patch(args.testId, {
      name,
      description: args.description?.trim() || undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const setTestStatus = mutation({
  args: {
    adminPassword: v.string(),
    testId: v.id("tests"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);

    const parsedStatus = testStatusSchema.parse(args.status);
    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found.");
    }

    await ctx.db.patch(args.testId, {
      status: parsedStatus,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const publishTestsBulk = mutation({
  args: {
    adminPassword: v.string(),
    testIds: v.array(v.id("tests")),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);

    const testIds = [...new Set(args.testIds)];
    if (testIds.length === 0) {
      throw new Error("Select at least one test to publish.");
    }

    const tests = await Promise.all(testIds.map((testId) => ctx.db.get(testId)));
    if (tests.some((test) => !test)) {
      throw new Error("One or more selected tests were not found.");
    }

    const updatedAt = Date.now();
    await Promise.all(
      testIds.map((testId) =>
        ctx.db.patch(testId, { status: "published", updatedAt }),
      ),
    );

    return { success: true, publishedCount: testIds.length };
  },
});

export const deleteTestCascade = mutation({
  args: {
    adminPassword: v.string(),
    testId: v.id("tests"),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);

    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found.");
    }

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_testId", (query) => query.eq("testId", args.testId))
      .collect();

    for (const question of questions) {
      await ctx.db.delete(question._id);
    }

    await ctx.db.delete(args.testId);
    return { success: true };
  },
});

export const createQuestion = mutation({
  args: {
    adminPassword: v.string(),
    testId: v.id("tests"),
    input: questionInputValidator,
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);

    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found.");
    }

    const normalized = await normalizeQuestionForWrite(
      args.testId,
      args.input,
      ctx,
    );
    const questions = await getQuestionsForTest(ctx, args.testId);
    const sortOrder =
      questions.length === 0
        ? 0
        : Math.max(...questions.map((question) => question.sortOrder)) + 1;
    const now = Date.now();

    const questionId = await ctx.db.insert("questions", {
      testId: args.testId,
      questionId: normalized.questionId,
      text: normalized.text,
      type: normalized.type,
      options: normalized.options ?? [],
      correctAnswers: normalized.correctAnswers,
      matchingPairs:
        normalized.matchingPairs.length > 0 ? normalized.matchingPairs : undefined,
      matchingAnswers:
        normalized.matchingAnswers.length > 0
          ? normalized.matchingAnswers
          : undefined,
      sortOrder,
      updatedAt: now,
    });

    await ctx.db.patch(args.testId, { updatedAt: now });

    return questionId;
  },
});

export const updateQuestion = mutation({
  args: {
    adminPassword: v.string(),
    questionId: v.id("questions"),
    input: questionInputValidator,
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);

    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found.");
    }

    const normalized = await normalizeQuestionForWrite(
      question.testId,
      args.input,
      ctx,
      question._id,
      question.questionId,
    );
    const now = Date.now();

    await ctx.db.patch(args.questionId, {
      questionId: normalized.questionId,
      text: normalized.text,
      type: normalized.type,
      options: normalized.options ?? [],
      correctAnswers: normalized.correctAnswers,
      matchingPairs:
        normalized.matchingPairs.length > 0 ? normalized.matchingPairs : undefined,
      matchingAnswers:
        normalized.matchingAnswers.length > 0
          ? normalized.matchingAnswers
          : undefined,
      updatedAt: now,
    });

    await ctx.db.patch(question.testId, { updatedAt: now });

    return { success: true };
  },
});

export const duplicateQuestion = mutation({
  args: {
    adminPassword: v.string(),
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);

    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found.");
    }

    const questions = await getQuestionsForTest(ctx, question.testId);
    const sourceIndex = questions.findIndex(
      (currentQuestion) => currentQuestion._id === args.questionId,
    );
    if (sourceIndex === -1) {
      throw new Error("Question not found in its test.");
    }

    const now = Date.now();
    for (let index = sourceIndex + 1; index < questions.length; index += 1) {
      await ctx.db.patch(questions[index]._id, {
        sortOrder: questions[index].sortOrder + 1,
        updatedAt: now,
      });
    }

    const duplicatedQuestionId = await generateQuestionId(ctx, question.testId);
    const newQuestionId = await ctx.db.insert("questions", {
      testId: question.testId,
      questionId: duplicatedQuestionId,
      text: `${question.text} (Copy)`,
      type: question.type,
      options: question.options,
      correctAnswers: question.correctAnswers,
      matchingPairs: question.matchingPairs,
      matchingAnswers: question.matchingAnswers,
      sortOrder: questions[sourceIndex].sortOrder + 1,
      updatedAt: now,
    });

    await ctx.db.patch(question.testId, { updatedAt: now });

    return newQuestionId;
  },
});

export const deleteQuestionsBulk = mutation({
  args: {
    adminPassword: v.string(),
    testId: v.id("tests"),
    questionIds: v.array(v.id("questions")),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);

    if (args.questionIds.length === 0) {
      throw new Error("Select at least one question to delete.");
    }

    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found.");
    }

    const questions = await getQuestionsForTest(ctx, args.testId);
    const selectedIds = new Set(args.questionIds);

    if (questions.filter((question) => selectedIds.has(question._id)).length !== selectedIds.size) {
      throw new Error("One or more selected questions do not belong to this test.");
    }

    const remainingQuestions = questions.filter(
      (question) => !selectedIds.has(question._id),
    );

    for (const questionId of args.questionIds) {
      await ctx.db.delete(questionId);
    }

    const now = Date.now();
    for (const [index, question] of remainingQuestions.entries()) {
      await ctx.db.patch(question._id, {
        sortOrder: index,
        updatedAt: now,
      });
    }

    await ctx.db.patch(args.testId, { updatedAt: now });

    return { success: true };
  },
});

export const reorderQuestions = mutation({
  args: {
    adminPassword: v.string(),
    testId: v.id("tests"),
    orderedQuestionIds: v.array(v.id("questions")),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);

    const questions = await getQuestionsForTest(ctx, args.testId);
    if (questions.length !== args.orderedQuestionIds.length) {
      throw new Error("Question reorder payload is incomplete.");
    }

    const currentIds = new Set(questions.map((question) => question._id));
    const orderedIds = new Set(args.orderedQuestionIds);
    if (currentIds.size !== orderedIds.size) {
      throw new Error("Question reorder payload contains duplicate IDs.");
    }

    for (const questionId of args.orderedQuestionIds) {
      if (!currentIds.has(questionId)) {
        throw new Error("Question reorder payload contains an invalid question.");
      }
    }

    const now = Date.now();
    for (const [index, questionId] of args.orderedQuestionIds.entries()) {
      await ctx.db.patch(questionId, {
        sortOrder: index,
        updatedAt: now,
      });
    }

    await ctx.db.patch(args.testId, { updatedAt: now });

    return { success: true };
  },
});

export const previewImport = mutation({
  args: {
    adminPassword: v.string(),
    jsonData: v.string(),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    return parseImportJson(args.jsonData);
  },
});

function validateNormalizedImportTests(
  normalizedTests: Array<{
    name: string;
    description?: string;
    questions: Array<QuestionInput & { questionId: string }>;
  }>,
) {
  const errors: string[] = [];
  const parsedTests: NormalizedImportTest[] = [];

  normalizedTests.forEach((test, testIndex) => {
    const questionIds = test.questions.map((question) => question.questionId.trim());
    if (questionIds.length !== new Set(questionIds).size) {
      errors.push(`Test ${testIndex + 1}: question ids must be unique.`);
    }

    const parsedQuestions: NormalizedImportTest["questions"] = [];
    test.questions.forEach((question, questionIndex) => {
      const questionResult = parseQuestionInput(question);
      if (!questionResult.success) {
        errors.push(
          ...Object.values(questionResult.errors.fieldErrors)
            .flatMap((messages) => messages ?? [])
            .map(
              (message) =>
                `Test ${testIndex + 1}, question ${questionIndex + 1}: ${message}`,
            ),
        );
        return;
      }

      parsedQuestions.push({
        ...questionResult.data,
        questionId: question.questionId.trim(),
      });
    });

    const schemaResult = normalizedImportTestSchema.safeParse({
      name: test.name.trim(),
      description: test.description?.trim() || undefined,
      questions: parsedQuestions,
    });
    if (!schemaResult.success) {
      errors.push(
        ...schemaResult.error.issues.map((issue) => {
          const field = issue.path.join(".") || "test";
          return `Test ${testIndex + 1}, ${field}: ${issue.message}`;
        }),
      );
      return;
    }

    parsedTests.push(schemaResult.data);
  });

  return {
    errors,
    tests: parsedTests,
  };
}

export const importTests = mutation({
  args: {
    adminPassword: v.string(),
    normalizedTests: v.array(normalizedImportTestValidator),
    publishMode: statusValidator,
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    requireAdminPassword(args.adminPassword);
    await backfillAdminDataShape(ctx);

    if (args.folderId && !(await ctx.db.get(args.folderId))) {
      throw new Error("Folder not found.");
    }

    const validation = validateNormalizedImportTests(args.normalizedTests);
    if (validation.errors.length > 0) {
      throw new Error(validation.errors.join(" "));
    }

    const existingTests = await getAllTests(ctx);
    let nextSortOrder =
      existingTests.length === 0
        ? 0
        : Math.max(...existingTests.map((test) => test.sortOrder)) + 1;
    const now = Date.now();

    for (const test of validation.tests) {
      const testId = await ctx.db.insert("tests", {
        name: test.name.trim(),
        description: test.description?.trim() || undefined,
        status: args.publishMode,
        sortOrder: nextSortOrder,
        updatedAt: now,
        folderId: args.folderId,
      });

      for (const [index, question] of test.questions.entries()) {
        await ctx.db.insert("questions", {
          testId,
          questionId: question.questionId,
          text: question.text.trim(),
          type: question.type,
          options: question.options ?? [],
          correctAnswers: question.correctAnswers,
          matchingPairs:
            question.matchingPairs && question.matchingPairs.length > 0
              ? question.matchingPairs
              : undefined,
          matchingAnswers:
            question.matchingAnswers && question.matchingAnswers.length > 0
              ? question.matchingAnswers
              : undefined,
          sortOrder: index,
          updatedAt: now,
        });
      }

      nextSortOrder += 1;
    }

    return {
      success: true,
      importedCount: validation.tests.length,
    };
  },
});
