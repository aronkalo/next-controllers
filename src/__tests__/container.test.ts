import { describe, it, expect, beforeEach } from 'vitest'
import { Container } from '../core/container'

class ServiceA {
  value = 'a'
}

class ServiceB {
  constructor(public dep: string = 'default') {}
}

describe('Container', () => {
  let container: Container

  beforeEach(() => {
    container = new Container()
  })

  describe('register with instance', () => {
    it('returns the same instance on get', () => {
      const instance = new ServiceA()
      container.register(ServiceA, instance)
      expect(container.get(ServiceA)).toBe(instance)
    })
  })

  describe('register without instance', () => {
    it('creates instance via constructor on first get', () => {
      container.register(ServiceA)
      const instance = container.get(ServiceA)
      expect(instance).toBeInstanceOf(ServiceA)
      expect(instance.value).toBe('a')
    })

    it('returns the same instance on subsequent gets', () => {
      container.register(ServiceA)
      const first = container.get(ServiceA)
      const second = container.get(ServiceA)
      expect(first).toBe(second)
    })
  })

  describe('registerFactory', () => {
    it('uses the factory to create instance', () => {
      container.registerFactory(ServiceB, () => new ServiceB('custom'))
      const instance = container.get(ServiceB)
      expect(instance.dep).toBe('custom')
    })

    it('caches the factory result', () => {
      let count = 0
      container.registerFactory(ServiceA, () => {
        count++
        return new ServiceA()
      })
      container.get(ServiceA)
      container.get(ServiceA)
      expect(count).toBe(1)
    })
  })

  describe('auto-instantiation', () => {
    it('auto-instantiates unregistered classes', () => {
      const instance = container.get(ServiceA)
      expect(instance).toBeInstanceOf(ServiceA)
    })
  })

  describe('has', () => {
    it('returns false for unregistered', () => {
      expect(container.has(ServiceA)).toBe(false)
    })

    it('returns true after register', () => {
      container.register(ServiceA)
      expect(container.has(ServiceA)).toBe(true)
    })

    it('returns true after registerFactory', () => {
      container.registerFactory(ServiceA, () => new ServiceA())
      expect(container.has(ServiceA)).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      container.register(ServiceA, new ServiceA())
      container.registerFactory(ServiceB, () => new ServiceB())
      container.clear()
      expect(container.has(ServiceA)).toBe(false)
      expect(container.has(ServiceB)).toBe(false)
    })
  })
})
