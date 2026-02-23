import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { RoleGuard, PermissionGuard, AuthenticatedGuard } from '../auth/role-guard'
import type { RequestContext } from '../types/http'

function makeContext(auth?: { userId: string; roles: string[]; permissions?: string[] }): RequestContext {
  return {
    request: new NextRequest('http://localhost/test', { method: 'GET' }),
    params: {},
    auth: auth || undefined,
  }
}

describe('RoleGuard', () => {
  it('denies access when not authenticated', async () => {
    const guard = new RoleGuard(['admin'])
    expect(await guard.canActivate(makeContext())).toBe(false)
  })

  it('allows access when no roles required', async () => {
    const guard = new RoleGuard([])
    expect(await guard.canActivate(makeContext({ userId: '1', roles: [] }))).toBe(true)
  })

  it('allows access when user has required role', async () => {
    const guard = new RoleGuard(['admin'])
    expect(await guard.canActivate(makeContext({ userId: '1', roles: ['admin'] }))).toBe(true)
  })

  it('allows access when user has any of the required roles', async () => {
    const guard = new RoleGuard(['admin', 'editor'])
    expect(await guard.canActivate(makeContext({ userId: '1', roles: ['editor'] }))).toBe(true)
  })

  it('denies access when user lacks required role', async () => {
    const guard = new RoleGuard(['admin'])
    expect(await guard.canActivate(makeContext({ userId: '1', roles: ['user'] }))).toBe(false)
  })
})

describe('PermissionGuard', () => {
  it('denies access when not authenticated', async () => {
    const guard = new PermissionGuard(['read'])
    expect(await guard.canActivate(makeContext())).toBe(false)
  })

  it('denies access when no permissions property exists', async () => {
    const guard = new PermissionGuard(['read'])
    expect(await guard.canActivate(makeContext({ userId: '1', roles: [] }))).toBe(false)
  })

  it('allows access when no permissions required', async () => {
    const guard = new PermissionGuard([])
    expect(await guard.canActivate(makeContext({ userId: '1', roles: [], permissions: [] }))).toBe(true)
  })

  it('allows access when user has required permission', async () => {
    const guard = new PermissionGuard(['write'])
    expect(await guard.canActivate(makeContext({ userId: '1', roles: [], permissions: ['write'] }))).toBe(true)
  })

  it('denies access when user lacks required permission', async () => {
    const guard = new PermissionGuard(['delete'])
    expect(await guard.canActivate(makeContext({ userId: '1', roles: [], permissions: ['read'] }))).toBe(false)
  })
})

describe('AuthenticatedGuard', () => {
  it('denies access when not authenticated', async () => {
    const guard = new AuthenticatedGuard()
    expect(await guard.canActivate(makeContext())).toBe(false)
  })

  it('allows access when authenticated', async () => {
    const guard = new AuthenticatedGuard()
    expect(await guard.canActivate(makeContext({ userId: '1', roles: [] }))).toBe(true)
  })
})
