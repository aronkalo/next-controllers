import { NextRequest } from 'next/server'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface RouteParams {
  [key: string]: string | string[]
}

export interface AuthContext {
  userId: string
  roles: string[]
  permissions?: string[]
  [key: string]: unknown
}

export interface RequestContext {
  request: NextRequest
  params: RouteParams
  auth?: AuthContext
  [key: string]: unknown
}

export type ControllerMethod = (
  ...args: unknown[]
) => Promise<Response> | Response

export interface Guard {
  canActivate(context: RequestContext): Promise<boolean> | boolean
}

export interface Middleware {
  run(
    context: RequestContext,
    next: () => Promise<Response>
  ): Promise<Response> | Response
}

export type AuthProvider = (
  request: NextRequest
) => Promise<AuthContext | null> | AuthContext | null
