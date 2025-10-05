// app/setup-profile/page.tsx
import { SetupProfileClient } from "./SetupProfileClient";

export default function Page({
  searchParams,
}: {
  searchParams: { role?: "customer" | "worker" | "business" };
}) {
  const role = (searchParams.role ?? "customer") as
    | "customer"
    | "worker"
    | "business";

  return <SetupProfileClient initialRole={role} />;
}
