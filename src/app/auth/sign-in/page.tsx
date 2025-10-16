"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/* --- Minimal types to avoid `any` / ts-ignore --- */
type Role = "worker" | "customer" | "business";
type GoogleCredentialResponse = { credential?: string };
type GoogleIdApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    el: HTMLElement,
    opts: { theme: string; size: string; width: number }
  ) => void;
};
type GoogleGlobal = { accounts?: { id?: GoogleIdApi } };
type GoogleWindow = { google?: GoogleGlobal };
type UserRoleRow = { role: Role; stage: "enabled" | "basics_done" | "profile_done" };

function SignInContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/portal";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const buttonDiv = useRef<HTMLDivElement>(null);

  // Initialize Google button
  useEffect(() => {
    const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!client_id) return;

    let attempts = 0;
    const maxAttempts = 30;

    const tryInit = () => {
      const idApi =
        (window as unknown as GoogleWindow).google?.accounts?.id;

      if (idApi) {
        idApi.initialize({
          client_id,
          callback: async (response: GoogleCredentialResponse) => {
            const supabase = createClient();
            const { credential } = response;
            try {
              if (!credential) {
                // Fallback to OAuth redirect if One Tap provides no token
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
                  },
                });
                return;
              }

              setLoading(true);
              const { error } = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: credential,
              });
              setLoading(false);
              if (error) throw error;

              // After sign-in, check if we should go to the next path
              // or to a completed role
              const { data: auth } = await supabase.auth.getUser();
              const user = auth.user;
              if (user && nextPath !== "/portal") {
                // If there's a specific next path, go there
                window.location.assign(nextPath);
                return;
              }
              
              if (user) {
                const { data: roles } = await supabase
                  .from("user_roles")
                  .select("role, stage")
                  .eq("user_id", user.id);

                const done = (roles ?? []).find(
                  (r: { stage: string }) => r.stage === "profile_done"
                ) as UserRoleRow | undefined;

                if (done) {
                  window.location.assign(`/portal?role=${done.role}`);
                  return;
                }
              }
              window.location.assign(nextPath);
            } catch{
              // Final fallback to OAuth redirect flow
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
                },
              });
            }
          },
        });

        if (buttonDiv.current) {
          idApi.renderButton(buttonDiv.current, {
            theme: "outline",
            size: "large",
            width: 320,
          });
        }
      } else if (attempts < maxAttempts) {
        attempts += 1;
        setTimeout(tryInit, 100);
      }
    };

    tryInit();
  }, [nextPath]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    window.location.assign(nextPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6">Sign in</h1>

        <div ref={buttonDiv} className="mb-4 flex justify-center" />
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500">or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          No account?{" "}
          <Link href="/auth/sign-up" className="text-blue-600">
            Sign up
          </Link>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Forgot your password?{" "}
          <Link href="/auth/reset-request" className="text-blue-600">
            Reset it
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
