import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="btn btn-ghost btn-sm group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LogOut
        className={`w-4 h-4 transition-all duration-300 ${
          isHovered
            ? "translate-x-0.5 text-rose-500"
            : "text-[var(--color-text-secondary)]"
        }`}
      />
      <span className="hidden sm:inline ml-2">
        {isSigningOut ? "..." : "Sign Out"}
      </span>
    </button>
  );
}
