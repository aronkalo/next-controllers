import { describe, it, expect, beforeEach } from 'vitest'
// We test the MetadataRegistry via the singleton export.
// We need to be careful about shared state across tests.
import { registry } from '../core/registry'

// Simple test classes (not decorated - we test metadata directly)
class TestControllerA {}
class TestControllerB {}

describe('MetadataRegistry', () => {
  // Note: registry is a singleton. Tests must use unique classes or
  // accept that metadata set by earlier tests persists.

  describe('controller metadata', () => {
    it('sets and gets controller metadata', () => {
      registry.setControllerMetadata(TestControllerA, {
        basePath: '/test-a',
        routes: [],
      })
      const meta = registry.getControllerMetadata(TestControllerA)
      expect(meta).toBeDefined()
      expect(meta!.basePath).toBe('/test-a')
    })

    it('returns undefined for unregistered controllers', () => {
      class Unregistered {}
      expect(registry.getControllerMetadata(Unregistered)).toBeUndefined()
    })
  })

  describe('route metadata', () => {
    it('sets and gets route metadata', () => {
      registry.setRouteMetadata(TestControllerA, 'getAll', {
        path: '/',
        method: 'GET',
        handler: 'getAll',
      })
      const meta = registry.getRouteMetadata(TestControllerA, 'getAll')
      expect(meta).toBeDefined()
      expect(meta!.method).toBe('GET')
    })

    it('returns undefined for unregistered method', () => {
      expect(
        registry.getRouteMetadata(TestControllerA, 'nonExistent')
      ).toBeUndefined()
    })
  })

  describe('ensureRouteMetadata', () => {
    it('creates placeholder when missing', () => {
      class Fresh {}
      const meta = registry.ensureRouteMetadata(Fresh, 'myMethod')
      expect(meta).toBeDefined()
      expect(meta.path).toBe('')
      expect(meta.handler).toBe('myMethod')
    })

    it('returns existing when present', () => {
      class WithRoute {}
      registry.setRouteMetadata(WithRoute, 'handle', {
        path: '/existing',
        method: 'POST',
        handler: 'handle',
      })
      const meta = registry.ensureRouteMetadata(WithRoute, 'handle')
      expect(meta.path).toBe('/existing')
      expect(meta.method).toBe('POST')
    })
  })

  describe('getAllRouteMetadata', () => {
    it('returns all routes for a controller', () => {
      registry.setRouteMetadata(TestControllerB, 'get', {
        path: '/',
        method: 'GET',
        handler: 'get',
      })
      registry.setRouteMetadata(TestControllerB, 'post', {
        path: '/',
        method: 'POST',
        handler: 'post',
      })
      const routes = registry.getAllRouteMetadata(TestControllerB)
      expect(routes).toHaveLength(2)
    })

    it('returns empty array for controller with no routes', () => {
      class Empty {}
      expect(registry.getAllRouteMetadata(Empty)).toEqual([])
    })
  })

  describe('getAllControllers', () => {
    it('returns registered controllers', () => {
      const controllers = registry.getAllControllers()
      expect(controllers).toContain(TestControllerA)
    })
  })
})
