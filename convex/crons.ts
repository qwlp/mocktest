import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Comment out the isolated clear cron
// crons.interval(
//   "isolated clear all test data",
//   { minutes: 1 }, 
//   internal.practiceTest.clearAllTestData 
// );

// Restore the full seeder cron job
crons.interval(
  "seed tests and questions if empty",
  { minutes: 5 }, // Or a longer interval once stable
  internal.practiceTestInternal.seedTestsAndQuestions
);

export default crons;
