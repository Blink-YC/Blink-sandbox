import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'
  const nextUrl = new URL(next, origin)
  const roleParam = searchParams.get('role') as 'employer'|'worker' | null
  const roleFromNext = nextUrl.searchParams.get('role') as 'customer'|'worker'|'business' | null

  if (code) {
    const supabase = await createClient()
    try {
      await supabase.auth.exchangeCodeForSession(code)
      // After session is set, decide destination based on whether role is already enabled/completed
      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      if (user) {
        // If there's a role parameter, check if user_roles entry exists
        if (roleParam) {
          const businessRole = roleParam === 'employer' ? 'business' : 'worker'
          
          // Check if role already exists
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', businessRole)
            .maybeSingle()
          
          if (existingRole) {
            // Role exists - check if they've completed onboarding
            if (existingRole.stage === 'profile_done') {
              // Already completed, go to portal
              const portalUrl = businessRole === 'business' 
                ? '/employer-portal' 
                : businessRole === 'worker' 
                ? '/worker-portal' 
                : '/portal'
              return NextResponse.redirect(new URL(portalUrl, origin))
            } else {
              // In progress, go to onboarding
              return NextResponse.redirect(new URL(`/onboarding?role=${businessRole}`, origin))
            }
          } else {
            // Role doesn't exist - create it and go to onboarding
            await supabase.from('user_roles').insert({
              user_id: user.id,
              role: businessRole,
              stage: 'enabled',
              enabled_at: new Date().toISOString(),
            })
            return NextResponse.redirect(new URL(`/onboarding?role=${businessRole}`, origin))
          }
        }
        
        // Get all user roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role, stage')
          .eq('user_id', user.id)
        
        // Check if user has completed onboarding
        const done = roles?.find(r => r.stage === 'profile_done')
        if (done) {
          // Redirect to the appropriate portal based on role
          const portalUrl = done.role === 'business' 
            ? '/employer-portal' 
            : done.role === 'worker' 
            ? '/worker-portal' 
            : '/portal';
          return NextResponse.redirect(new URL(portalUrl, origin))
        }
        
        // Check if user has selected a role (in progress)
        const inProgress = roles?.find(r => r.stage === 'enabled' || r.stage === 'basics_done')
        if (inProgress) {
          return NextResponse.redirect(new URL(`/onboarding?role=${inProgress.role}`, origin))
        }
        
        // User has no roles, redirect to role selector
        return NextResponse.redirect(new URL('/auth/role-select', origin))
      }
    } catch {
      // ignore and continue to next
    }
  }

  return NextResponse.redirect(new URL(next, origin))
}


