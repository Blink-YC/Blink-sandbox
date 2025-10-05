// app/auth/sign-up/page.tsx
import { Suspense } from "react";
import { SignUpClient } from "./SignUpClient"; // if you export named: `import { SignUpClient } from "./SignUpClient"`

export const dynamic = "force-dynamic"; // auth-y pages shouldn't be prerendered

type Role = "worker" | "customer" | "business";

export default async function Page({
  searchParams,
}: {
  // Next 15: searchParams can be a Promise; await before use
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const nextPath = sp?.next ?? "/onboarding";

  // Optionally extract role from the `next` URL query (?role=worker)
  let roleFromNext: Role | null = null;
  try {
    const url = new URL(nextPath, "http://localhost"); // base only used to parse
    const r = url.searchParams.get("role");
    if (r === "worker" || r === "customer" || r === "business") {
      roleFromNext = r;
    }
  } catch {
    // ignore bad URLs
  }

  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">Loading…</div>}>
      <SignUpClient nextPath={nextPath} roleFromNext={roleFromNext} />
    </Suspense>
  );
}
