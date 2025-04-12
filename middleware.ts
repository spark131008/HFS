import { updateSession } from '@/utils/supabase/middelware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login page
     * - auth callback
     */
    '/((?!_next/static|_next/image|favicon.ico|public|login|auth).*)',
    '/surveyform',
  ],
} 