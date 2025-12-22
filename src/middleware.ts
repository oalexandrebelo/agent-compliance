
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Security Headers (Defense in Depth)
    // Although handled in next.config.ts, some edge environments benefit from middleware enforcement
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Future Authentication Layer
    // const isAuthenticated = request.cookies.has('auth_token')
    // if (!isAuthenticated && request.nextUrl.pathname.startsWith('/dashboard')) {
    //   return NextResponse.redirect(new URL('/login', request.url))
    // }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
