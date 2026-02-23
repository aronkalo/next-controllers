import type { Constructor, ServiceProvider } from '../types/context'

/**
 * Lightweight dependency injection container
 */
export class Container implements ServiceProvider {
  private instances = new Map<Constructor, unknown>()
  private factories = new Map<Constructor, () => unknown>()

  /**
   * Register a service with the container
   */
  register<T>(token: Constructor<T>, instance?: T): void {
    if (instance) {
      this.instances.set(token, instance)
    } else {
      this.factories.set(token, () => new token())
    }
  }

  /**
   * Register a factory function for a service
   */
  registerFactory<T>(token: Constructor<T>, factory: () => T): void {
    this.factories.set(token, factory)
  }

  /**
   * Get or create a service instance
   */
  get<T>(token: Constructor<T>): T {
    // Check if instance already exists
    if (this.instances.has(token)) {
      return this.instances.get(token) as T
    }

    // Check if factory exists
    if (this.factories.has(token)) {
      const instance = this.factories.get(token)!() as T
      this.instances.set(token, instance)
      return instance
    }

    // Try to instantiate directly
    try {
      const instance = new token()
      this.instances.set(token, instance)
      return instance
    } catch (error) {
      throw new Error(
        `Cannot resolve dependency: ${token.name}. Make sure it's registered in the container.`
      )
    }
  }

  /**
   * Check if a service is registered
   */
  has(token: Constructor): boolean {
    return this.instances.has(token) || this.factories.has(token)
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.instances.clear()
    this.factories.clear()
  }
}

// Global container instance
export const globalContainer = new Container()
