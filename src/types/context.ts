export interface NextControllersConfig {
  controllers: (new (...args: unknown[]) => unknown)[]
  authProvider?: (request: Request) => Promise<unknown> | unknown
  prefix?: string
  onError?: (error: Error, request: Request) => Response | Promise<Response>
}

export type Constructor<T = unknown> = new (...args: unknown[]) => T

export interface ServiceProvider {
  get<T>(token: Constructor<T>): T
  register<T>(token: Constructor<T>, instance?: T): void
}
