import { registry } from '../core/registry'
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
    const routeMetadata = registry.getRouteMetadata(constructor, propertyKey)

    if (!routeMetadata) {
      throw new Error(
        `Route metadata not found for ${constructor.name}.${propertyKey}. Make sure to use an HTTP method decorator (@Get, @Post, etc.) before @UseGuard.`
      )
    }

    const instantiatedGuards = guards.map((guard) =>
      typeof guard === 'function' ? new guard() : guard
    )

    routeMetadata.guards = [...(routeMetadata.guards || []), ...instantiatedGuards]

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
    const routeMetadata = registry.getRouteMetadata(constructor, propertyKey)

    if (!routeMetadata) {
      throw new Error(
        `Route metadata not found for ${constructor.name}.${propertyKey}. Make sure to use an HTTP method decorator (@Get, @Post, etc.) before @Use.`
      )
    }

    const instantiatedMiddleware = middleware.map((mw) =>
      typeof mw === 'function' ? new mw() : mw
    )

    routeMetadata.middleware = [
      ...(routeMetadata.middleware || []),
      ...instantiatedMiddleware,
    ]

    return descriptor
  }
}
