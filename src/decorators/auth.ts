import { registry } from '../core/registry'

/**
 * Authorize decorator - requires authentication and optionally specific roles
 * @param roles - Required roles (any of the specified roles grants access)
 * @example
 * ```ts
 * @Get('/profile')
 * @Authorize()
 * getProfile() {
 *   // Requires authentication
 * }
 * 
 * @Get('/admin')
 * @Authorize('admin')
 * getAdminData() {
 *   // Requires 'admin' role
 * }
 * 
 * @Get('/content')
 * @Authorize('editor', 'admin')
 * getContent() {
 *   // Requires 'editor' OR 'admin' role
 * }
 * ```
 */
export function Authorize(...roles: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const constructor = target.constructor
    const routeMetadata = registry.getRouteMetadata(constructor, propertyKey)

    if (!routeMetadata) {
      throw new Error(
        `Route metadata not found for ${constructor.name}.${propertyKey}. Make sure to use an HTTP method decorator (@Get, @Post, etc.) before @Authorize.`
      )
    }

    routeMetadata.roles = roles

    return descriptor
  }
}
