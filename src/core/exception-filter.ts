import { NextResponse } from 'next/server'
import { HttpException } from './http-exception'
import type { RequestContext } from '../types/http'

/**
 * Interface for custom exception filters.
 * Implement this to customize how errors are converted to HTTP responses.
 *
 * @example
 * ```ts
 * class MyExceptionFilter implements ExceptionFilter {
 *   catch(error: Error, context: RequestContext): Response {
 *     if (error instanceof HttpException) {
 *       return NextResponse.json(
 *         { message: error.message, code: error.statusCode },
 *         { status: error.statusCode }
 *       )
 *     }
 *     // Log to external service
 *     myLogger.error(error)
 *     return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
 *   }
 * }
 * ```
 */
export interface ExceptionFilter {
  catch(error: Error, context: RequestContext): Promise<Response> | Response
}

/**
 * Default exception filter that ships with the package.
 * Handles HttpException, ZodError, body parse errors, and unknown errors.
 * Never leaks internal error details to clients for non-HttpException errors.
 */
export class DefaultExceptionFilter implements ExceptionFilter {
  catch(error: Error, context: RequestContext): Response {
    console.error(
      `[next-controllers] Unhandled exception on ${context.request.method} ${context.request.url}:`,
      error
    )

    // Known HTTP exceptions thrown via HttpException or its subclasses
    if (error instanceof HttpException) {
      return NextResponse.json(
        {
          error: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
        { status: error.statusCode }
      )
    }

    // Zod validation errors (duck-typed to avoid hard dependency)
    if (error.name === 'ZodError' && 'issues' in error) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: (error as any).issues,
        },
        { status: 400 }
      )
    }

    // Body parse errors
    if (error.message.startsWith('Invalid request body')) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Fallback: never leak internal details
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
