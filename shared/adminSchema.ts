import { z } from "zod";

export const questionTypeValues = [
  "mcq",
  "tf",
  "ms",
  "matching",
  "fib",
] as const;

export const testStatusValues = ["draft", "published"] as const;

export const questionTypeSchema = z.enum(questionTypeValues);
export const testStatusSchema = z.enum(testStatusValues);

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type TestStatus = z.infer<typeof testStatusSchema>;

export const matchingPairInputSchema = z.object({
  prompt: z.string(),
  answer: z.string(),
});

const baseQuestionInputSchema = z.object({
  text: z.string(),
  type: questionTypeSchema,
  options: z.array(z.string()).optional().default([]),
  correctAnswers: z.array(z.string()).optional().default([]),
  matchingPairs: z.array(matchingPairInputSchema).optional().default([]),
  matchingAnswers: z.array(z.string()).optional().default([]),
});

export const questionInputSchema = baseQuestionInputSchema.extend({
  questionId: z.string().optional(),
});

export const importQuestionSchema = baseQuestionInputSchema.extend({
  id: z.string(),
});

export const normalizedImportQuestionSchema = questionInputSchema.extend({
  questionId: z.string(),
});

export const normalizedImportTestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  questions: z.array(normalizedImportQuestionSchema),
});

export type QuestionInput = z.input<typeof questionInputSchema>;
export type MatchingPairInput = z.input<typeof matchingPairInputSchema>;
export type NormalizedQuestionInput = z.output<typeof questionInputSchema>;
export type NormalizedImportTest = z.output<typeof normalizedImportTestSchema>;
export type NormalizedImportQuestion = z.output<
  typeof normalizedImportQuestionSchema
>;

export type QuestionFieldName =
  | "questionId"
  | "text"
  | "options"
  | "correctAnswers"
  | "matchingPairs"
  | "matchingAnswers";

export interface QuestionValidationErrors {
  formErrors: string[];
  fieldErrors: Partial<Record<QuestionFieldName, string[]>>;
}

export interface ImportPreview {
  name: string;
  description: string;
  questionCount: number;
  questionBreakdown: Record<QuestionType, number>;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  tests: ImportPreview[];
  normalizedTests?: NormalizedImportTest[];
}

function trimToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }

  return result;
}

function uniqueNonEmpty(values: string[]): string[] {
  return dedupe(values.map((value) => value.trim()).filter(Boolean));
}

function canonicalTrueFalse(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return "True";
  if (normalized === "false") return "False";
  return value.trim();
}

function createQuestionValidationErrors(): QuestionValidationErrors {
  return {
    formErrors: [],
    fieldErrors: {},
  };
}

function pushFieldError(
  errors: QuestionValidationErrors,
  field: QuestionFieldName,
  message: string,
) {
  const current = errors.fieldErrors[field] ?? [];
  errors.fieldErrors[field] = [...current, message];
}

function hasQuestionValidationErrors(errors: QuestionValidationErrors): boolean {
  return (
    errors.formErrors.length > 0 ||
    Object.values(errors.fieldErrors).some((fieldErrors) => {
      return Boolean(fieldErrors && fieldErrors.length > 0);
    })
  );
}

function getBlankCount(questionText: string): number {
  return questionText.match(/_{3,}/g)?.length ?? 0;
}

export function flattenQuestionValidationErrors(
  errors: QuestionValidationErrors,
): string[] {
  return [
    ...errors.formErrors,
    ...Object.entries(errors.fieldErrors).flatMap(([field, messages]) =>
      (messages ?? []).map((message) => `${field}: ${message}`),
    ),
  ];
}

export function normalizeQuestionInput(
  input: QuestionInput,
): NormalizedQuestionInput {
  const parsed = questionInputSchema.parse(input);
  const questionId = trimToUndefined(parsed.questionId);
  const text = parsed.text.trim();
  const rawOptions = parsed.options.map((option) => option.trim());
  const rawCorrectAnswers = parsed.correctAnswers.map((answer) => answer.trim());
  const normalizedPairs = parsed.matchingPairs
    .map((pair) => ({
      prompt: pair.prompt.trim(),
      answer: pair.answer.trim(),
    }))
    .filter((pair) => pair.prompt || pair.answer);
  const matchingAnswers = uniqueNonEmpty(parsed.matchingAnswers);

  if (parsed.type === "tf") {
    return {
      questionId,
      text,
      type: parsed.type,
      options: dedupe(rawOptions.filter(Boolean).map(canonicalTrueFalse)),
      correctAnswers: dedupe(
        rawCorrectAnswers.filter(Boolean).map(canonicalTrueFalse),
      ),
      matchingPairs: [],
      matchingAnswers: [],
    };
  }

  const pairAnswers = uniqueNonEmpty(normalizedPairs.map((pair) => pair.answer));

  return {
    questionId,
    text,
    type: parsed.type,
    options: uniqueNonEmpty(rawOptions),
    correctAnswers: uniqueNonEmpty(rawCorrectAnswers),
    matchingPairs: normalizedPairs,
    matchingAnswers:
      parsed.type === "matching"
        ? dedupe([...pairAnswers, ...matchingAnswers])
        : [],
  };
}

