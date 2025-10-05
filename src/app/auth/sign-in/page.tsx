"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // OTP removed for sign-in

  const buttonDiv = useRef<HTMLDivElement>(null)
  const [showFallback, setShowFallback] = useState(false)

  // Initialize Google button and One Tap
  useEffect(() => {
    const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!client_id) {
      setShowFallback(true)
      return
    }

    let attempts = 0
    const maxAttempts = 30
    const tryInit = () => {
      // @ts-ignore
      const google = (window as any).google
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
          client_id,
          callback: async (response: any) => {
            const supabase = createClient()
            const { credential } = response
            try {
              if (!credential) {
                // Fallback to OAuth redirect if no token (FedCM blocked or aborted)
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/auth/callback?next=/select-role` },
                })
                return
              }
              setLoading(true)
              const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: credential,
              })
              setLoading(false)
              if (error) throw error
              // After sign-in, route based on whether the user already completed a role
              const { data: auth } = await supabase.auth.getUser()
              const user = auth.user
              if (user) {
                const { data: roles } = await supabase
                  .from('user_roles')
                  .select('role, stage')
                  .eq('user_id', user.id)
                const done = (roles || []).find(r => r.stage === 'profile_done')
                if (done) {
                  window.location.assign(`/portal?role=${done.role}`)
                  return
                }
              }
              window.location.assign('/select-role')
            } catch (e: any) {
              // Final fallback to OAuth redirect flow
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback?next=/select-role` },
              })
            }
          },
        })

        if (buttonDiv.current) {
          google.accounts.id.renderButton(buttonDiv.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
          })
        }
        // One Tap disabled intentionally for now
      } else if (attempts < maxAttempts) {
        attempts += 1
        setTimeout(tryInit, 100)
      } else {
        setShowFallback(true)
      }
    }

    tryInit()
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    window.location.assign("/portal");
  }

  // OTP helpers removed

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
        {
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input type="email" className="w-full border border-gray-300 rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input type="password" className="w-full border border-gray-300 rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2">{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
        }

        <p className="text-sm text-gray-600 mt-4">
          No account? <Link href="/auth/sign-up" className="text-blue-600">Sign up</Link>
        </p>
        <p className="text-sm text-gray-600 mt-2">Forgot your password? <Link href="/auth/reset-request" className="text-blue-600">Reset it</Link></p>
      </div>
    </div>
  );
}


