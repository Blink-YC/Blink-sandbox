// app/onboarding/page.tsx
import { Suspense } from "react";
import OnboardingClient from "./OnboardingClient";

export const dynamic = "force-dynamic"; // helpful for auth-driven pages

export default async function Page({
  searchParams,
}: {
  // Next 15: searchParams can be a Promise; await before using
  searchParams: Promise<{ role?: "customer" | "worker" | "business" }>;
}) {
  const sp = await searchParams;
  const role = (sp.role ?? "customer") as "customer" | "worker" | "business";

  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-600">Loading…</div>}>
      <OnboardingClient initialRole={role} />
    </Suspense>
  );
}
