import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()
    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch {
      // ignore
    }
  }

  return NextResponse.redirect(new URL(next, origin))
}


