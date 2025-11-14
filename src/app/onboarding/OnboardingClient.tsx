// app/onboarding/OnboardingClient.tsx
"use client";

import { EmployerOnboarding } from "./EmployerOnboarding";
import { WorkerOnboarding } from "./WorkerOnboarding";
import { CustomerOnboarding } from "./CustomerOnboarding";

type Role = "customer" | "worker" | "business";

export default function OnboardingClient({ initialRole }: { initialRole: Role }) {
  const role = initialRole;
  
  // Use role-specific onboarding component
  if (role === "business") {
    return <EmployerOnboarding />;
  }
  
  if (role === "worker") {
    return <WorkerOnboarding />;
  }

  // Customer role
  return <CustomerOnboarding />;
}
