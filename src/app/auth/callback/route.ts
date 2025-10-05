import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'
  const nextUrl = new URL(next, origin)
  const roleFromNext = nextUrl.searchParams.get('role') as 'customer'|'worker'|'business' | null

  if (code) {
    const supabase = await createClient()
    try {
      await supabase.auth.exchangeCodeForSession(code)
      // After session is set, decide destination based on whether role is already enabled/completed
      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      if (user) {
        // Prefer redirecting to portal if the selected role already exists (and ideally profile_done)
        if (roleFromNext) {
          const { data: urExact } = await supabase
            .from('user_roles')
            .select('role, stage')
            .eq('user_id', user.id)
            .eq('role', roleFromNext)
            .maybeSingle()
          if (urExact && (urExact.stage === 'profile_done' || urExact.stage === 'basics_done' || urExact.stage === 'enabled')) {
            return NextResponse.redirect(new URL(`/portal?role=${roleFromNext}`, origin))
          }
        }
        // Otherwise, if any role is profile_done, send to that portal
        const { data: anyDone } = await supabase
          .from('user_roles')
          .select('role, stage')
          .eq('user_id', user.id)
          .in('stage', ['profile_done'])
          .limit(1)
        if (anyDone && anyDone.length > 0) {
          return NextResponse.redirect(new URL(`/portal?role=${anyDone[0].role}`, origin))
        }
      }
    } catch {
      // ignore and continue to next
    }
  }

  return NextResponse.redirect(new URL(next, origin))
}


