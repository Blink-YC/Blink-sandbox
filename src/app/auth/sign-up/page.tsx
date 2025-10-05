// app/auth/sign-up/page.tsx
import { Suspense } from "react";
import { SignUpClient } from "./SignUpClient";

export const dynamic = "force-dynamic"; // avoids static prerender for auth pages

type Role = "worker" | "customer" | "business";

export default function Page({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const nextPath = searchParams.next ?? "/onboarding";

  // Optional: pre-derive role from ?next=/something?role=worker
  let roleFromNext: Role | null = null;
  try {
    const url = new URL(nextPath, "http://localhost");
    roleFromNext = (url.searchParams.get("role") as Role | null) ?? null;
  } catch {
    // ignore
  }

  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">Loading…</div>}>
      <SignUpClient nextPath={nextPath} roleFromNext={roleFromNext} />
    </Suspense>
  );
}
