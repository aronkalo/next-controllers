import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import {
  createJwtAuthProvider,
  createSessionAuthProvider,
  createCustomAuthProvider,
} from '../auth/auth-context'

describe('createJwtAuthProvider', () => {
  const mockVerify = async (token: string) => {
    if (token === 'valid-token') {
      return { sub: 'user-1', roles: ['admin'], permissions: ['read'] }
    }
    throw new Error('Invalid token')
  }

  const provider = createJwtAuthProvider({ verifyToken: mockVerify })

  it('extracts token from Authorization header', async () => {
    const request = new NextRequest('http://localhost/api', {
      headers: { authorization: 'Bearer valid-token' },
    })
    const result = await provider(request)
    expect(result).not.toBeNull()
    expect(result!.userId).toBe('user-1')
    expect(result!.roles).toEqual(['admin'])
  })

  it('returns null when no token is present', async () => {
    const request = new NextRequest('http://localhost/api')
    const result = await provider(request)
    expect(result).toBeNull()
  })

  it('returns null for invalid tokens', async () => {
    const request = new NextRequest('http://localhost/api', {
      headers: { authorization: 'Bearer bad-token' },
    })
    const result = await provider(request)
    expect(result).toBeNull()
  })

  it('supports custom extractUser', async () => {
    const customProvider = createJwtAuthProvider({
      verifyToken: mockVerify,
      extractUser: (payload) => ({
        userId: `custom-${payload.sub}`,
        roles: [],
      }),
    })
    const request = new NextRequest('http://localhost/api', {
      headers: { authorization: 'Bearer valid-token' },
    })
    const result = await customProvider(request)
    expect(result!.userId).toBe('custom-user-1')
  })

  it('supports custom header name', async () => {
    const customProvider = createJwtAuthProvider({
      verifyToken: mockVerify,
      headerName: 'x-token',
    })
    const request = new NextRequest('http://localhost/api', {
      headers: { 'x-token': 'Bearer valid-token' },
    })
    const result = await customProvider(request)
    expect(result).not.toBeNull()
  })
})

describe('createSessionAuthProvider', () => {
  it('returns basic auth context from session cookie', async () => {
    const provider = createSessionAuthProvider()
    const request = new NextRequest('http://localhost/api', {
      headers: { cookie: 'session=sess-123' },
    })
    const result = await provider(request)
    expect(result).not.toBeNull()
    expect(result!.userId).toBe('sess-123')
  })

  it('returns null when no session cookie', async () => {
    const provider = createSessionAuthProvider()
    const request = new NextRequest('http://localhost/api')
    const result = await provider(request)
    expect(result).toBeNull()
  })

  it('delegates to custom getSession function', async () => {
    const provider = createSessionAuthProvider({
      getSession: async (id) => ({
        userId: `resolved-${id}`,
        roles: ['user'],
      }),
    })
    const request = new NextRequest('http://localhost/api', {
      headers: { cookie: 'session=abc' },
    })
    const result = await provider(request)
    expect(result!.userId).toBe('resolved-abc')
  })
})

describe('createCustomAuthProvider', () => {
  it('delegates to the provided function', async () => {
    const provider = createCustomAuthProvider(async (req) => ({
      userId: 'custom',
      roles: ['admin'],
    }))
    const request = new NextRequest('http://localhost/api')
    const result = await provider(request)
    expect(result!.userId).toBe('custom')
  })

  it('returns null on error without throwing', async () => {
    const provider = createCustomAuthProvider(async () => {
      throw new Error('auth failed')
    })
    const request = new NextRequest('http://localhost/api')
    const result = await provider(request)
    expect(result).toBeNull()
  })
})
