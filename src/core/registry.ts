import type { ControllerMetadata, RouteMetadata } from '../types/route'
import type { Constructor } from '../types/context'

/**
 * Metadata storage for controllers and routes
 */
class MetadataRegistry {
  private controllerMetadata = new Map<Constructor, ControllerMetadata>()
  private routeMetadata = new Map<Constructor, Map<string, RouteMetadata>>()

  /**
   * Set controller metadata
   */
  setControllerMetadata(
    target: Constructor,
    metadata: ControllerMetadata
  ): void {
    this.controllerMetadata.set(target, metadata)
  }

  /**
   * Get controller metadata
   */
  getControllerMetadata(target: Constructor): ControllerMetadata | undefined {
    return this.controllerMetadata.get(target)
  }

  /**
   * Set route metadata for a controller method
   */
  setRouteMetadata(
    target: Constructor,
    methodName: string,
    metadata: RouteMetadata
  ): void {
    if (!this.routeMetadata.has(target)) {
      this.routeMetadata.set(target, new Map())
    }
    this.routeMetadata.get(target)!.set(methodName, metadata)
  }

  /**
   * Get route metadata for a controller method
   */
  getRouteMetadata(
    target: Constructor,
    methodName: string
  ): RouteMetadata | undefined {
    return this.routeMetadata.get(target)?.get(methodName)
  }

  /**
   * Get all route metadata for a controller
   */
  getAllRouteMetadata(target: Constructor): RouteMetadata[] {
    const routes = this.routeMetadata.get(target)
    return routes ? Array.from(routes.values()) : []
  }

  /**
   * Get all registered controllers
   */
  getAllControllers(): Constructor[] {
    return Array.from(this.controllerMetadata.keys())
  }
}

// Global registry instance
export const registry = new MetadataRegistry()