export function validateNormalizedQuestionInput(
  normalized: NormalizedQuestionInput,
  original?: QuestionInput,
): QuestionValidationErrors {
  const errors = createQuestionValidationErrors();

  if (!normalized.text) {
    pushFieldError(errors, "text", "Question text is required.");
  }

  if (normalized.questionId && !/^[A-Za-z0-9_-]+$/.test(normalized.questionId)) {
    pushFieldError(
      errors,
      "questionId",
      "Question ID may only include letters, numbers, hyphens, and underscores.",
    );
  }

  const originalOptions = (original?.options ?? [])
    .map((option) => option.trim())
    .filter(Boolean);
  if (originalOptions.length !== dedupe(originalOptions).length) {
    pushFieldError(errors, "options", "Options must be unique.");
  }

  const originalAnswers = (original?.correctAnswers ?? [])
    .map((answer) => answer.trim())
    .filter(Boolean);
  if (originalAnswers.length !== dedupe(originalAnswers).length) {
    pushFieldError(errors, "correctAnswers", "Correct answers must be unique.");
  }

  switch (normalized.type) {
    case "mcq":
      if (normalized.options.length < 2) {
        pushFieldError(errors, "options", "Add at least 2 options.");
      }
      if (normalized.correctAnswers.length !== 1) {
        pushFieldError(
          errors,
          "correctAnswers",
          "Multiple choice questions must have exactly 1 correct answer.",
        );
      }
      if (
        normalized.correctAnswers.some(
          (answer) => !normalized.options.includes(answer),
        )
      ) {
        pushFieldError(
          errors,
          "correctAnswers",
          "The correct answer must match one of the options.",
        );
      }
      break;
    case "tf":
      if (
        normalized.options.length !== 2 ||
        normalized.options[0] !== "True" ||
        normalized.options[1] !== "False"
      ) {
        pushFieldError(
          errors,
          "options",
          'True/False questions must use exactly ["True", "False"].',
        );
      }
      if (
        normalized.correctAnswers.length !== 1 ||
        !["True", "False"].includes(normalized.correctAnswers[0] ?? "")
      ) {
        pushFieldError(
          errors,
          "correctAnswers",
          'True/False questions must have exactly 1 correct answer: "True" or "False".',
        );
      }
      break;
    case "ms":
      if (normalized.options.length < 2) {
        pushFieldError(errors, "options", "Add at least 2 options.");
      }
      if (normalized.correctAnswers.length < 1) {
        pushFieldError(
          errors,
          "correctAnswers",
          "Select at least 1 correct answer.",
        );
      }
      if (
        normalized.correctAnswers.some(
          (answer) => !normalized.options.includes(answer),
        )
      ) {
        pushFieldError(
          errors,
          "correctAnswers",
          "Every correct answer must match one of the options.",
        );
      }
      break;
    case "matching": {
      const incompletePairs = normalized.matchingPairs.filter(
        (pair) => !pair.prompt || !pair.answer,
      );
      if (incompletePairs.length > 0) {
        pushFieldError(
          errors,
          "matchingPairs",
          "Each matching pair needs both a prompt and an answer.",
        );
      }
      const completePairs = normalized.matchingPairs.filter(
        (pair) => pair.prompt && pair.answer,
      );
      if (completePairs.length < 2) {
        pushFieldError(
          errors,
          "matchingPairs",
          "Add at least 2 complete matching pairs.",
        );
      }
      const correctPairAnswers = uniqueNonEmpty(
        completePairs.map((pair) => pair.answer),
      );
      const missingAnswers = correctPairAnswers.filter(
        (answer) => !normalized.matchingAnswers.includes(answer),
      );
      if (missingAnswers.length > 0) {
        pushFieldError(
          errors,
          "matchingAnswers",
          "Matching answers must include every answer used in the pairs.",
        );
      }
      break;
    }
    case "fib": {
      if (normalized.correctAnswers.length < 1) {
        pushFieldError(
          errors,
          "correctAnswers",
          "Provide at least 1 accepted answer.",
        );
      }
      const blankCount = getBlankCount(normalized.text);
      if (blankCount > 1 && normalized.correctAnswers.length < blankCount) {
        pushFieldError(
          errors,
          "correctAnswers",
          `This question has ${blankCount} blanks but only ${normalized.correctAnswers.length} answers.`,
        );
      }
      break;
    }
  }

  return errors;
}

