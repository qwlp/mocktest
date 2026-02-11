import React, { useState } from "react";
import { Toaster } from "sonner";
import { PracticeTestPage } from "./test/PracticeTestPage";
import { TestListPage } from "./test/TestListPage";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "./auth/SignOutButton";
import { ThemeToggleButton } from "./auth/ThemeToggleButton";
import { useAuthActions } from "@convex-dev/auth/react";
import { Page } from "../types";

function AnonymousSignInButton() {
  const { signIn } = useAuthActions();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn("anonymous");
    } catch (error) {
      console.error("Failed to sign in anonymously:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <button
      className="auth-button"
      onClick={handleSignIn}
      disabled={isSigningIn}
    >
      {isSigningIn ? "Signing in..." : "Start Taking Tests"}
    </button>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("list");
  const [currentTestId, setCurrentTestId] = useState<Id<"tests"> | null>(null);
  const user = useQuery(api.auth.loggedInUser);

  const handleStartTest = (testId: Id<"tests">) => {
    setCurrentTestId(testId);
    setCurrentPage("test");
  };

  const handleExitTest = () => {
    setCurrentTestId(null);
    setCurrentPage("list");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-background">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm h-16 flex justify-between items-center border-b border-gray-200 dark:border-dark-border shadow-sm px-4">
        <h2
          className="text-xl font-semibold text-primary dark:text-dark-primary cursor-pointer"
          onClick={user && currentPage === "test" ? handleExitTest : undefined}
        >
          Mock Tests{" "}
          {user && currentPage === "test" && currentTestId
            ? "> Taking Test"
            : ""}
        </h2>
        <div className="flex items-center gap-4">
          <ThemeToggleButton />
          {user && <SignOutButton />}
        </div>
      </header>
      <main className="flex-1">
        {user === undefined && (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 dark:text-dark-text-secondary">
              Loading...
            </p>
          </div>
        )}
        {user === null && (
          <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="w-full max-w-md p-8 bg-white dark:bg-dark-surface shadow-lg rounded-lg text-center">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-dark-primary mb-6">
                Welcome to Mock Tests
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-8">
                Click below to start taking practice tests.
              </p>
              <AnonymousSignInButton />
            </div>
          </div>
        )}
        {user && (
          <>
            {currentPage === "list" && (
              <TestListPage onStartTest={handleStartTest} />
            )}
            {currentPage === "test" && currentTestId && (
              <PracticeTestPage
                testId={currentTestId}
                onExitTest={handleExitTest}
              />
            )}
          </>
        )}
      </main>
      <Toaster richColors theme="system" />
    </div>
  );
}
