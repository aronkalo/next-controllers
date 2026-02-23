import { registry } from '../core/registry'
import type { ParamDecorator } from '../types/route'

/**
 * Add parameter decorator metadata to a route
 */
function addParamDecorator(
  target: any,
  propertyKey: string,
  parameterIndex: number,
  decorator: Omit<ParamDecorator, 'index'>
) {
  const constructor = target.constructor
  const routeMetadata = registry.getRouteMetadata(constructor, propertyKey)

  if (!routeMetadata) {
    throw new Error(
      `Route metadata not found for ${constructor.name}.${propertyKey}. Make sure to use an HTTP method decorator (@Get, @Post, etc.) before parameter decorators.`
    )
  }

  if (!routeMetadata.paramDecorators) {
    routeMetadata.paramDecorators = []
  }

  routeMetadata.paramDecorators.push({
    ...decorator,
    index: parameterIndex,
  })
}

/**
 * Body decorator - injects request body as JSON
 * @param validator - Optional Zod schema for validation
 * @example
 * ```ts
 * @Post('/users')
 * createUser(@Body() body: CreateUserDto) {
 *   return Response.json(body)
 * }
 * ```
 * @example With Zod validation
 * ```ts
 * @Post('/users')
 * createUser(@Body(CreateUserSchema) body: CreateUserDto) {
 *   return Response.json(body)
 * }
 * ```
 */
export function Body(validator?: any) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    addParamDecorator(target, propertyKey, parameterIndex, {
      type: 'body',
      validator,
    })
  }
}

/**
 * Query decorator - injects query parameter(s)
 * @param key - Query parameter name (optional, injects all if omitted)
 * @example
 * ```ts
 * @Get('/search')
 * search(@Query('q') query: string) {
 *   return Response.json({ query })
 * }
 * ```
 */
export function Query(key?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    addParamDecorator(target, propertyKey, parameterIndex, {
      type: 'query',
      key,
    })
  }
}

/**
 * Route decorator - injects route parameter(s)
 * @param key - Route parameter name (optional, injects all if omitted)
 * @example
 * ```ts
 * @Get('/users/:id')
 * getUser(@Route('id') id: string) {
 *   return Response.json({ id })
 * }
 * ```
 */
export function Route(key?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    addParamDecorator(target, propertyKey, parameterIndex, {
      type: 'route',
      key,
    })
  }
}

/**
 * Req decorator - injects the NextRequest object
 * @example
 * ```ts
 * @Get('/info')
 * getInfo(@Req() request: NextRequest) {
 *   return Response.json({ url: request.url })
 * }
 * ```
 */
export function Req() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    addParamDecorator(target, propertyKey, parameterIndex, {
      type: 'request',
    })
  }
}

/**
 * Headers decorator - injects request header(s)
 * @param key - Header name (optional, injects all if omitted)
 * @example
 * ```ts
 * @Get('/auth-info')
 * getAuthInfo(@Headers('authorization') auth: string) {
 *   return Response.json({ auth })
 * }
 * ```
 */
export function Headers(key?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    addParamDecorator(target, propertyKey, parameterIndex, {
      type: 'headers',
      key,
    })
  }
}

/**
 * Context decorator - injects the full RequestContext
 * @example
 * ```ts
 * @Get('/context')
 * getContext(@Context() ctx: RequestContext) {
 *   return Response.json({ 
 *     auth: ctx.auth,
 *     params: ctx.params 
 *   })
 * }
 * ```
 */
export function Context() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    addParamDecorator(target, propertyKey, parameterIndex, {
      type: 'context',
    })
  }
}
