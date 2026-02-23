import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createNextHandler } from '../core/router'
import { Controller } from '../decorators/controller'
import { Get, Post } from '../decorators/http-methods'
import { Body, Query, Route, Context, Req, Headers } from '../decorators/params'
import { Authorize } from '../decorators/auth'
import { UseGuard, Use } from '../decorators/middleware'
import { NotFoundException, ForbiddenException } from '../core/http-exception'
import type { ExceptionFilter } from '../core/exception-filter'
import type { Guard, Middleware, RequestContext, AuthContext } from '../types/http'

// --- Test controllers ---

@Controller('/users')
class UserController {
  @Get('/')
  list() {
    return [{ id: 1, name: 'Alice' }]
  }

  @Get('/:id')
  getById(@Route('id') id: string) {
    if (id === '999') {
      throw new NotFoundException(`User ${id} not found`)
    }
    return { id, name: 'Alice' }
  }

  @Post('/')
  create(@Body() body: any) {
    return { created: true, ...body }
  }

  @Get('/search')
  search(@Query('q') q: string) {
    return { query: q }
  }
}

@Controller('/protected')
class ProtectedController {
  @Get('/profile')
  @Authorize()
  profile(@Context() ctx: RequestContext) {
    return { userId: ctx.auth!.userId }
  }

  @Get('/admin')
  @Authorize('admin')
  adminOnly() {
    return { admin: true }
  }

  @Get('/multi')
  @Authorize('editor', 'admin')
  multiRole() {
    return { access: true }
  }
}

// --- Test guard ---

class BlockingGuard implements Guard {
  canActivate() {
    return false
  }
}

class PassingGuard implements Guard {
  canActivate() {
    return true
  }
}

@Controller('/guarded')
class GuardedController {
  @Get('/blocked')
  @UseGuard(BlockingGuard)
  blocked() {
    return { reached: true }
  }

  @Get('/allowed')
  @UseGuard(PassingGuard)
  allowed() {
    return { reached: true }
  }
}

// --- Test middleware ---

  class AddHeaderMiddleware implements Middleware {
    async run(ctx: RequestContext, next: () => Promise<Response>) {
      const response = await next()
      const headers = new Headers(response.headers)
      headers.set('x-custom', 'middleware-ran')
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }
  }

@Controller('/mw')
class MiddlewareController {
  @Get('/test')
  @Use(AddHeaderMiddleware)
  withMiddleware() {
    return { ok: true }
  }
}

// --- Test handler that throws ---

@Controller('/errors')
class ErrorController {
  @Get('/throw')
  throwError() {
    throw new Error('Something broke')
  }

  @Get('/http-error')
  httpError() {
    throw new ForbiddenException('Custom forbidden', { reason: 'test' })
  }
}

// --- Helper ---

function makeRequest(path: string, method = 'GET', options?: RequestInit) {
  return new NextRequest(`http://localhost${path}`, { method, ...options })
}

const authProvider = async (req: NextRequest): Promise<AuthContext | null> => {
  const header = req.headers.get('authorization')
  if (header === 'Bearer admin-token') {
    return { userId: 'admin-1', roles: ['admin'] }
  }
  if (header === 'Bearer user-token') {
    return { userId: 'user-1', roles: ['user'] }
  }
  return null
}

// --- Tests ---

