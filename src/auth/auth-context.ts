import { NextRequest } from 'next/server'
import type { AuthContext } from '../types/http'

/**
 * Default JWT auth provider
 * Extracts JWT from Authorization header or cookies.
 *
 * IMPORTANT: You must provide a `verifyToken` function that performs
 * cryptographic signature validation. Use a library like `jose` or
 * `jsonwebtoken` for this purpose.
 *
 * @example
 * ```ts
 * import { jwtVerify } from 'jose'
 *
 * const authProvider = createJwtAuthProvider({
 *   verifyToken: async (token) => {
 *     const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
 *     return payload
 *   },
 * })
 * ```
 */
export function createJwtAuthProvider(
  options: {
    verifyToken: (token: string) => Promise<Record<string, unknown>> | Record<string, unknown>
    headerName?: string
    cookieName?: string
    extractUser?: (payload: Record<string, unknown>) => AuthContext | Promise<AuthContext>
  }
): (request: NextRequest) => Promise<AuthContext | null> {
  const {
    verifyToken,
    headerName = 'authorization',
    cookieName = 'token',
    extractUser = defaultExtractUser,
  } = options

  return async (request: NextRequest) => {
    try {
      let token: string | null = null

      // Try to get token from Authorization header
      const authHeader = request.headers.get(headerName)
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }

      // Try to get token from cookie
      if (!token) {
        token = request.cookies.get(cookieName)?.value || null
      }

      if (!token) {
        return null
      }

      const payload = await verifyToken(token)
      return await extractUser(payload)
    } catch (error) {
      console.error('JWT auth error:', error)
      return null
    }
  }
}

/**
 * Session-based auth provider
 * Extracts session from cookies
 */
export function createSessionAuthProvider(
  options: {
    cookieName?: string
    getSession?: (sessionId: string) => Promise<AuthContext | null>
  } = {}
): (request: NextRequest) => Promise<AuthContext | null> {
  const { cookieName = 'session', getSession } = options

  return async (request: NextRequest) => {
    try {
      const sessionId = request.cookies.get(cookieName)?.value

      if (!sessionId) {
        return null
      }

      if (getSession) {
        return await getSession(sessionId)
      }

      // Default: return basic auth context with sessionId
      return {
        userId: sessionId,
        roles: [],
      }
    } catch (error) {
      console.error('Session auth error:', error)
      return null
    }
  }
}

/**
 * Custom auth provider builder
 */
export function createCustomAuthProvider(
  provider: (request: NextRequest) => Promise<AuthContext | null> | AuthContext | null
): (request: NextRequest) => Promise<AuthContext | null> {
  return async (request: NextRequest) => {
    try {
      return await provider(request)
    } catch (error) {
      console.error('Custom auth error:', error)
      return null
    }
  }
}

/**
 * Default user extractor from JWT payload
 */
function defaultExtractUser(payload: Record<string, unknown>): AuthContext {
  return {
    userId: String(payload.sub || payload.userId || payload.id || ''),
    roles: Array.isArray(payload.roles) ? payload.roles : [],
    permissions: Array.isArray(payload.permissions) ? payload.permissions : undefined,
  }
}
