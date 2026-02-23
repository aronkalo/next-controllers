import { registry } from './registry'
import { globalContainer } from './container'
import { compileRoute, normalizePath } from './matcher'
import type { CompiledRoute } from '../types/route'
import type { Constructor } from '../types/context'

/**
 * Load and compile all controllers
 */
export function loadControllers(
  controllers: Constructor[],
  prefix = ''
): CompiledRoute[] {
  const compiledRoutes: CompiledRoute[] = []

  for (const ControllerClass of controllers) {
    // Get or create controller instance
    const controllerInstance = globalContainer.get(ControllerClass)

    // Get controller metadata
    const controllerMetadata = registry.getControllerMetadata(ControllerClass)
    if (!controllerMetadata) {
      console.warn(
        `Controller ${ControllerClass.name} has no metadata. Did you forget the @Controller decorator?`
      )
      continue
    }

    // Get all routes for this controller
    const routes = registry.getAllRouteMetadata(ControllerClass)

    for (const routeMetadata of routes) {
      // Combine prefix, base path, and route path
      const fullPath = normalizePath(
        prefix,
        controllerMetadata.basePath,
        routeMetadata.path
      )

      // Compile the route pattern
      const { pattern, keys } = compileRoute(fullPath)

      // Get the handler method
      const handler = (controllerInstance as any)[routeMetadata.handler]
      if (typeof handler !== 'function') {
        throw new Error(
          `Handler ${routeMetadata.handler} is not a function on controller ${ControllerClass.name}`
        )
      }

      compiledRoutes.push({
        pattern,
        keys,
        method: routeMetadata.method,
        handler: handler.bind(controllerInstance),
        controllerInstance,
        metadata: routeMetadata,
        controllerMetadata,
      })
    }
  }

  // Sort routes by specificity (more specific routes first)
  compiledRoutes.sort((a, b) => {
    const aFullPath = normalizePath(
      a.controllerMetadata.basePath,
      a.metadata.path
    )
    const bFullPath = normalizePath(
      b.controllerMetadata.basePath,
      b.metadata.path
    )

    const aSegments = aFullPath.split('/').filter(Boolean)
    const bSegments = bFullPath.split('/').filter(Boolean)

    // More segments = more specific
    if (aSegments.length !== bSegments.length) {
      return bSegments.length - aSegments.length
    }

    // Count static segments (non-parameter segments)
    const aStatic = aSegments.filter((s) => !s.startsWith(':')).length
    const bStatic = bSegments.filter((s) => !s.startsWith(':')).length

    // More static segments = more specific
    if (aStatic !== bStatic) {
      return bStatic - aStatic
    }

    // Compare segment-by-segment: static before dynamic
    for (let i = 0; i < aSegments.length; i++) {
      const aIsDynamic = aSegments[i].startsWith(':')
      const bIsDynamic = bSegments[i].startsWith(':')
      if (aIsDynamic && !bIsDynamic) return 1
      if (!aIsDynamic && bIsDynamic) return -1
    }

    return 0
  })

  return compiledRoutes
}
