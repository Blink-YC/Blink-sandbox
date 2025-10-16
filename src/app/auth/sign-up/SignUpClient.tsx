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

function formatPasswordError(errorMessage: string): string {
  // Check if it's a password strength error
  if (errorMessage.toLowerCase().includes("password") && 
      (errorMessage.includes("abcdefghijklmnopqrstuvwxyz") || 
       errorMessage.includes("at least") || 
       errorMessage.includes("character"))) {
    return "Password must be at least 8 characters and include: uppercase letter, lowercase letter, number, and special character (!@#$%^&* etc.)";
  }
  return errorMessage;
}

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
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

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
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setEmailExists(false);
    
    // Client-side validation
    if (!email || email.trim() === "") {
      setEmailError("Email is required");
      return;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    if (!password || password.trim() === "") {
      setPasswordError("Password is required");
      return;
    }
    
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    
    // Check password strength
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
    
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setPasswordError("Password must include: uppercase letter, lowercase letter, number, and special character (!@#$%^&* etc.)");
      return;
    }
    
    setLoading(true);
    const supabase = createClient();
    
    // Try to sign up
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
      const errorLower = error.message.toLowerCase();
      
      // Check if error indicates user already exists
      if (errorLower.includes("already") || 
          errorLower.includes("exists") ||
          errorLower.includes("registered")) {
        setEmailExists(true);
        setError(null);
        setEmailError(null);
        setPasswordError(null);
      } else if (errorLower.includes("email")) {
        // Any email-related error - show directly under email field
        setEmailError(error.message);
        setError(null);
        setPasswordError(null);
      } else if (errorLower.includes("password")) {
        // Any password-related error - show directly under password field
        setPasswordError(formatPasswordError(error.message));
        setError(null);
        setEmailError(null);
      } else {
        // Other errors - for debugging
        console.log("Signup error:", error.message);
        setError(error.message);
        setEmailError(null);
        setPasswordError(null);
      }
      return;
    }
    
    // Check if user already exists with a confirmed email
    // Supabase returns a user with empty identities array when email is already registered
    if (data.user && !data.session && data.user.identities && data.user.identities.length === 0) {
      setEmailExists(true);
      setError(null);
      return;
    }
    
    // If no session, user needs to verify email
    if (!data.session) {
      setVerifyEmailPending(true);
      setVerifyEmailFor(email);
      setEmail("");
      setPassword("");
      return;
    }
    
    // If we have a session, sign up was successful - redirect
    window.location.assign(nextPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

        {emailExists && (
          <div className="mb-6 rounded border border-yellow-300 bg-yellow-50 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-yellow-600 text-xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  Account Already Exists
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  An account with <span className="font-medium">{email}</span> already exists. 
                  Please sign in instead or use a different email address.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/auth/sign-in?next=${encodeURIComponent(nextPath)}`}
                    className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium px-4 py-2 rounded text-center"
                  >
                    Go to Sign In
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailExists(false);
                      setEmail("");
                      setPassword("");
                    }}
                    className="inline-block border border-yellow-600 text-yellow-700 hover:bg-yellow-100 text-sm font-medium px-4 py-2 rounded text-center"
                  >
                    Try Different Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className={`w-full border rounded px-3 py-2 ${
                emailError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300"
              }`}
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              autoComplete="email"
              placeholder="you@example.com"
            />
            {emailError && (
              <p className="text-xs text-red-600 mt-1">
                {emailError}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className={`w-full border rounded px-3 py-2 ${
                passwordError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300"
              }`}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              autoComplete="new-password"
              placeholder="••••••••"
            />
            {passwordError ? (
              <p className="text-xs text-red-600 mt-1">
                {passwordError}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            )}
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
