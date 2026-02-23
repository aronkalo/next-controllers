import { describe, it, expect } from 'vitest'
import { loadControllers } from '../core/controller-loader'
import { Controller } from '../decorators/controller'
import { Get } from '../decorators/http-methods'

@Controller('/products')
class ProductController {
  @Get('/')
  list() {
    return { items: [] }
  }

  @Get('/featured')
  featured() {
    return { featured: true }
  }

  @Get('/:id')
  getById() {
    return { id: '1' }
  }
}

@Controller('/health')
class HealthController {
  @Get('/')
  check() {
    return { status: 'ok' }
  }
}

describe('loadControllers', () => {
  it('compiles routes from controllers', () => {
    const routes = loadControllers([ProductController, HealthController])
    // 3 product routes + 1 health route
    expect(routes.length).toBe(4)
  })

  it('applies prefix to all routes', () => {
    const routes = loadControllers([HealthController], '/api/v1')
    const healthRoute = routes[0]
    // The compiled pattern should match the prefixed path
    expect(healthRoute.pattern.test('/api/v1/health')).toBe(true)
  })

  it('sorts static routes before dynamic routes', () => {
    const routes = loadControllers([ProductController])
    const paths = routes.map((r) => r.metadata.path)
    // /featured (static) should come before /:id (dynamic)
    const featuredIdx = paths.indexOf('/featured')
    const dynamicIdx = paths.indexOf('/:id')
    expect(featuredIdx).toBeLessThan(dynamicIdx)
  })

  it('sorts more segments before fewer segments', () => {
    const routes = loadControllers([ProductController])
    const paths = routes.map((r) => r.metadata.path)
    // /featured has more segments in the full path (/products/featured)
    // than / (/products) so it should come first
    const featuredIdx = paths.indexOf('/featured')
    const rootIdx = paths.indexOf('/')
    expect(featuredIdx).toBeLessThan(rootIdx)
  })

  it('binds handler to controller instance', () => {
    const routes = loadControllers([HealthController])
    // handler should be callable and return the expected value
    const result = routes[0].handler()
    expect(result).toEqual({ status: 'ok' })
  })

  it('warns for controllers without @Controller decorator', () => {
    class NotDecorated {
      getAll() {}
    }
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const routes = loadControllers([NotDecorated as any])
    expect(routes).toHaveLength(0)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
