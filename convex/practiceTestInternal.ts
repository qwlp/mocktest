"use node";
import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const testsJsonContent = [
  {
    name: "General Knowledge Quiz",
    description: "A quick quiz to test your general knowledge.",
    questions: [
      {
        "id": "gk_q1",
        "text": "What is the capital of France?",
        "type": "mcq",
        "options": ["Berlin", "Madrid", "Paris", "Rome"],
        "correctAnswers": ["Paris"]
      },
      {
        "id": "gk_q2",
        "text": "The Earth is flat.",
        "type": "tf",
        "options": ["True", "False"],
        "correctAnswers": ["False"]
      },
      {
        "id": "gk_q3",
        "text": "What is the highest mountain in the world?",
        "type": "mcq",
        "options": ["K2", "Mount Everest", "Kangchenjunga", "Lhotse"],
        "correctAnswers": ["Mount Everest"]
      },
      {
        "id": "gk_q4",
        "text": "What is the largest ocean on Earth?",
        "type": "fib",
        "options": [],
        "correctAnswers": ["Pacific Ocean", "Pacific", "pacific ocean", "pacific"]
      }
    ]
  },
  {
    name: "Tech Trivia",
    description: "Test your knowledge about technology.",
    questions: [
      {
        "id": "tech_q1",
        "text": "HTML stands for HyperText Markup Language.",
        "type": "tf",
        "options": ["True", "False"],
        "correctAnswers": ["True"]
      },
      {
        "id": "tech_q2",
        "text": "Choose all true statements about Java constructors:",
        "type": "ms",
        "options": [
          "Constructors have the same name as the class.",
          "Constructors can return a value.",
          "A class can have multiple constructors."
        ],
        "correctAnswers": [
          "Constructors have the same name as the class.",
          "A class can have multiple constructors."
        ]
      },
      {
        "id": "tech_q3",
        "text": "Which of the following are primary colors (in additive color model)?",
        "type": "ms",
        "options": ["Red", "Green", "Blue", "Yellow"],
        "correctAnswers": ["Red", "Green", "Blue"]
      },
      {
        "id": "tech_q4",
        "text": "What does CPU stand for?",
        "type": "mcq",
        "options": ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Control Processing Unit"],
        "correctAnswers": ["Central Processing Unit"]
      },
      {
        "id": "tech_q5",
        "text": "What programming language was created by Brendan Eich?",
        "type": "fib",
        "options": [],
        "correctAnswers": ["JavaScript", "javascript", "JS", "js"]
      },
      {
        "id": "tech_q6",
        "text": "Complete: The World Wide Web was invented by ___.",
        "type": "fib",
        "options": [],
        "correctAnswers": ["Tim Berners-Lee", "Tim Berners Lee", "Berners-Lee", "tim berners-lee"]
      }
    ]
  },
  // Adding the Java Phase Test from public/questions.json to ensure it's seeded if DB is empty
  {
    "name": "Java Phase Test - 2",
    "description": "A quiz covering topics from your Java Phase Test - 2.",
    "questions": [
      {
        "id": "java_q1",
        "text": "What is the correct way to declare an array of integers named 'numbers' with a size of 5 in Java?",
        "type": "mcq",
        "options": [
          "int numbers = new array[5];",
          "int[] numbers = new int(5);",
          "int[] numbers = new int[5];",
          "array<int> numbers = new array<int>(5);"
        ],
        "correctAnswers": [
          "int[] numbers = new int[5];"
        ]
      },
      {
        "id": "java_q2",
        "text": "Which of the following String class methods can be used to compare the content of two strings?",
        "type": "mcq",
        "options": [
          "==",
          "equals()",
          "compareTo()",
          "equalsIgnoreCase()"
        ],
        "correctAnswers": [
          "equals()",
          "compareTo()",
          "equalsIgnoreCase()"
        ]
      },
      {
        "id": "java_q3",
        "text": "Linear search has a time complexity of O(n).",
        "type": "tf",
        "options": ["True", "False"],
        "correctAnswers": ["True"]
      },
      {
        "id": "java_q4",
        "text": "Which of the following is NOT a primitive data type in Java?",
        "type": "mcq",
        "options": ["int", "boolean", "String", "float"],
        "correctAnswers": ["String"]
      },
      {
        "id": "java_q5",
        "text": "Can a class extend multiple classes in Java?",
        "type": "tf",
        "options": ["True", "False"],
        "correctAnswers": ["False"]
      },
      {
        "id": "java_q6",
        "text": "Which keyword is used to implement inheritance in Java?",
        "type": "mcq",
        "options": ["implements", "extends", "inherits", "subclass"],
        "correctAnswers": ["extends"]
      },
      {
        "id": "java_q7",
        "text": "What is method overriding in Java?",
        "type": "mcq",
        "options": [
          "Defining a new method with the same name but different parameters in the same class.",
          "Defining a method in a subclass with the same name and parameters as a method in its superclass.",
          "Defining multiple methods with the same name in the same class.",
          "Calling a method of the superclass from the subclass."
        ],
        "correctAnswers": [
          "Defining a method in a subclass with the same name and parameters as a method in its superclass."
        ]
      },
      {
        "id": "java_q8",
        "text": "Which of the following are unchecked exceptions in Java?",
        "type": "ms",
        "options": ["IOException", "SQLException", "NullPointerException", "ArrayIndexOutOfBoundsException"],
        "correctAnswers": ["NullPointerException", "ArrayIndexOutOfBoundsException"]
      },
      {
        "id": "java_q9",
        "text": "The 'finally' block in a try-catch-finally statement is always executed.",
        "type": "tf",
        "options": ["True", "False"],
        "correctAnswers": ["True"]
      },
      {
        "id": "java_q10",
        "text": "What is the time complexity of the binary search algorithm?",
        "type": "mcq",
        "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        "correctAnswers": ["O(log n)"]
      },
      {
        "id": "java_q11",
        "text": "Which of the following statements is true about Java?",
        "type": "mcq",
        "options": [
          "Java supports multiple inheritance through classes.",
          "Java supports multiple inheritance through interfaces.",
          "Java does not support inheritance.",
          "Java only supports single inheritance through interfaces."
        ],
        "correctAnswers": [
          "Java supports multiple inheritance through interfaces."
        ]
      },
      {
        "id": "java_q12",
        "text": "What is the purpose of the 'super' keyword in Java?",
        "type": "mcq",
        "options": [
          "To define a superclass.",
          "To call a method of the superclass.",
          "To create an instance of the superclass.",
          "To indicate that a class is a superclass."
        ],
        "correctAnswers": [
          "To call a method of the superclass."
        ]
      },
      {
        "id": "java_q13",
        "text": "Which sorting algorithm has an average time complexity of O(n log n)?",
        "type": "mcq",
        "options": ["Bubble Sort", "Insertion Sort", "Selection Sort", "Merge Sort"],
        "correctAnswers": ["Merge Sort"]
      },
      {
        "id": "java_q14",
        "text": "What will be the output of `\"Hello\".substring(1, 4)`?",
        "type": "mcq",
        "options": ["ello", "ell", "Hell", "ello "],
        "correctAnswers": ["ell"]
      },
      {
        "id": "java_q15",
        "text": "What will be the output of `\"Hello\".substring(1, 4)`?",
        "type": "fib",
        "options": [],
        "correctAnswers": ["ell"]
      },
      {
        "id": "java_q16",
        "text": "Complete: In Java, the ___ keyword is used to create a new instance of a class.",
        "type": "fib",
        "options": [],
        "correctAnswers": ["new", "NEW"]
      }
    ]
  }
];

