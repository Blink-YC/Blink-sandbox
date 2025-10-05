"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SelectRolePage() {
  const router = useRouter();

  async function choose(role: 'customer' | 'worker' | 'business') {
    const target = `/onboarding?role=${role}`;
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (user) {
      router.replace(target);
    } else {
      router.replace(`/auth/sign-up?next=${encodeURIComponent(target)}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-semibold mb-2">Choose your role</h1>
        <button onClick={() => choose('customer')} className="w-full border border-gray-300 rounded px-3 py-2">I need something fixed (Customer)</button>
        <button onClick={() => choose('worker')} className="w-full border border-gray-300 rounded px-3 py-2">I’m looking for work (Worker)</button>
        <button onClick={() => choose('business')} className="w-full border border-gray-300 rounded px-3 py-2">I need workers (Business)</button>
      </div>
    </div>
  )
}


