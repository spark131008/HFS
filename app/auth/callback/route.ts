import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get user data to check restaurant metadata
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Determine redirect path based on restaurant metadata
      let redirectPath = '/onboarding'
      
      if (!userError && user) {
        // Check if user already has restaurant info
        const restaurantId = user.user_metadata?.restaurant_id
        const restaurantName = user.user_metadata?.restaurant_name
        
        if (restaurantId && restaurantName) {
          redirectPath = '/my-surveys'
        }
      }
      
      // Use the provided 'next' parameter or fall back to our determined path
      const next = searchParams.get('next') ?? redirectPath

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`http://localhost:3000${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}