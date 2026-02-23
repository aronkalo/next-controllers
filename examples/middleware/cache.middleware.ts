import type { Middleware, RequestContext } from 'next-controllers'

/**
 * Simple in-memory cache middleware
 * For production, use Redis or another distributed cache
 */
export class CacheMiddleware implements Middleware {
  private cache = new Map<string, { data: Response; expiry: number }>()

  constructor(private ttlSeconds: number = 60) {}

  async run(
    context: RequestContext,
    next: () => Promise<Response>
  ): Promise<Response> {
    // Only cache GET requests
    if (context.request.method !== 'GET') {
      return await next()
    }

    const cacheKey = context.request.url

    // Check if cached
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() < cached.expiry) {
      console.log(`[Cache] HIT: ${cacheKey}`)
      return cached.data.clone()
    }

    console.log(`[Cache] MISS: ${cacheKey}`)

    // Execute request
    const response = await next()

    // Cache successful responses
    if (response.ok) {
      this.cache.set(cacheKey, {
        data: response.clone(),
        expiry: Date.now() + this.ttlSeconds * 1000,
      })

      // Clean up expired entries periodically
      this.cleanupExpired()
    }

    return response
  }

  private cleanupExpired() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now >= value.expiry) {
        this.cache.delete(key)
      }
    }
  }
}
