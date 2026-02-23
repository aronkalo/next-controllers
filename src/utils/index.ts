/**
 * Utility functions for next-controllers
 */

/**
 * Create a standardized API response
 */
export function createResponse<T>(
  data: T,
  options?: {
    status?: number
    headers?: Record<string, string>
  }
): Response {
  return Response.json(data, {
    status: options?.status || 200,
    headers: options?.headers,
  })
}

/**
 * Create an error response
 */
export function createErrorResponse(
  message: string,
  options?: {
    status?: number
    code?: string
    details?: unknown
  }
): Response {
  return Response.json(
    {
      error: {
        message,
        code: options?.code,
        details: options?.details,
      },
    },
    {
      status: options?.status || 500,
    }
  )
}

/**
 * Create a validation error response
 */
export function createValidationError(
  errors: Record<string, string[]>
): Response {
  return Response.json(
    {
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    },
    {
      status: 400,
    }
  )
}

/**
 * Check if a value is a constructor function
 */
export function isConstructor(value: unknown): value is new (...args: any[]) => any {
  return typeof value === 'function' && value.prototype && value.prototype.constructor === value
}

/**
 * Parse query string into object
 */
export function parseQuery(url: string): Record<string, string | string[]> {
  const searchParams = new URL(url).searchParams
  const query: Record<string, string | string[]> = {}

  searchParams.forEach((value, key) => {
    if (key in query) {
      const existing = query[key]
      query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
    } else {
      query[key] = value
    }
  })

  return query
}
