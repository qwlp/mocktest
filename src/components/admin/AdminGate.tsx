import React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { AdminShell } from "./AdminShell";

interface AdminGateProps {
  onBack: () => void;
}

const ADMIN_SESSION_KEY = "admin-password-session";

export function AdminGate({ onBack }: AdminGateProps) {
  const [adminPassword, setAdminPassword] = React.useState("");
  const [passwordInput, setPasswordInput] = React.useState("");
  const adminAccess = useQuery(api.admin.getAdminAccess, {
    adminPassword: adminPassword || undefined,
  });
  const verifyAdminPassword = useMutation(api.admin.verifyAdminPassword);
  const ensureAdminData = useMutation(api.admin.ensureAdminData);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const hasEnsuredData = React.useRef(false);

  React.useEffect(() => {
    const savedPassword = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (savedPassword) {
      setAdminPassword(savedPassword);
      setPasswordInput(savedPassword);
    }
  }, []);

  React.useEffect(() => {
    if (!adminAccess?.isAdmin || hasEnsuredData.current) {
      return;
    }

    hasEnsuredData.current = true;
    void ensureAdminData({ adminPassword }).catch((error) => {
      hasEnsuredData.current = false;
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to prepare admin data.",
      );
    });
  }, [adminAccess?.isAdmin, adminPassword, ensureAdminData]);

  const handleVerifyPassword = async () => {
    if (!passwordInput.trim()) {
      toast.error("Enter the admin password first.");
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verifyAdminPassword({ password: passwordInput.trim() });
      if (!isValid) {
        toast.error("Invalid admin password.");
        return;
      }
      window.localStorage.setItem(ADMIN_SESSION_KEY, passwordInput.trim());
      setAdminPassword(passwordInput.trim());
      toast.success("Admin access enabled.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to verify admin password.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminPassword("");
    setPasswordInput("");
    hasEnsuredData.current = false;
  };

  if (adminAccess === undefined) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--color-primary-subtle)] flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <p className="text-[var(--color-text-secondary)]">Loading admin access...</p>
        </div>
      </div>
    );
  }

  if (adminAccess.isAdmin) {
    return (
      <AdminShell
        onBack={onBack}
        access={adminAccess}
        adminPassword={adminPassword}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl space-y-4">
        <section className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-soft-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">
                Admin Access
              </h1>
              <p className="text-[var(--color-text-secondary)]">
                Enter the admin password to open the editor.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              placeholder="Admin password"
              className="auth-input-field"
            />
            <button
              type="button"
              onClick={() => void handleVerifyPassword()}
              disabled={isVerifying}
              className="btn btn-primary w-full"
            >
              {isVerifying ? "Checking..." : "Enter Admin"}
            </button>
          </div>
        </section>

        <button onClick={onBack} className="btn btn-secondary w-full">
          Back to Tests
        </button>
      </div>
    </div>
  );
}
