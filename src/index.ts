/**
 * next-controllers
 * ASP.NET-style controllers and decorators for Next.js App Router
 */

// Core
export { createNextHandler } from './core/router'
export { Container, globalContainer } from './core/container'
export { registry } from './core/registry'
export { DefaultExceptionFilter } from './core/exception-filter'
export type { ExceptionFilter } from './core/exception-filter'
export {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from './core/http-exception'

// Decorators
export { Controller, UseGuard as ControllerUseGuard, Use as ControllerUse } from './decorators/controller'
export { Get, Post, Put, Delete, Patch } from './decorators/http-methods'
export { Body, Query, Route, Req, Headers, Context } from './decorators/params'
export { Authorize } from './decorators/auth'
export { UseGuard, Use } from './decorators/middleware'

// Auth
export {
  createJwtAuthProvider,
  createSessionAuthProvider,
  createCustomAuthProvider,
} from './auth/auth-context'
export {
  RoleGuard,
  PermissionGuard,
  AuthenticatedGuard,
} from './auth/role-guard'

// Utils
export {
  createResponse,
  createErrorResponse,
  createValidationError,
  parseQuery,
} from './utils'

// Types
export type {
  HttpMethod,
  RouteParams,
  AuthContext,
  RequestContext,
  ControllerMethod,
  Guard,
  Middleware,
  AuthProvider,
} from './types/http'

export type {
  RouteMetadata,
  ControllerMetadata,
  ParamDecorator,
  CompiledRoute,
} from './types/route'

export type {
  NextControllersConfig,
  Constructor,
  ServiceProvider,
} from './types/context'
