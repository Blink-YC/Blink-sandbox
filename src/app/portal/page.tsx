// app/portal/page.tsx
import { Suspense } from "react";
import PortalClient from "./PortalClient";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams: { role?: "customer" | "worker" | "business" };
}) {
  const role = (searchParams.role ?? "customer") as
    | "customer"
    | "worker"
    | "business";

  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-600">Loading…</div>}>
      <PortalClient initialRole={role} />
    </Suspense>
  );
}
