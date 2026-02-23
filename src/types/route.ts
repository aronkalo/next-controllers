import type { HttpMethod, Guard, Middleware } from './http'

export interface RouteMetadata {
  path: string
  method: HttpMethod
  handler: string
  guards?: Guard[]
  middleware?: Middleware[]
  roles?: string[]
  paramDecorators?: ParamDecorator[]
}

export interface ControllerMetadata {
  basePath: string
  routes: RouteMetadata[]
  guards?: Guard[]
  middleware?: Middleware[]
}

export interface ParamDecorator {
  index: number
  type: 'body' | 'query' | 'route' | 'request' | 'headers' | 'context'
  key?: string
  validator?: unknown
}

export interface CompiledRoute {
  pattern: RegExp
  keys: { name: string; index: number }[]
  method: HttpMethod
  handler: Function
  controllerInstance: unknown
  metadata: RouteMetadata
  controllerMetadata: ControllerMetadata
}
