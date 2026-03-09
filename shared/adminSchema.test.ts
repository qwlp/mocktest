import { describe, expect, it } from "vitest";
import { parseImportJson, parseQuestionInput } from "./adminSchema";

describe("parseQuestionInput", () => {
  it("normalizes matching answers and trims values", () => {
    const result = parseQuestionInput({
      text: "Match the capitals",
      type: "matching",
      options: [],
      correctAnswers: [],
      matchingPairs: [
        { prompt: "France ", answer: " Paris" },
        { prompt: "Germany", answer: "Berlin" },
      ],
      matchingAnswers: ["Rome", "Paris", " "],
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.matchingAnswers).toEqual(["Paris", "Berlin", "Rome"]);
  });

  it("rejects duplicate options for multiple choice questions", () => {
    const result = parseQuestionInput({
      text: "Pick the right answer",
      type: "mcq",
      options: ["A", "A", "B"],
      correctAnswers: ["A"],
      matchingPairs: [],
      matchingAnswers: [],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.errors.fieldErrors.options?.[0]).toContain("unique");
  });
});

describe("parseImportJson", () => {
  it("accepts valid import JSON and preserves question ids", () => {
    const result = parseImportJson(
      JSON.stringify({
        name: "Sample Test",
        description: "A draft import",
        questions: [
          {
            id: "q1",
            text: "True or false?",
            type: "tf",
            options: ["True", "False"],
            correctAnswers: ["True"],
          },
        ],
      }),
    );

    expect(result.valid).toBe(true);
    expect(result.normalizedTests?.[0]?.questions[0]?.questionId).toBe("q1");
  });

  it("rejects duplicate question ids inside one test", () => {
    const result = parseImportJson(
      JSON.stringify({
        name: "Broken Test",
        questions: [
          {
            id: "dup",
            text: "Question one",
            type: "mcq",
            options: ["A", "B"],
            correctAnswers: ["A"],
          },
          {
            id: "dup",
            text: "Question two",
            type: "mcq",
            options: ["A", "B"],
            correctAnswers: ["B"],
          },
        ],
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("question ids must be unique"))).toBe(true);
  });
});
