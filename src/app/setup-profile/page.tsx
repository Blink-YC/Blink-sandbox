// app/setup-profile/page.tsx
import { SetupProfileClient } from "./SetupProfileClient";

export default async function Page({
  searchParams,
}: {
  // Next 15: searchParams can be a Promise; await before using
  searchParams: Promise<{ role?: "customer" | "worker" | "business" }>;
}) {
  const sp = await searchParams;
  const role = (sp.role ?? "customer") as "customer" | "worker" | "business";

  return <SetupProfileClient initialRole={role} />;
}
