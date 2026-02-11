# Creating Questions for Mock Tests - JSON Format Guide

This guide explains how to create test questions in JSON format for the Mock Tests application.

## Overview

Tests can be imported individually or in batches. Each test contains metadata and an array of questions.

## JSON Structure

### Single Test Format

```json
{
  "name": "Test Name",
  "description": "Optional test description",
  "questions": [
    {
      "id": "unique_question_id",
      "text": "Question text here",
      "type": "mcq",
      "options": ["Option A", "Option B", "Option C"],
      "correctAnswers": ["Option B"]
    }
  ]
}
```

### Multiple Tests Format

```json
[
  {
    "name": "Test 1",
    "description": "Description",
    "questions": [...]
  },
  {
    "name": "Test 2",
    "description": "Description",
    "questions": [...]
  }
]
```

## Question Types

### 1. Multiple Choice (MCQ)

Single correct answer from multiple options.

```json
{
  "id": "mcq_001",
  "text": "What is the capital of France?",
  "type": "mcq",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "correctAnswers": ["Paris"]
}
```

**Requirements:**

- At least 2 options
- Exactly 1 correct answer

### 2. True/False (TF)

Simple true or false question.

```json
{
  "id": "tf_001",
  "text": "The Earth is flat.",
  "type": "tf",
  "options": ["True", "False"],
  "correctAnswers": ["False"]
}
```

**Requirements:**

- Exactly 2 options: ["True", "False"]
- Correct answer must be "True" or "False"

### 3. Multiple Select (MS)

Multiple correct answers possible.

```json
{
  "id": "ms_001",
  "text": "Which of the following are programming languages? (Select all that apply)",
  "type": "ms",
  "options": ["JavaScript", "HTML", "Python", "CSS", "Java"],
  "correctAnswers": ["JavaScript", "Python", "Java"]
}
```

**Requirements:**

- At least 2 options
- At least 1 correct answer (can be multiple)

### 4. Matching (MATCHING)

Match prompts with answers by dragging and dropping.

```json
{
  "id": "matching_001",
  "text": "Match each country with its capital:",
  "type": "matching",
  "options": [],
  "correctAnswers": [],
  "matchingPairs": [
    { "prompt": "United Kingdom", "answer": "London" },
    { "prompt": "Germany", "answer": "Berlin" },
    { "prompt": "Italy", "answer": "Rome" },
    { "prompt": "Japan", "answer": "Tokyo" }
  ]
}
```

**Requirements:**

- At least 2 matching pairs
- Each pair needs both `prompt` and `answer`
- `options` and `correctAnswers` should be empty arrays

### 5. Fill-in-the-Blank (FIB)

Text input answer with multiple accepted variations.

```json
{
  "id": "fib_001",
  "text": "What is the chemical symbol for water?",
  "type": "fib",
  "options": [],
  "correctAnswers": ["H2O", "h2o", "H₂O"]
}
```

```json
{
  "id": "fib_002",
  "text": "Complete: The largest planet in our solar system is ____.",
  "type": "fib",
  "options": [],
  "correctAnswers": ["Jupiter", "jupiter"]
}
```

**Requirements:**

- At least 1 correct answer
- Multiple variations can be accepted (case insensitive alternatives)
- `options` should be empty array

## Complete Example

```json
{
  "name": "Computer Science Fundamentals",
  "description": "A comprehensive test covering basic CS concepts",
  "questions": [
    {
      "id": "cs_q1",
      "text": "What does CPU stand for?",
      "type": "mcq",
      "options": [
        "Central Processing Unit",
        "Computer Personal Unit",
        "Central Program Unit",
        "Control Processing Unit"
      ],
      "correctAnswers": ["Central Processing Unit"]
    },
    {
      "id": "cs_q2",
      "text": "HTML is a programming language.",
      "type": "tf",
      "options": ["True", "False"],
      "correctAnswers": ["False"]
    },
    {
      "id": "cs_q3",
      "text": "Which of the following are JavaScript data types? (Select all that apply)",
      "type": "ms",
      "options": ["String", "Integer", "Boolean", "Float", "Object"],
      "correctAnswers": ["String", "Boolean", "Object"]
    },
    {
      "id": "cs_q4",
      "text": "Match each HTTP method with its purpose:",
      "type": "matching",
      "options": [],
      "correctAnswers": [],
      "matchingPairs": [
        { "prompt": "GET", "answer": "Retrieve data" },
        { "prompt": "POST", "answer": "Create data" },
        { "prompt": "PUT", "answer": "Update data" },
        { "prompt": "DELETE", "answer": "Remove data" }
      ]
    },
    {
      "id": "cs_q5",
      "text": "What does API stand for?",
      "type": "fib",
      "options": [],
      "correctAnswers": [
        "Application Programming Interface",
        "application programming interface"
      ]
    }
  ]
}
```

## Validation Rules

The import system performs strict validation:

