# Mock Tests

Mock Tests is a full-stack practice test app built with React, Vite, Tailwind, and Convex. It lets learners sign in quickly, take published tests in the browser, and resume unfinished work. It also includes an admin editor for creating, importing, editing, and publishing test content.

## What the app does

- Shows learners a list of published tests.
- Supports `mcq`, `tf`, `ms`, `matching`, and `fib` question types.
- Saves in-progress test state in `localStorage` for up to 3 days.
- Includes keyboard shortcuts for faster test navigation.
- Lets admins manage draft and published tests from an in-app editor.
- Validates imported JSON before creating draft tests.

## Tech stack

- Frontend: React 19, Vite, TypeScript, Tailwind CSS
- Backend: Convex
- Auth: Convex Auth
- Validation: Zod
- Tests: Vitest

## Getting started

### Prerequisites

- Node.js
- npm
- A Convex deployment

### Environment

This project expects a `.env.local` file with these variables:

```bash
CONVEX_DEPLOY_KEY=...
CONVEX_DEPLOYMENT=...
VITE_CONVEX_URL=...
```

If you are connecting this project to a new Convex deployment, run `npx convex dev` and follow the CLI prompts. That will typically populate the local Convex settings you need.

### Install and run

```bash
npm install
npm run dev
```

`npm run dev` starts both:

- the Vite frontend
- the Convex development backend

Once the app is running, open the local Vite URL in your browser and sign in from the landing page.

## Scripts

```bash
npm run dev
npm run lint
npm run test
```

- `npm run dev`: starts Vite and Convex in parallel
- `npm run lint`: runs TypeScript checks, validates the Convex backend, and builds the frontend
- `npm run test`: runs the Vitest suite

## Admin workflow

The admin UI is built into the app.

1. Sign in to the app.
2. Open `Admin` from the header.
3. Enter the admin password.
4. Create a draft test or import JSON.
5. Edit questions, reorder them, then publish when ready.

Important: the admin password is currently hard-coded as `admin123` in `convex/admin.ts`. That is fine for local development, but it is not acceptable for a real deployment. Change this before exposing the app to anyone else.

## Question import format

Tests can be imported as a single JSON object or an array of test objects. Imports are validated before they are written, and imported tests are created as drafts first.

See [QUESTION_FORMAT_GUIDE.md](./QUESTION_FORMAT_GUIDE.md) for the full schema and examples.

At a high level, each imported test looks like this:

```json
{
  "name": "Sample Test",
  "description": "Optional description",
  "questions": [
    {
      "id": "q1",
      "text": "What is the capital of France?",
      "type": "mcq",
      "options": ["London", "Paris", "Rome"],
      "correctAnswers": ["Paris"]
    }
  ]
}
```

## Project structure

```text
src/        React UI, hooks, and client-side utilities
convex/     Convex schema, queries, mutations, auth, and HTTP setup
shared/     Shared validation logic for admin editing and JSON imports
public/     Static assets
```

## Notes

- Only published tests are visible to learners.
- Draft tests remain available in the admin editor until published.
- Auth is configured with both `Password` and `Anonymous` providers, but the current UI signs learners in anonymously.
- Question text supports Markdown rendering in the test UI.
