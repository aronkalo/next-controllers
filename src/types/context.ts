import type { NextRequest } from 'next/server'
import type { AuthProvider } from './http'

export interface NextControllersConfig {
  controllers: (new (...args: unknown[]) => unknown)[]
  authProvider?: AuthProvider
  prefix?: string
  onError?: (error: Error, request: NextRequest) => Response | Promise<Response>
}

export type Constructor<T = unknown> = new (...args: unknown[]) => T

export interface ServiceProvider {
  get<T>(token: Constructor<T>): T
  register<T>(token: Constructor<T>, instance?: T): void
}
