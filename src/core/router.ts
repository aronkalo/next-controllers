import { NextRequest, NextResponse } from 'next/server'
import { loadControllers } from './controller-loader'
import { matchRoute } from './matcher'
import type { NextControllersConfig } from '../types/context'
import type { RequestContext } from '../types/http'
import type { CompiledRoute } from '../types/route'

/**
 * Create Next.js route handlers from controllers
 */
export function createNextHandler(config: NextControllersConfig) {
  // Compile all routes at startup
  const compiledRoutes = loadControllers(config.controllers, config.prefix)

  // Create the request handler
  async function handleRequest(request: NextRequest): Promise<Response> {
    const pathname = new URL(request.url).pathname
    const method = request.method

    try {
      // Match the route
      const match = matchRoute(pathname, method, compiledRoutes)

      if (!match) {
        return NextResponse.json(
          { error: 'Route not found', path: pathname, method },
          { status: 404 }
        )
      }

      const { route, params } = match

      // Build request context
      const context: RequestContext = {
        request,
        params,
      }

      // Get auth context if provider is configured
      if (config.authProvider) {
        try {
          const authContext = await config.authProvider(request)
          if (authContext) {
            context.auth = authContext
          }
        } catch (error) {
          console.error('Auth provider error:', error)
        }
      }

      // Check controller-level guards
      if (route.controllerMetadata.guards) {
        for (const guard of route.controllerMetadata.guards) {
          const canActivate = await guard.canActivate(context)
          if (!canActivate) {
            return NextResponse.json(
              { error: 'Forbidden', message: 'Access denied by guard' },
              { status: 403 }
            )
          }
        }
      }

      // Check route-level guards
      if (route.metadata.guards) {
        for (const guard of route.metadata.guards) {
          const canActivate = await guard.canActivate(context)
          if (!canActivate) {
            return NextResponse.json(
              { error: 'Forbidden', message: 'Access denied by guard' },
              { status: 403 }
            )
          }
        }
      }

      // Check authorization (roles)
      if (route.metadata.roles && route.metadata.roles.length > 0) {
        if (!context.auth) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required' },
            { status: 401 }
          )
        }

        const hasRole = route.metadata.roles.some((role) =>
          context.auth!.roles.includes(role)
        )

        if (!hasRole) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: 'Insufficient permissions',
              requiredRoles: route.metadata.roles,
            },
            { status: 403 }
          )
        }
      }

      // Build middleware chain
      const middleware = [
        ...(route.controllerMetadata.middleware || []),
        ...(route.metadata.middleware || []),
      ]

      // Execute middleware chain
      let middlewareIndex = 0
      const executeMiddleware = async (): Promise<Response> => {
        if (middlewareIndex < middleware.length) {
          const mw = middleware[middlewareIndex++]
          return await mw.run(context, executeMiddleware)
        }

        // All middleware passed, execute the handler
        return await executeHandler(route, context, params)
      }

      return await executeMiddleware()
    } catch (error) {
      console.error('Request handler error:', error)

      if (config.onError) {
        return await config.onError(
          error instanceof Error ? error : new Error(String(error)),
          request
        )
      }

      return NextResponse.json(
        {
          error: 'Internal Server Error',
        },
        { status: 500 }
      )
    }
  }

  // Return HTTP method handlers for Next.js
  return {
    GET: (req: NextRequest) => handleRequest(req),
    POST: (req: NextRequest) => handleRequest(req),
    PUT: (req: NextRequest) => handleRequest(req),
    DELETE: (req: NextRequest) => handleRequest(req),
    PATCH: (req: NextRequest) => handleRequest(req),
  }
}

/**
 * Execute the controller handler with parameter injection
 */
async function executeHandler(
  route: CompiledRoute,
  context: RequestContext,
  params: Record<string, string>
): Promise<Response> {
  const paramDecorators = route.metadata.paramDecorators || []

  // Sort by parameter index
  const sortedDecorators = [...paramDecorators].sort((a, b) => a.index - b.index)

  // Build method arguments
  const args: unknown[] = []

  for (const decorator of sortedDecorators) {
    let value: unknown

    switch (decorator.type) {
      case 'body':
        try {
          // Use cached body to avoid consuming the stream twice
          if (context._parsedBody === undefined) {
            const text = await context.request.text()
            context._parsedBody = text ? JSON.parse(text) : {}
          }
          value = context._parsedBody
          
          // Validate with Zod if validator is provided
          if (decorator.validator && typeof decorator.validator === 'object' && 'parse' in decorator.validator) {
            value = (decorator.validator as any).parse(value)
          }
        } catch (error) {
          throw new Error(`Invalid request body: ${error}`)
        }
        break

      case 'query':
        const url = new URL(context.request.url)
        if (decorator.key) {
          value = url.searchParams.get(decorator.key)
        } else {
          value = Object.fromEntries(url.searchParams.entries())
        }
        break

      case 'route':
        value = decorator.key ? params[decorator.key] : params
        break

      case 'request':
        value = context.request
        break

      case 'headers':
        if (decorator.key) {
          value = context.request.headers.get(decorator.key)
        } else {
          value = Object.fromEntries(context.request.headers.entries())
        }
        break

      case 'context':
        value = context
        break

      default:
        value = undefined
    }

    args[decorator.index] = value
  }

  // Call the handler
  const result = await route.handler(...args)

  // Ensure we return a Response object
  if (result instanceof Response) {
    return result
  }

  // If it's not a Response, wrap it in a JSON response
  return NextResponse.json(result)
}