describe('Router - basic routing', () => {
  const handler = createNextHandler({
    controllers: [UserController],
  })

  it('handles GET requests', async () => {
    const res = await handler.GET(makeRequest('/users'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([{ id: 1, name: 'Alice' }])
  })

  it('handles route params', async () => {
    const res = await handler.GET(makeRequest('/users/42'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('42')
  })

  it('handles POST with body', async () => {
    const res = await handler.POST(
      makeRequest('/users', 'POST', {
        body: JSON.stringify({ name: 'Bob' }),
        headers: { 'content-type': 'application/json' },
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.created).toBe(true)
    expect(body.name).toBe('Bob')
  })

  it('handles query parameters', async () => {
    const res = await handler.GET(makeRequest('/users/search?q=test'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.query).toBe('test')
  })

  it('returns 404 for unknown routes', async () => {
    const res = await handler.GET(makeRequest('/nonexistent'))
    expect(res.status).toBe(404)
  })
})

describe('Router - @Authorize', () => {
  const handler = createNextHandler({
    controllers: [ProtectedController],
    authProvider,
  })

  it('@Authorize() returns 401 when unauthenticated', async () => {
    const res = await handler.GET(makeRequest('/protected/profile'))
    expect(res.status).toBe(401)
  })

  it('@Authorize() allows authenticated users', async () => {
    const res = await handler.GET(
      makeRequest('/protected/profile', 'GET', {
        headers: { authorization: 'Bearer user-token' },
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.userId).toBe('user-1')
  })

  it('@Authorize("admin") returns 401 when unauthenticated', async () => {
    const res = await handler.GET(makeRequest('/protected/admin'))
    expect(res.status).toBe(401)
  })

  it('@Authorize("admin") returns 403 for wrong role', async () => {
    const res = await handler.GET(
      makeRequest('/protected/admin', 'GET', {
        headers: { authorization: 'Bearer user-token' },
      })
    )
    expect(res.status).toBe(403)
  })

  it('@Authorize("admin") allows correct role', async () => {
    const res = await handler.GET(
      makeRequest('/protected/admin', 'GET', {
        headers: { authorization: 'Bearer admin-token' },
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.admin).toBe(true)
  })

  it('@Authorize("editor", "admin") allows any matching role', async () => {
    const res = await handler.GET(
      makeRequest('/protected/multi', 'GET', {
        headers: { authorization: 'Bearer admin-token' },
      })
    )
    expect(res.status).toBe(200)
  })
})

describe('Router - Guards', () => {
  const handler = createNextHandler({
    controllers: [GuardedController],
  })

  it('blocking guard returns 403', async () => {
    const res = await handler.GET(makeRequest('/guarded/blocked'))
    expect(res.status).toBe(403)
  })

  it('passing guard allows through', async () => {
    const res = await handler.GET(makeRequest('/guarded/allowed'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.reached).toBe(true)
  })
})

describe('Router - Middleware', () => {
  const handler = createNextHandler({
    controllers: [MiddlewareController],
  })

  it('middleware executes and modifies response', async () => {
    const res = await handler.GET(makeRequest('/mw/test'))
    expect(res.status).toBe(200)
    expect(res.headers.get('x-custom')).toBe('middleware-ran')
  })
})

describe('Router - Exception handling', () => {
  it('HttpException is caught by DefaultExceptionFilter', async () => {
    const handler = createNextHandler({
      controllers: [UserController],
    })
    const res = await handler.GET(makeRequest('/users/999'))
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('User 999 not found')
  })

  it('HttpException with details is forwarded', async () => {
    const handler = createNextHandler({
      controllers: [ErrorController],
    })
    const res = await handler.GET(makeRequest('/errors/http-error'))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.details).toEqual({ reason: 'test' })
  })

  it('unknown errors return 500 without leaking details', async () => {
    const handler = createNextHandler({
      controllers: [ErrorController],
    })
    const res = await handler.GET(makeRequest('/errors/throw'))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Internal Server Error')
    expect(body.message).toBeUndefined()
  })

  it('custom exceptionFilter is used', async () => {
    const customFilter: ExceptionFilter = {
      catch: async (error) => {
        return new Response(
          JSON.stringify({ custom: true, msg: error.message }),
          { status: 422, headers: { 'content-type': 'application/json' } }
        )
      },
    }
    const handler = createNextHandler({
      controllers: [ErrorController],
      exceptionFilter: customFilter,
    })
    const res = await handler.GET(makeRequest('/errors/throw'))
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.custom).toBe(true)
  })

  it('onError takes priority over exceptionFilter', async () => {
    const customFilter: ExceptionFilter = {
      catch: async () =>
        new Response('filter', { status: 422 }),
    }
    const handler = createNextHandler({
      controllers: [ErrorController],
      exceptionFilter: customFilter,
      onError: async (error) =>
        new Response(JSON.stringify({ legacy: true }), {
          status: 503,
          headers: { 'content-type': 'application/json' },
        }),
    })
    const res = await handler.GET(makeRequest('/errors/throw'))
    // onError should win
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.legacy).toBe(true)
  })
})

// --- Zod body validation ---

const FakeZodSchema = {
  parse(value: unknown) {
    const obj = value as Record<string, unknown>
    if (!obj.name || typeof obj.name !== 'string') {
      const err = new Error('Validation') as any
      err.name = 'ZodError'
      err.issues = [{ path: ['name'], message: 'Required' }]
      throw err
    }
    return obj
  },
}

@Controller('/validated')
class ValidatedController {
  @Post('/')
  create(@Body(FakeZodSchema) body: any) {
    return { ok: true, body }
  }
}

// --- Raw Response ---

@Controller('/raw')
class RawResponseController {
  @Get('/')
  rawResponse() {
    return new Response('plain text', {
      status: 201,
      headers: { 'content-type': 'text/plain' },
    })
  }
}

// --- Query/Route/Headers without key ---

@Controller('/params-full')
class FullParamsController {
  @Get('/query')
  allQuery(@Query() q: any) {
    return q
  }

  @Get('/:a/:b')
  allRoute(@Route() params: any) {
    return params
  }

  @Get('/heads')
  allHeaders(@Headers() h: any) {
    return { has: !!h }
  }
}

// --- Controller-level guards & middleware ---

class ControllerGuard implements Guard {
  canActivate() {
    return true
  }
}

class ControllerMiddleware implements Middleware {
  async run(_ctx: RequestContext, next: () => Promise<Response>) {
    const res = await next()
    const headers = new Headers(res.headers)
    headers.set('x-ctrl-mw', 'yes')
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    })
  }
}

@Controller('/ctrl-level')
@UseGuard(ControllerGuard)
@Use(ControllerMiddleware)
class ControllerLevelController {
  @Get('/')
  index() {
    return { ctrl: true }
  }
}

describe('Router - @Body with Zod validation', () => {
  const handler = createNextHandler({ controllers: [ValidatedController] })

  it('passes when body is valid', async () => {
    const res = await handler.POST(
      makeRequest('/validated', 'POST', {
        body: JSON.stringify({ name: 'Alice' }),
        headers: { 'content-type': 'application/json' },
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('returns 400 when Zod validation fails', async () => {
    const res = await handler.POST(
      makeRequest('/validated', 'POST', {
        body: JSON.stringify({}),
        headers: { 'content-type': 'application/json' },
      })
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation failed')
    expect(body.details).toHaveLength(1)
  })
})

describe('Router - raw Response passthrough', () => {
  const handler = createNextHandler({ controllers: [RawResponseController] })

  it('returns raw Response without wrapping in JSON', async () => {
    const res = await handler.GET(makeRequest('/raw'))
    expect(res.status).toBe(201)
    const text = await res.text()
    expect(text).toBe('plain text')
  })
})

describe('Router - param decorators without key', () => {
  const handler = createNextHandler({ controllers: [FullParamsController] })

  it('@Query() without key returns all query params', async () => {
    const res = await handler.GET(makeRequest('/params-full/query?a=1&b=2'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.a).toBe('1')
    expect(body.b).toBe('2')
  })

  it('@Route() without key returns all route params', async () => {
    const res = await handler.GET(makeRequest('/params-full/x/y'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.a).toBe('x')
    expect(body.b).toBe('y')
  })

  it('@Headers() without key returns all headers as object', async () => {
    const res = await handler.GET(makeRequest('/params-full/heads'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.has).toBe(true)
  })
})

describe('Router - controller-level guards & middleware', () => {
  const handler = createNextHandler({ controllers: [ControllerLevelController] })

  it('controller-level guard and middleware execute', async () => {
    const res = await handler.GET(makeRequest('/ctrl-level'))
    expect(res.status).toBe(200)
    expect(res.headers.get('x-ctrl-mw')).toBe('yes')
  })
})

describe('Router - Body caching', () => {
  // Two @Body decorators on the same method should not fail
  @Controller('/double-body')
  class DoubleBodyController {
    @Post('/')
    handle(@Body() body1: any, @Body() body2: any) {
      return { same: JSON.stringify(body1) === JSON.stringify(body2) }
    }
  }

  it('reads body twice without error', async () => {
    const handler = createNextHandler({
      controllers: [DoubleBodyController],
    })
    const res = await handler.POST(
      makeRequest('/double-body', 'POST', {
        body: JSON.stringify({ x: 1 }),
        headers: { 'content-type': 'application/json' },
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.same).toBe(true)
  })
})