### Test Level

- ✅ `name` is required (string)
- ✅ `description` is optional (string)
- ✅ `questions` is required (array, minimum 1 question)

### Question Level

- ✅ `id` is required (string, must be unique within test)
- ✅ `text` is required (string)
- ✅ `type` is required (must be: "mcq", "tf", "ms", "matching", or "fib")
- ✅ `options` is required (array, can be empty)
- ✅ `correctAnswers` is required (array, must have at least 1 item)

### Type-Specific Validation

| Type     | Min Options    | Max Correct Answers | Special Requirements             |
| -------- | -------------- | ------------------- | -------------------------------- |
| MCQ      | 2              | 1                   | -                                |
| TF       | 2 (True/False) | 1                   | Must be "True" or "False"        |
| MS       | 2              | 1+                  | -                                |
| Matching | 0              | 0                   | `matchingPairs` required (min 2) |
| FIB      | 0              | 1+                  | -                                |

## Text Formatting

Question text supports basic formatting:

### Markdown Support

- `**bold text**` for **bold**
- `*italic text*` for _italic_
- `` `code` `` for inline code
- Tables using markdown table syntax

### Example with Formatting

```json
{
  "id": "formatted_q1",
  "text": "What is the output of `console.log(2 + 2)` in JavaScript?\n\n*Hint: This is a simple arithmetic operation.*",
  "type": "mcq",
  "options": ["2", "3", "4", "22"],
  "correctAnswers": ["4"]
}
```

## Best Practices

### Question IDs

- Use descriptive, unique IDs
- Format: `{test_prefix}_q{number}`
- Example: "java_q1", "cs_q5", "math_q12"

### Answer Variations (FIB)

Include common variations for fill-in-the-blank questions:

- Different capitalizations: "Jupiter", "jupiter"
- Alternative formats: "H2O", "h2o", "H₂O"
- Abbreviations: "Application Programming Interface", "API"

### Options Order

- Randomize or shuffle option order
- Avoid patterns like always putting correct answer first
- For TF questions, always use ["True", "False"] order

### Question Text

- Be clear and specific
- Use proper grammar and punctuation
- Include hints when appropriate
- One question per item (avoid compound questions)

### Matching Questions

- Keep prompts and answers concise
- Ensure there's a clear 1:1 relationship
- Use 4-8 pairs for optimal UX

## Common Errors to Avoid

❌ **Missing required fields**

```json
// WRONG - missing "id"
{
  "text": "What is 2+2?",
  "type": "mcq",
  "options": ["3", "4", "5"],
  "correctAnswers": ["4"]
}
```

❌ **Wrong type value**

```json
// WRONG - "multiple_choice" is not valid
{
  "id": "q1",
  "text": "Question",
  "type": "multiple_choice",
  ...
}
```

❌ **MCQ with multiple correct answers**

```json
// WRONG - MCQ should have exactly 1 correct answer
{
  "id": "q1",
  "text": "Select one:",
  "type": "mcq",
  "options": ["A", "B", "C"],
  "correctAnswers": ["A", "B"]
}
```

❌ **Matching without matchingPairs**

```json
// WRONG - matching questions need matchingPairs
{
  "id": "q1",
  "text": "Match these:",
  "type": "matching",
  "options": ["A", "B", "C"],
  "correctAnswers": ["1", "2", "3"]
}
```

## Import Process

1. **Prepare your JSON**: Create questions following this guide
2. **Validate**: Use the admin panel to validate before importing
3. **Review**: Check the preview showing question counts and types
4. **Import**: Click "Import Tests" to save to the database

## Admin Access

To import questions:

1. Click the lock icon in the header
2. Enter the admin password
3. Use the import interface to upload or paste JSON
4. Validate and import

## Tips for LLMs

When generating questions:

1. Always include unique IDs for each question
2. Verify the question type matches the content
3. Include appropriate answer variations for FIB questions
4. Ensure matching pairs have equal numbers of prompts and answers
5. Use clear, unambiguous language
6. Test your JSON with a validator before attempting import

## Example: Generating a Test

If asked to create a test about Python programming:

```json
{
  "name": "Python Programming Basics",
  "description": "Test your knowledge of Python fundamentals",
  "questions": [
    {
      "id": "py_q1",
      "text": "Which of the following is used to define a function in Python?",
      "type": "mcq",
      "options": ["function", "def", "func", "define"],
      "correctAnswers": ["def"]
    },
    {
      "id": "py_q2",
      "text": "Python is a statically typed language.",
      "type": "tf",
      "options": ["True", "False"],
      "correctAnswers": ["False"]
    },
    {
      "id": "py_q3",
      "text": "Select all Python data types:",
      "type": "ms",
      "options": ["int", "str", "array", "list", "dict"],
      "correctAnswers": ["int", "str", "list", "dict"]
    }
  ]
}
```

This format will successfully import into the Mock Tests application.
