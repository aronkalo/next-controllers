import { describe, it, expect } from 'vitest'
import { registry } from '../core/registry'
import { Controller } from '../decorators/controller'
import { Get, Post, Put, Delete, Patch } from '../decorators/http-methods'
import { Body, Query, Route, Req, Header, Context } from '../decorators/params'
import { Authorize } from '../decorators/auth'
import { UseGuard, Use } from '../decorators/middleware'
import type { Guard, Middleware, RequestContext } from '../types/http'

// --- Test guard and middleware ---

class TestGuard implements Guard {
  canActivate() {
    return true
  }
}

class TestMiddleware implements Middleware {
  run(_ctx: RequestContext, next: () => Promise<Response>) {
    return next()
  }
}

// --- Controller decorator ---

describe('@Controller', () => {
  it('sets basePath metadata', () => {
    @Controller('/items')
    class ItemController {}

    const meta = registry.getControllerMetadata(ItemController)
    expect(meta).toBeDefined()
    expect(meta!.basePath).toBe('/items')
  })
})

// --- HTTP method decorators ---

describe('HTTP method decorators', () => {
  @Controller('/methods')
  class MethodController {
    @Get('/all')
    getAll() {}

    @Post('/create')
    create() {}

    @Put('/update')
    update() {}

    @Delete('/remove')
    remove() {}

    @Patch('/patch')
    patch() {}
  }

  it('@Get sets GET method and path', () => {
    const meta = registry.getRouteMetadata(MethodController, 'getAll')
    expect(meta!.method).toBe('GET')
    expect(meta!.path).toBe('/all')
  })

  it('@Post sets POST method and path', () => {
    const meta = registry.getRouteMetadata(MethodController, 'create')
    expect(meta!.method).toBe('POST')
    expect(meta!.path).toBe('/create')
  })

  it('@Put sets PUT method and path', () => {
    const meta = registry.getRouteMetadata(MethodController, 'update')
    expect(meta!.method).toBe('PUT')
    expect(meta!.path).toBe('/update')
  })

  it('@Delete sets DELETE method and path', () => {
    const meta = registry.getRouteMetadata(MethodController, 'remove')
    expect(meta!.method).toBe('DELETE')
    expect(meta!.path).toBe('/remove')
  })

  it('@Patch sets PATCH method and path', () => {
    const meta = registry.getRouteMetadata(MethodController, 'patch')
    expect(meta!.method).toBe('PATCH')
    expect(meta!.path).toBe('/patch')
  })
})

// --- Param decorators ---

describe('Parameter decorators', () => {
  @Controller('/params')
  class ParamController {
    @Post('/body')
    withBody(@Body() body: any) {}

    @Get('/search')
    withQuery(@Query('q') q: string) {}

    @Get('/:id')
    withRoute(@Route('id') id: string) {}

    @Get('/req')
    withReq(@Req() req: any) {}

    @Get('/headers')
    withHeaders(@Header('content-type') ct: string) {}

    @Get('/ctx')
    withContext(@Context() ctx: any) {}
  }

  it('@Body adds body param decorator', () => {
    const meta = registry.getRouteMetadata(ParamController, 'withBody')
    expect(meta!.paramDecorators).toHaveLength(1)
    expect(meta!.paramDecorators![0].type).toBe('body')
  })

  it('@Query adds query param decorator with key', () => {
    const meta = registry.getRouteMetadata(ParamController, 'withQuery')
    expect(meta!.paramDecorators![0].type).toBe('query')
    expect(meta!.paramDecorators![0].key).toBe('q')
  })

  it('@Route adds route param decorator with key', () => {
    const meta = registry.getRouteMetadata(ParamController, 'withRoute')
    expect(meta!.paramDecorators![0].type).toBe('route')
    expect(meta!.paramDecorators![0].key).toBe('id')
  })

  it('@Req adds request param decorator', () => {
    const meta = registry.getRouteMetadata(ParamController, 'withReq')
    expect(meta!.paramDecorators![0].type).toBe('request')
  })

  it('@Headers adds headers param decorator', () => {
    const meta = registry.getRouteMetadata(ParamController, 'withHeaders')
    expect(meta!.paramDecorators![0].type).toBe('headers')
    expect(meta!.paramDecorators![0].key).toBe('content-type')
  })

  it('@Context adds context param decorator', () => {
    const meta = registry.getRouteMetadata(ParamController, 'withContext')
    expect(meta!.paramDecorators![0].type).toBe('context')
  })
})

// --- @Authorize ---

describe('@Authorize', () => {
  @Controller('/auth')
  class AuthController {
    @Get('/public')
    @Authorize()
    authed() {}

    @Get('/admin')
    @Authorize('admin')
    adminOnly() {}

    @Get('/multi')
    @Authorize('editor', 'admin')
    multiRole() {}
  }

  it('sets empty roles for bare @Authorize()', () => {
    const meta = registry.getRouteMetadata(AuthController, 'authed')
    expect(meta!.roles).toBeDefined()
    expect(meta!.roles).toEqual([])
  })

  it('sets roles for @Authorize("admin")', () => {
    const meta = registry.getRouteMetadata(AuthController, 'adminOnly')
    expect(meta!.roles).toEqual(['admin'])
  })

  it('sets multiple roles', () => {
    const meta = registry.getRouteMetadata(AuthController, 'multiRole')
    expect(meta!.roles).toEqual(['editor', 'admin'])
  })
})

// --- @UseGuard / @Use ---

describe('@UseGuard and @Use', () => {
  @Controller('/guarded')
  class GuardedController {
    @Get('/protected')
    @UseGuard(TestGuard)
    protectedRoute() {}

    @Get('/middleware')
    @Use(TestMiddleware)
    middlewareRoute() {}
  }

  it('@UseGuard adds guards to route metadata', () => {
    const meta = registry.getRouteMetadata(GuardedController, 'protectedRoute')
    expect(meta!.guards).toHaveLength(1)
    expect(meta!.guards![0]).toBeInstanceOf(TestGuard)
  })

  it('@Use adds middleware to route metadata', () => {
    const meta = registry.getRouteMetadata(
      GuardedController,
      'middlewareRoute'
    )
    expect(meta!.middleware).toHaveLength(1)
    expect(meta!.middleware![0]).toBeInstanceOf(TestMiddleware)
  })
})

// --- Decorator ordering independence ---

describe('Decorator ordering independence', () => {
  @Controller('/order')
  class OrderController {
    // Decorators applied in "reverse" order (non-standard)
    @Authorize('admin')
    @UseGuard(TestGuard)
    @Use(TestMiddleware)
    @Get('/reverse')
    reverseOrder() {}
  }

  it('works regardless of decorator order', () => {
    const meta = registry.getRouteMetadata(OrderController, 'reverseOrder')
    expect(meta).toBeDefined()
    expect(meta!.method).toBe('GET')
    expect(meta!.path).toBe('/reverse')
    expect(meta!.roles).toEqual(['admin'])
    expect(meta!.guards).toHaveLength(1)
    expect(meta!.middleware).toHaveLength(1)
  })
})
