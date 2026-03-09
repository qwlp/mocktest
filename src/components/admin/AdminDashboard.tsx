import React from "react";
import { AdminGate } from "./AdminGate";

export function AdminDashboard({ onBack }: { onBack: () => void }) {
  return <AdminGate onBack={onBack} />;
}
