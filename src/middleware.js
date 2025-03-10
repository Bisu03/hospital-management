import { withAuth } from "next-auth/middleware"
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Your custom middleware logic here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith('/admin/:path*')) {
          return token !== null
        }
        if (req.nextUrl.pathname.startsWith('/private/:path*')) {
          return token !== null
        }
        return true
      },
    },
  }
)

export const config = { matcher: ['/admin/:path*', '/private/:path*'] }

