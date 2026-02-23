/**
 * Next.js App Router Integration Example
 * 
 * Place this file at: app/api/[...all]/route.ts
 * 
 * This catches all API routes and routes them through your controllers
 */

import { createNextHandler } from 'next-controllers'
import { UserController } from '../controllers/user.controller'
import { AuthController } from '../controllers/auth.controller'
import { HealthController } from '../controllers/health.controller'

// Export HTTP method handlers for Next.js
export const { GET, POST, PUT, DELETE, PATCH } = createNextHandler({
  // Register your controllers
  controllers: [
    UserController,
    AuthController,
    HealthController,
  ],

  // Optional: Add a prefix to all routes
  // prefix: '/api/v1',

  // Optional: Configure auth provider
  // authProvider: createJwtAuthProvider(process.env.JWT_SECRET!, {
  //   extractUser: (payload) => ({
  //     userId: payload.sub,
  //     roles: payload.roles || [],
  //     permissions: payload.permissions,
  //   }),
  // }),

  // Optional: Custom error handler
  // onError: (error, request) => {
  //   console.error('API Error:', error)
  //   return Response.json(
  //     { error: 'Internal Server Error', message: error.message },
  //     { status: 500 }
  //   )
  // },
})
