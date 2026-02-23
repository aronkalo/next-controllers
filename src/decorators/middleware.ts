import { registry } from '../core/registry'
import { globalContainer } from '../core/container'
import type { Guard, Middleware } from '../types/http'
import type { Constructor } from '../types/context'

/**
 * UseGuard decorator - apply guards at method level
 * @param guards - Guard classes or instances to apply to this route
 * @example
 * ```ts
 * @Get('/admin/users')
 * @UseGuard(AdminGuard)
 * getAdminUsers() {
 *   return Response.json([])
 * }
 * ```
 */
export function UseGuard(...guards: (Guard | Constructor<Guard>)[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const constructor = target.constructor
    const routeMetadata = registry.ensureRouteMetadata(constructor, propertyKey)

    const resolvedGuards = guards.map((guard) =>
      typeof guard === 'function' ? globalContainer.get(guard as Constructor<Guard>) : guard
    )

    routeMetadata.guards = [...(routeMetadata.guards || []), ...resolvedGuards]

    return descriptor
  }
}

/**
 * Use decorator - apply middleware at method level
 * @param middleware - Middleware classes or instances to apply to this route
 * @example
 * ```ts
 * @Get('/data')
 * @Use(CacheMiddleware)
 * getData() {
 *   return Response.json({ data: 'expensive' })
 * }
 * ```
 */
export function Use(...middleware: (Middleware | Constructor<Middleware>)[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const constructor = target.constructor
    const routeMetadata = registry.ensureRouteMetadata(constructor, propertyKey)

    const resolvedMiddleware = middleware.map((mw) =>
      typeof mw === 'function' ? globalContainer.get(mw as Constructor<Middleware>) : mw
    )

    routeMetadata.middleware = [
      ...(routeMetadata.middleware || []),
      ...resolvedMiddleware,
    ]

    return descriptor
  }
}
