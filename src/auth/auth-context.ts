import { NextRequest } from 'next/server'
import type { AuthContext } from '../types/http'

/**
 * Default JWT auth provider
 * Extracts JWT from Authorization header or cookies
 */
export async function createJwtAuthProvider(
  secret: string,
  options: {
    headerName?: string
    cookieName?: string
    extractUser?: (payload: any) => AuthContext | Promise<AuthContext>
  } = {}
): Promise<(request: NextRequest) => Promise<AuthContext | null>> {
  const {
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

      // Decode JWT (basic implementation - use a proper library in production)
      const payload = await verifyJwt(token, secret)
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
function defaultExtractUser(payload: any): AuthContext {
  return {
    userId: payload.sub || payload.userId || payload.id,
    roles: payload.roles || [],
    permissions: payload.permissions,
  }
}

/**
 * Basic JWT verification (use a proper library like jose or jsonwebtoken in production)
 */
async function verifyJwt(token: string, secret: string): Promise<any> {
  // This is a simplified implementation
  // In production, use a proper JWT library
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format')
  }

  const payload = JSON.parse(
    Buffer.from(parts[1], 'base64url').toString('utf-8')
  )

  // Check expiration
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new Error('Token expired')
  }

  return payload
}
