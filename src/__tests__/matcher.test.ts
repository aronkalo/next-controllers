import { describe, it, expect } from 'vitest'
import { compileRoute, matchRoute, normalizePath } from '../core/matcher'
import type { CompiledRoute } from '../types/route'

describe('compileRoute', () => {
  it('compiles a static path', () => {
    const { pattern, keys } = compileRoute('/users')
    expect(pattern).toBeInstanceOf(RegExp)
    expect(keys).toEqual([])
  })

  it('compiles a path with parameters', () => {
    const { pattern, keys } = compileRoute('/users/:id')
    expect(keys).toEqual([{ name: 'id', index: 0 }])
    expect(pattern.test('/users/123')).toBe(true)
    expect(pattern.test('/users')).toBe(false)
  })

  it('compiles a path with multiple parameters', () => {
    const { pattern, keys } = compileRoute('/users/:userId/posts/:postId')
    expect(keys).toHaveLength(2)
    expect(keys[0].name).toBe('userId')
    expect(keys[1].name).toBe('postId')
  })
})

describe('matchRoute', () => {
  function buildRoute(
    path: string,
    method: string
  ): CompiledRoute {
    const { pattern, keys } = compileRoute(path)
    return {
      pattern,
      keys,
      method: method as any,
      handler: () => new Response(),
      controllerInstance: {},
      metadata: { path, method: method as any, handler: 'test' },
      controllerMetadata: { basePath: '/', routes: [] },
    }
  }

  it('matches an exact static path', () => {
    const routes = [buildRoute('/users', 'GET')]
    const result = matchRoute('/users', 'GET', routes)
    expect(result).not.toBeNull()
    expect(result!.params).toEqual({})
  })

  it('matches a path with params and extracts them', () => {
    const routes = [buildRoute('/users/:id', 'GET')]
    const result = matchRoute('/users/42', 'GET', routes)
    expect(result).not.toBeNull()
    expect(result!.params).toEqual({ id: '42' })
  })

  it('returns null for non-matching paths', () => {
    const routes = [buildRoute('/users', 'GET')]
    const result = matchRoute('/posts', 'GET', routes)
    expect(result).toBeNull()
  })

  it('filters by HTTP method', () => {
    const routes = [buildRoute('/users', 'POST')]
    const result = matchRoute('/users', 'GET', routes)
    expect(result).toBeNull()
  })

  it('matches the first matching route in order', () => {
    const routes = [
      buildRoute('/users/featured', 'GET'),
      buildRoute('/users/:id', 'GET'),
    ]
    const result = matchRoute('/users/featured', 'GET', routes)
    expect(result).not.toBeNull()
    expect(result!.params).toEqual({})
  })
})

describe('normalizePath', () => {
  it('joins multiple segments', () => {
    expect(normalizePath('/api', '/users')).toBe('/api/users')
  })

  it('removes duplicate slashes', () => {
    expect(normalizePath('/api/', '/users/')).toBe('/api/users')
  })

  it('ensures a leading slash', () => {
    expect(normalizePath('api', 'users')).toBe('/api/users')
  })

  it('handles empty segments', () => {
    expect(normalizePath('', '/users')).toBe('/users')
  })

  it('handles a single root path', () => {
    expect(normalizePath('/')).toBe('/')
  })
})
