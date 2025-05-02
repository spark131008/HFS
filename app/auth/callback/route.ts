import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Determine redirect path based on restaurant data
      let redirectPath = '/onboarding'
      
      if (!userError && user) {
        // Query restaurants table to check if this user has a restaurant
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name')
          .eq('user_id', user.id)
          .single();
        
        // If restaurant exists with id and name, redirect to surveys page
        if (!restaurantError && restaurantData && restaurantData.id && restaurantData.name) {
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