import type { Middleware, RequestContext } from 'next-controllers'

/**
 * CORS Middleware
 * Adds CORS headers to responses
 */
export class CorsMiddleware implements Middleware {
  constructor(
    private options: {
      origin?: string
      methods?: string[]
      allowedHeaders?: string[]
      credentials?: boolean
    } = {}
  ) {}

  async run(
    context: RequestContext,
    next: () => Promise<Response>
  ): Promise<Response> {
    const response = await next()

    // Clone the response to add headers
    const headers = new Headers(response.headers)

    headers.set(
      'Access-Control-Allow-Origin',
      this.options.origin || '*'
    )

    if (this.options.methods) {
      headers.set(
        'Access-Control-Allow-Methods',
        this.options.methods.join(', ')
      )
    }

    if (this.options.allowedHeaders) {
      headers.set(
        'Access-Control-Allow-Headers',
        this.options.allowedHeaders.join(', ')
      )
    }

    if (this.options.credentials) {
      headers.set('Access-Control-Allow-Credentials', 'true')
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}
