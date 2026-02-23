import { registry } from '../core/registry'
import { globalContainer } from '../core/container'
import type { Guard, Middleware } from '../types/http'
import type { Constructor } from '../types/context'

/**
 * Controller decorator - marks a class as a controller with a base path
 * @param basePath - Base route path for all routes in this controller
 * @example
 * ```ts
 * @Controller('/users')
 * export class UserController {
 *   // routes...
 * }
 * ```
 */
export function Controller(basePath: string) {
  return function <T extends Constructor>(target: T) {
    const existing = registry.ensureControllerMetadata(target)
    existing.basePath = basePath
    return target
  }
}

/**
 * UseGuard decorator - apply guards at controller level
 * @param guards - Guard classes or instances to apply
 * @example
 * ```ts
 * @Controller('/admin')
 * @UseGuard(AdminGuard)
 * export class AdminController {}
 * ```
 */
export function UseGuard(...guards: (Guard | Constructor<Guard>)[]) {
  return function <T extends Constructor>(target: T) {
    const metadata = registry.ensureControllerMetadata(target)
    const resolvedGuards = guards.map((guard) =>
      typeof guard === 'function' ? globalContainer.get(guard as Constructor<Guard>) : guard
    )
    metadata.guards = [...(metadata.guards || []), ...resolvedGuards]
    return target
  }
}

/**
 * Use decorator - apply middleware at controller level
 * @param middleware - Middleware classes or instances to apply
 * @example
 * ```ts
 * @Controller('/api')
 * @Use(LoggerMiddleware)
 * export class ApiController {}
 * ```
 */
export function Use(...middleware: (Middleware | Constructor<Middleware>)[]) {
  return function <T extends Constructor>(target: T) {
    const metadata = registry.ensureControllerMetadata(target)
    const resolvedMiddleware = middleware.map((mw) =>
      typeof mw === 'function' ? globalContainer.get(mw as Constructor<Middleware>) : mw
    )
    metadata.middleware = [
      ...(metadata.middleware || []),
      ...resolvedMiddleware,
    ]
    return target
  }
}
