import { registry } from '../core/registry'
import type { HttpMethod } from '../types/http'

/**
 * Create an HTTP method decorator
 */
function createMethodDecorator(method: HttpMethod) {
  return function (path: string = '/') {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const constructor = target.constructor

      registry.setRouteMetadata(constructor, propertyKey, {
        path,
        method,
        handler: propertyKey,
      })

      return descriptor
    }
  }
}

/**
 * GET method decorator
 * @param path - Route path (relative to controller base path)
 * @example
 * ```ts
 * @Get('/users')
 * getUsers() {
 *   return Response.json([])
 * }
 * ```
 */
export const Get = createMethodDecorator('GET')

/**
 * POST method decorator
 * @param path - Route path (relative to controller base path)
 * @example
 * ```ts
 * @Post('/users')
 * createUser(@Body() body: CreateUserDto) {
 *   return Response.json(body)
 * }
 * ```
 */
export const Post = createMethodDecorator('POST')

/**
 * PUT method decorator
 * @param path - Route path (relative to controller base path)
 * @example
 * ```ts
 * @Put('/users/:id')
 * updateUser(@Route('id') id: string, @Body() body: UpdateUserDto) {
 *   return Response.json({ id, ...body })
 * }
 * ```
 */
export const Put = createMethodDecorator('PUT')

/**
 * DELETE method decorator
 * @param path - Route path (relative to controller base path)
 * @example
 * ```ts
 * @Delete('/users/:id')
 * deleteUser(@Route('id') id: string) {
 *   return Response.json({ deleted: true })
 * }
 * ```
 */
export const Delete = createMethodDecorator('DELETE')

/**
 * PATCH method decorator
 * @param path - Route path (relative to controller base path)
 * @example
 * ```ts
 * @Patch('/users/:id')
 * patchUser(@Route('id') id: string, @Body() body: Partial<UserDto>) {
 *   return Response.json({ id, ...body })
 * }
 * ```
 */
export const Patch = createMethodDecorator('PATCH')
