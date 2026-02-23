import type { NextRequest } from 'next/server'
import type { AuthProvider } from './http'
import type { ExceptionFilter } from '../core/exception-filter'

export interface NextControllersConfig {
  controllers: (new (...args: unknown[]) => unknown)[]
  authProvider?: AuthProvider
  prefix?: string
  /**
   * Global exception filter for custom error handling.
   * Takes priority over the default built-in filter.
   * @see DefaultExceptionFilter for the built-in fallback behavior.
   */
  exceptionFilter?: ExceptionFilter
  /**
   * @deprecated Use `exceptionFilter` instead. Kept for backwards compatibility.
   * If both `onError` and `exceptionFilter` are provided, `onError` takes priority.
   */
  onError?: (error: Error, request: NextRequest) => Response | Promise<Response>
}

export type Constructor<T = unknown> = new (...args: unknown[]) => T

export interface ServiceProvider {
  get<T>(token: Constructor<T>): T
  register<T>(token: Constructor<T>, instance?: T): void
}
