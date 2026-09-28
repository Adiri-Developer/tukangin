import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/services')
      if (isProtectedRoute) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        const isAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')
        if (isAuthRoute) {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
      }
      return true
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