export const seedTestsAndQuestions = internalAction({
  args: {},
  handler: async (ctx) => {
    // Check if tests or questions already exist using internal queries
    const existingTestsCount: number = await ctx.runQuery(internal.practiceTest.countTests, {});
    const existingQuestionsCount: number = await ctx.runQuery(internal.practiceTest.countQuestions, {});
    
    if (existingTestsCount > 0 || existingQuestionsCount > 0) {
      console.log("Database already contains tests or questions. Skipping seed operation to preserve existing data.");
      return "Seeding skipped: Data already exists.";
    }

    // If we reach here, both tests and questions tables are empty.
    console.log("Database is empty (no tests or questions). Proceeding with seeding...");
    // The explicit call to clearAllTestData is removed from here.
    // The cron will only seed into a truly empty state.

    console.log("Seeding tests and questions from JSON (practiceTestInternal.ts)...");
    for (const testData of testsJsonContent) {
      const testId: Id<"tests"> = await ctx.runMutation(internal.practiceTest.addTest, {
        name: testData.name,
        description: testData.description,
      });

      for (const q of testData.questions) {
        await ctx.runMutation(internal.practiceTest.addQuestion, {
          testId: testId, 
          text: q.text,
          type: q.type as "mcq" | "tf" | "ms" | "fib", // Updated to include "fib"
          options: q.options,
          correctAnswers: q.correctAnswers,
          questionId: q.id, // This is the original ID from JSON
        });
      }
    }
    console.log("Finished seeding tests and questions (practiceTestInternal.ts).");
    return "Seeding completed successfully.";
  },
});
