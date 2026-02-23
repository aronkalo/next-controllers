import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { DefaultExceptionFilter } from '../core/exception-filter'
import type { ExceptionFilter } from '../core/exception-filter'
import {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '../core/http-exception'
import type { RequestContext } from '../types/http'

function makeContext(): RequestContext {
  return {
    request: new NextRequest('http://localhost/test', { method: 'GET' }),
    params: {},
  }
}

describe('DefaultExceptionFilter', () => {
  const filter = new DefaultExceptionFilter()
  const ctx = makeContext()

  it('returns correct status for HttpException', async () => {
    const error = new HttpException(418, "I'm a teapot")
    const res = filter.catch(error, ctx)
    expect(res.status).toBe(418)
    const body = await res.json() as any
    expect(body.error).toBe("I'm a teapot")
  })

  it('includes details when provided', async () => {
    const error = new BadRequestException('Invalid input', { field: 'email' })
    const res = filter.catch(error, ctx)
    expect(res.status).toBe(400)
    const body = await res.json() as any
    expect(body.details).toEqual({ field: 'email' })
  })

  it('omits details when not provided', async () => {
    const error = new NotFoundException()
    const res = filter.catch(error, ctx)
    expect(res.status).toBe(404)
    const body = await res.json() as any
    expect(body.details).toBeUndefined()
  })

  it('handles ZodError as 400', async () => {
    // Duck-typed ZodError
    const error = Object.assign(new Error('Validation'), {
      name: 'ZodError',
      issues: [{ path: ['name'], message: 'Required' }],
    })
    const res = filter.catch(error, ctx)
    expect(res.status).toBe(400)
    const body = await res.json() as any
    expect(body.error).toBe('Validation failed')
    expect(body.details).toHaveLength(1)
  })

  it('handles body parse errors as 400', async () => {
    const error = new Error('Invalid request body: SyntaxError')
    const res = filter.catch(error, ctx)
    expect(res.status).toBe(400)
  })

  it('returns 500 for unknown errors without leaking details', async () => {
    const error = new Error('Database connection failed')
    const res = filter.catch(error, ctx)
    expect(res.status).toBe(500)
    const body = await res.json() as any
    expect(body.error).toBe('Internal Server Error')
    expect(body.message).toBeUndefined()
  })
})

describe('HttpException subclasses', () => {
  it('BadRequestException has status 400', () => {
    const e = new BadRequestException()
    expect(e.statusCode).toBe(400)
    expect(e.message).toBe('Bad Request')
  })

  it('UnauthorizedException has status 401', () => {
    const e = new UnauthorizedException()
    expect(e.statusCode).toBe(401)
  })

  it('ForbiddenException has status 403', () => {
    const e = new ForbiddenException()
    expect(e.statusCode).toBe(403)
  })

  it('NotFoundException has status 404', () => {
    const e = new NotFoundException()
    expect(e.statusCode).toBe(404)
  })

  it('ConflictException has status 409', () => {
    const e = new ConflictException()
    expect(e.statusCode).toBe(409)
  })

  it('InternalServerErrorException has status 500', () => {
    const e = new InternalServerErrorException()
    expect(e.statusCode).toBe(500)
  })

  it('accepts custom message and details', () => {
    const e = new BadRequestException('Email invalid', ['email'])
    expect(e.message).toBe('Email invalid')
    expect(e.details).toEqual(['email'])
  })
})

describe('Custom ExceptionFilter', () => {
  it('overrides default behavior', async () => {
    const customFilter: ExceptionFilter = {
      catch(error: Error) {
        return new Response(JSON.stringify({ custom: true, msg: error.message }), {
          status: 422,
          headers: { 'content-type': 'application/json' },
        })
      },
    }

    const res = await customFilter.catch(new Error('test'), makeContext())
    expect(res.status).toBe(422)
    const body = await res.json() as any
    expect(body.custom).toBe(true)
  })
})
