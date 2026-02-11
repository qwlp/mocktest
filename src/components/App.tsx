import React, { useState } from "react";
import { Toaster } from "sonner";
import { PracticeTestPage } from "./test/PracticeTestPage";
import { TestListPage } from "./test/TestListPage";
import { AdminLogin, AdminDashboard } from "./admin";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "./auth/SignOutButton";
import { ThemeToggleButton } from "./auth/ThemeToggleButton";
import { useAuthActions } from "@convex-dev/auth/react";
import { Page } from "../types";
import { Sparkles, BookOpen, ArrowRight } from "lucide-react";

function AnonymousSignInButton() {
  const { signIn } = useAuthActions();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      className="btn btn-primary btn-lg ripple group relative overflow-hidden"
      onClick={handleSignIn}
      disabled={isSigningIn}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative z-10 flex items-center gap-3">
        {isSigningIn ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Preparing your tests...</span>
          </>
        ) : (
          <>
            <BookOpen className="w-5 h-5" />
            <span>Start Taking Tests</span>
            <ArrowRight
              className={`w-5 h-5 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
            />
          </>
        )}
      </span>
    </button>
  );
}

function Header({
  currentPage,
  onExitTest,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  setCurrentPage,
  setShowAdminLogin,
  user,
}: {
  currentPage: Page;
  onExitTest: () => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (value: boolean) => void;
  setCurrentPage: (page: Page) => void;
  setShowAdminLogin: (show: boolean) => void;
  user: any;
}) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--color-border)]">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div>
            <h2
              className="text-xl font-display font-bold text-[var(--color-text)] cursor-pointer hover:text-[var(--color-primary)] transition-colors"
              onClick={user && currentPage === "test" ? onExitTest : undefined}
            >
              Mock Tests
            </h2>
            {user && currentPage === "test" && (
              <span className="text-xs text-[var(--color-text-muted)] font-medium">
                Taking Test
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <>
              {!isAdminLoggedIn ? (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="btn btn-ghost btn-sm hidden sm:inline-flex"
                  title="Admin Login"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="ml-2">Admin</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAdminLoggedIn(false);
                    setCurrentPage("list");
                  }}
                  className="btn btn-ghost btn-sm text-[var(--color-error)] hover:text-[var(--color-error)] hidden sm:inline-flex"
                  title="Logout from Admin"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="ml-2">Logout</span>
                </button>
              )}
            </>
          )}
          <ThemeToggleButton />
          {user && <SignOutButton />}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("list");
  const [currentTestId, setCurrentTestId] = useState<Id<"tests"> | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const user = useQuery(api.auth.loggedInUser);

  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleStartTest = (testId: Id<"tests">) => {
    setCurrentTestId(testId);
    setCurrentPage("test");
  };

  const handleExitTest = () => {
    setCurrentTestId(null);
    setCurrentPage("list");
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setShowAdminLogin(false);
    setCurrentPage("admin");
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <Header
        currentPage={currentPage}
        onExitTest={handleExitTest}
        isAdminLoggedIn={isAdminLoggedIn}
        setIsAdminLoggedIn={setIsAdminLoggedIn}
        setCurrentPage={setCurrentPage}
        setShowAdminLogin={setShowAdminLogin}
        user={user}
      />

      <main className="flex-1">
        {user === undefined && (
          <div className="flex justify-center items-center h-full min-h-[60vh] gap-4">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
              <p className="text-[var(--color-text-secondary)] font-medium animate-pulse">
                Loading...
              </p>
            </div>
          </div>
        )}

        {user === null && (
          <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <div
              className="w-full max-w-lg animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              {/* Decorative elements */}
              <div className="absolute top-20 left-10 w-32 h-32 bg-[var(--color-primary-light)]/10 rounded-full blur-3xl float-gentle" />
              <div
                className="absolute bottom-20 right-10 w-40 h-40 bg-[var(--color-primary)]/10 rounded-full blur-3xl float-gentle"
                style={{ animationDelay: "2s" }}
              />

              <div
                className="relative p-8 sm:p-12 rounded-2xl shadow-soft-lg border border-[var(--color-border)] overflow-hidden"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[var(--color-primary)]/5 to-transparent rounded-tr-full" />

                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--color-primary)] shadow-lg mb-8 float-gentle">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4 gradient-text">
                    Welcome to Mock Tests
                  </h1>

                  <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
                    Trying to find a good way to practice questions was too
                    hard, so I just made my own also learningzone is way too
                    slow and pain so yeah.
                  </p>

                  <div className="space-y-4">
                    <AnonymousSignInButton />

                    <p className="text-sm text-[var(--color-text-muted)]">
                      Quick, easy, and completely free
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="animate-fade-in">
            {currentPage === "list" && (
              <TestListPage onStartTest={handleStartTest} />
            )}
            {currentPage === "test" && currentTestId && (
              <PracticeTestPage
                testId={currentTestId}
                onExitTest={handleExitTest}
              />
            )}
            {currentPage === "admin" && isAdminLoggedIn && (
              <AdminDashboard onBack={() => setCurrentPage("list")} />
            )}
          </div>
        )}
      </main>

      <Toaster
        richColors
        theme="system"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
          },
        }}
      />

      {showAdminLogin && (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}
