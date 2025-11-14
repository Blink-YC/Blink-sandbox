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
  const role = searchParams.get("role") as "employer" | "worker" | null;
  
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
                const redirectUrl = role 
                  ? `${window.location.origin}/auth/callback?role=${role}`
                  : `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
                  
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: redirectUrl,
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

              // After sign-in, check if user has completed onboarding
              const { data: auth } = await supabase.auth.getUser();
              const user = auth.user;
              
              if (user) {
                // If there's a role parameter, check if user_roles entry exists
                if (role) {
                  const businessRole = role === 'employer' ? 'business' : 'worker';
                  
                  // Check if role already exists
                  const { data: existingRole } = await supabase
                    .from('user_roles')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('role', businessRole)
                    .maybeSingle();
                  
                  if (existingRole) {
                    // Role exists - check if they've completed onboarding
                    if (existingRole.stage === 'profile_done') {
                      // Already completed, go to portal
                      const portalUrl = businessRole === 'business' 
                        ? '/employer-portal' 
                        : businessRole === 'worker' 
                        ? '/worker-portal' 
                        : '/portal';
                      window.location.assign(portalUrl);
                      return;
                    } else {
                      // In progress, go to onboarding
                      window.location.assign(`/onboarding?role=${businessRole}`);
                      return;
                    }
                  } else {
                    // Role doesn't exist - create it and go to onboarding
                    await supabase.from('user_roles').insert({
                      user_id: user.id,
                      role: businessRole,
                      stage: 'enabled',
                      enabled_at: new Date().toISOString(),
                    });
                    window.location.assign(`/onboarding?role=${businessRole}`);
                    return;
                  }
                }
                
                const { data: roles, error: rolesError } = await supabase
                  .from("user_roles")
                  .select("role, stage")
                  .eq("user_id", user.id);

                console.log("Google Sign-in - User roles:", roles, "Error:", rolesError);

                // Check if user has completed onboarding
                const done = (roles ?? []).find(
                  (r: { stage: string; role: string }) => r.stage === "profile_done"
                ) as { role: string; stage: string } | undefined;

                if (done) {
                  console.log("Google Sign-in - Found completed profile, redirecting to:", done.role);
                  // User has completed onboarding, go to appropriate portal
                  const portalUrl = done.role === 'business' 
                    ? '/employer-portal' 
                    : done.role === 'worker' 
                    ? '/worker-portal' 
                    : '/portal';
                  window.location.assign(portalUrl);
                  return;
                }
                
                // Check if user has selected a role (stage='enabled' or 'basics_done')
                const inProgress = (roles ?? []).find(
                  (r: { stage: string; role: string }) => r.stage === "enabled" || r.stage === "basics_done"
                );
                
                if (inProgress) {
                  // User has selected role but not completed, go to onboarding
                  window.location.assign(`/onboarding?role=${inProgress.role}`);
                  return;
                }
                
                // User has no roles, redirect to role selector
                window.location.assign("/auth/role-select");
                return;
              }
              
              // Fallback to nextPath if no user
              window.location.assign(nextPath);
            } catch{
              // Final fallback to OAuth redirect flow
              const redirectUrl = role 
                ? `${window.location.origin}/auth/callback?role=${role}`
                : `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
                
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: redirectUrl,
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
    
    // Check if user has completed onboarding
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    
    if (user) {
      // If there's a role parameter, check if user_roles entry exists
      if (role) {
        const businessRole = role === 'employer' ? 'business' : 'worker';
        
        // Check if role already exists
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', businessRole)
          .maybeSingle();
        
        if (existingRole) {
          // Role exists - check if they've completed onboarding
          if (existingRole.stage === 'profile_done') {
            // Already completed, go to portal
            const portalUrl = businessRole === 'business' 
              ? '/employer-portal' 
              : businessRole === 'worker' 
              ? '/worker-portal' 
              : '/portal';
            window.location.assign(portalUrl);
            return;
          } else {
            // In progress, go to onboarding
            window.location.assign(`/onboarding?role=${businessRole}`);
            return;
          }
        } else {
          // Role doesn't exist - create it and go to onboarding
          await supabase.from('user_roles').insert({
            user_id: user.id,
            role: businessRole,
            stage: 'enabled',
            enabled_at: new Date().toISOString(),
          });
          window.location.assign(`/onboarding?role=${businessRole}`);
          return;
        }
      }
      
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role, stage")
        .eq("user_id", user.id);

      console.log("User roles:", roles, "Error:", rolesError);

      // Check if user has completed onboarding
      const done = (roles ?? []).find(
        (r: { stage: string; role: string }) => r.stage === "profile_done"
      ) as { role: string; stage: string } | undefined;

      if (done) {
        console.log("Found completed profile, redirecting to portal for role:", done.role);
        // User has completed onboarding, go to appropriate portal
        const portalUrl = done.role === 'business' 
          ? '/employer-portal' 
          : done.role === 'worker' 
          ? '/worker-portal' 
          : '/portal';
        window.location.assign(portalUrl);
        return;
      }
      
      // Check if user has selected a role (stage='enabled' or 'basics_done')
      const inProgress = (roles ?? []).find(
        (r: { stage: string; role: string }) => r.stage === "enabled" || r.stage === "basics_done"
      );
      
      if (inProgress) {
        // User has selected role but not completed, go to onboarding
        window.location.assign(`/onboarding?role=${inProgress.role}`);
        return;
      }
      
      // User has no roles, redirect to role selector
      window.location.assign("/auth/role-select");
      return;
    }
    
    // Fallback
    window.location.assign(nextPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/auth/role-select"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to role selection
        </Link>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Role Badge */}
          {role && (
            <div className="flex justify-center mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                role === 'employer' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-orange-100 text-orange-600'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {role === 'employer' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  )}
                </svg>
                <span className="font-medium text-sm">
                  Signing in as {role === 'employer' ? 'Employer' : 'Worker'}
                </span>
              </div>
            </div>
          )}

          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-center mb-8">Sign in to your account</p>

        <div ref={buttonDiv} className="mb-4 flex justify-center" />
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500">or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">Email</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-gray-900"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">Password</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-gray-900"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              role === 'worker' 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:bg-gray-400 text-white font-semibold rounded-lg px-4 py-3.5 transition-colors`}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            <Link href="/auth/reset-request" className="text-blue-600 hover:text-blue-700 font-medium">
              Forgot your password?
            </Link>
          </p>
        </div>
        </div>
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
