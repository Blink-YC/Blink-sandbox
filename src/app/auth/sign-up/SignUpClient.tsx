// app/auth/sign-up/SignUpClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/* Minimal types */
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

export function SignUpClient({
  nextPath,
  roleFromNext,
}: {
  nextPath: string;
  roleFromNext: Role | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [verifyEmailPending, setVerifyEmailPending] = useState(false);
  const [verifyEmailFor, setVerifyEmailFor] = useState<string | null>(null);

  const buttonDiv = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  // Init Google button
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!client_id) return;

    let attempts = 0;
    const maxAttempts = 30;

    const tryInit = () => {
      const idApi = (window as unknown as GoogleWindow).google?.accounts?.id;

      if (idApi) {
        idApi.initialize({
          client_id,
          callback: async (response: GoogleCredentialResponse) => {
            const supabase = createClient();
            const { credential } = response;
            try {
              if (!credential) {
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
                      nextPath
                    )}`,
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

              // If role already enabled, skip onboarding
              const { data: auth } = await supabase.auth.getUser();
              const user = auth.user;
              if (user && roleFromNext) {
                const { data: urExact } = await supabase
                  .from("user_roles")
                  .select("role, stage")
                  .eq("user_id", user.id)
                  .eq("role", roleFromNext)
                  .maybeSingle();

                if (urExact) {
                  window.location.assign(`/portal?role=${roleFromNext}`);
                  return;
                }
              }
              window.location.assign(nextPath);
            } catch {
              // Fallback to redirect flow
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
                    nextPath
                  )}`,
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
  }, [nextPath, roleFromNext]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          nextPath
        )}`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (!data.session) {
      setVerifyEmailPending(true);
      setVerifyEmailFor(email);
      setEmail("");
      setPassword("");
      return;
    }
    window.location.assign(nextPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

        {verifyEmailPending && (
          <div className="mb-6 rounded border border-gray-200 p-4 bg-gray-50">
            <p className="text-sm text-gray-700 mb-3">
              We sent a verification link to{" "}
              <span className="font-medium">{verifyEmailFor ?? email}</span>. Open it to verify your email and finish creating your account.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError(null);
                const supabase = createClient();
                const { error } = await supabase.auth.resend({
                  type: "signup",
                  email: verifyEmailFor || email,
                  options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
                  },
                });
                setLoading(false);
                if (error) setError(error.message);
              }}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {loading ? "Resending…" : "Resend verification email"}
            </button>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        )}

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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-blue-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