export function parseQuestionInput(
  input: unknown,
):
  | { success: true; data: NormalizedQuestionInput }
  | { success: false; errors: QuestionValidationErrors } {
  const parsed = questionInputSchema.safeParse(input);
  if (!parsed.success) {
    const errors = createQuestionValidationErrors();
    for (const issue of parsed.error.issues) {
      const field = (issue.path[0] as QuestionFieldName | undefined) ?? "text";
      pushFieldError(errors, field, issue.message);
    }
    return { success: false, errors };
  }

  const normalized = normalizeQuestionInput(parsed.data);
  const validationErrors = validateNormalizedQuestionInput(
    normalized,
    parsed.data,
  );

  if (hasQuestionValidationErrors(validationErrors)) {
    return { success: false, errors: validationErrors };
  }

  return {
    success: true,
    data: normalized,
  };
}

function normalizeTestDescription(description: string | undefined): string | undefined {
  return trimToUndefined(description);
}

function createQuestionBreakdown(
  questions: NormalizedImportQuestion[],
): Record<QuestionType, number> {
  return questions.reduce(
    (accumulator, question) => {
      accumulator[question.type] += 1;
      return accumulator;
    },
    {
      mcq: 0,
      tf: 0,
      ms: 0,
      matching: 0,
      fib: 0,
    } as Record<QuestionType, number>,
  );
}

function parseImportQuestion(
  rawQuestion: unknown,
  testLabel: string,
  questionIndex: number,
):
  | { success: true; data: NormalizedImportQuestion }
  | { success: false; errors: string[] } {
  const parsed = importQuestionSchema.safeParse(rawQuestion);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => {
        const field = issue.path.join(".") || "question";
        return `${testLabel}, question ${questionIndex + 1}, ${field}: ${issue.message}`;
      }),
    };
  }

  const result = parseQuestionInput({
    ...parsed.data,
    questionId: parsed.data.id,
  });

  if (!result.success) {
    return {
      success: false,
      errors: flattenQuestionValidationErrors(result.errors).map((message) => {
        return `${testLabel}, question ${questionIndex + 1}: ${message}`;
      }),
    };
  }

  return {
    success: true,
    data: {
      ...result.data,
      questionId: result.data.questionId ?? parsed.data.id.trim(),
    },
  };
}

export function parseImportJson(jsonData: string): ImportValidationResult {
  let data: unknown;
  try {
    data = JSON.parse(jsonData);
  } catch (error) {
    return {
      valid: false,
      errors: [
        `Invalid JSON: ${error instanceof Error ? error.message : "Unknown parse error"}`,
      ],
      tests: [],
    };
  }

  const rawTests = Array.isArray(data) ? data : [data];
  if (rawTests.length === 0) {
    return {
      valid: false,
      errors: ["No tests found in JSON."],
      tests: [],
    };
  }

  const normalizedTests: NormalizedImportTest[] = [];
  const previews: ImportPreview[] = [];
  const errors: string[] = [];

  rawTests.forEach((rawTest, testIndex) => {
    const testSchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      questions: z.array(z.unknown()),
    });
    const parsedTest = testSchema.safeParse(rawTest);
    const testLabel = `Test ${testIndex + 1}`;

    if (!parsedTest.success) {
      errors.push(
        ...parsedTest.error.issues.map((issue) => {
          const field = issue.path.join(".") || "test";
          return `${testLabel}, ${field}: ${issue.message}`;
        }),
      );
      return;
    }

    const name = parsedTest.data.name.trim();
    if (!name) {
      errors.push(`${testLabel}: name is required.`);
    }

    if (parsedTest.data.questions.length === 0) {
      errors.push(`${testLabel}: add at least 1 question.`);
    }

    const normalizedQuestions: NormalizedImportQuestion[] = [];
    parsedTest.data.questions.forEach((rawQuestion, questionIndex) => {
      const questionResult = parseImportQuestion(
        rawQuestion,
        testLabel,
        questionIndex,
      );
      if (!questionResult.success) {
        errors.push(...questionResult.errors);
        return;
      }

      normalizedQuestions.push(questionResult.data);
    });

    const questionIds = normalizedQuestions.map((question) => question.questionId);
    if (questionIds.length !== new Set(questionIds).size) {
      errors.push(
        `${testLabel}: question ids must be unique within a test.`,
      );
    }

    if (!name || normalizedQuestions.length === 0) {
      return;
    }

    const normalizedTest: NormalizedImportTest = {
      name,
      description: normalizeTestDescription(parsedTest.data.description),
      questions: normalizedQuestions,
    };

    normalizedTests.push(normalizedTest);
    previews.push({
      name,
      description: normalizedTest.description ?? "",
      questionCount: normalizedQuestions.length,
      questionBreakdown: createQuestionBreakdown(normalizedQuestions),
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    tests: previews,
    normalizedTests: errors.length === 0 ? normalizedTests : undefined,
  };
}
