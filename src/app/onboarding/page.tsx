// app/onboarding/page.tsx
import { Suspense } from "react";
import OnboardingClient from "./OnboardingClient";

export const dynamic = "force-dynamic"; // helpful for auth-driven pages

export default function Page({
  searchParams,
}: {
  searchParams: { role?: "customer" | "worker" | "business" };
}) {
  const role =
    (searchParams.role ?? "customer") as "customer" | "worker" | "business";

  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-600">Loading…</div>}>
      <OnboardingClient initialRole={role} />
    </Suspense>
  );
}
