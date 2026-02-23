import type { Middleware, RequestContext } from 'next-controllers'

/**
 * Logger Middleware
 * Logs request details and response time
 */
export class LoggerMiddleware implements Middleware {
  async run(
    context: RequestContext,
    next: () => Promise<Response>
  ): Promise<Response> {
    const start = Date.now()
    const { method, url } = context.request

    console.log(`[${new Date().toISOString()}] ${method} ${url}`)

    try {
      const response = await next()
      const duration = Date.now() - start

      console.log(
        `[${new Date().toISOString()}] ${method} ${url} - ${response.status} (${duration}ms)`
      )

      return response
    } catch (error) {
      const duration = Date.now() - start
      console.error(
        `[${new Date().toISOString()}] ${method} ${url} - ERROR (${duration}ms)`,
        error
      )
      throw error
    }
  }
}
