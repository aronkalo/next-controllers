# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-23

### Added

- **Exception handling system**: `HttpException` class with convenience subclasses (`BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `InternalServerErrorException`)
- **Exception filter interface**: `ExceptionFilter` interface and `DefaultExceptionFilter` with built-in handling for `HttpException`, `ZodError`, body parse errors, and unknown errors
- **`exceptionFilter` config option**: Pass a custom `ExceptionFilter` to `createNextHandler` for global error handling (replaces `onError`)
- **CJS output**: Package now ships both ESM and CJS formats for broader compatibility
- **Vitest test suite**: Comprehensive tests covering matcher, registry, container, decorators, controller-loader, router, exception-filter, and auth

### Changed

- **`@Authorize()` now enforces authentication**: Bare `@Authorize()` without roles returns 401 if the user is not authenticated. Previously it was a no-op without roles.
- **Decorator ordering is now flexible**: Decorators like `@Authorize()`, `@UseGuard()`, `@Use()`, and parameter decorators can be placed in any order relative to the HTTP method decorator (`@Get`, `@Post`, etc.)
- **Guards and middleware resolve through DI container**: `@UseGuard()` and `@Use()` now resolve class references via `globalContainer` instead of plain `new`
- **Request body is cached**: The parsed body is stored on `RequestContext._parsedBody` to prevent stream consumption errors when multiple decorators access the body
- **Route sorting uses segment-based algorithm**: Routes are now sorted by segment count and static-vs-dynamic segments instead of regex source length
- **`createJwtAuthProvider` API changed**: Now accepts `{ verifyToken, ... }` options object instead of `(secret, options)`. Users must provide their own cryptographic token verification function (e.g. using `jose`)
- **`onError` is deprecated**: Use `exceptionFilter` instead. `onError` is still supported for backwards compatibility
- **500 responses no longer leak error details**: Internal error messages are not exposed to clients

### Removed

- Removed insecure built-in JWT signature verification (users must provide `verifyToken`)
- Removed unused `emitDecoratorMetadata` tsconfig requirement
- Removed unused `isConstructor` utility function
- Removed self-dependency (`next-controllers` in its own `dependencies`)

### Fixed

- `path-to-regexp` pinned to v1.9 to match the API used in the route matcher
- `NextControllersConfig.authProvider` type now correctly uses `AuthProvider` and `NextRequest`
- `defaultExtractUser` properly typed with `Record<string, unknown>` instead of `any`
- Cleaned up unused imports in router (`ParamDecorator`, `AuthContext`)

## [1.0.0] - 2026-02-23

### Added

- Initial release of next-controllers
- ASP.NET-style controller decorators for Next.js App Router
- Core decorators:
  - `@Controller` - Define controller with base path
  - `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch` - HTTP method decorators
  - `@Body`, `@Query`, `@Route`, `@Req`, `@Headers`, `@Context` - Parameter decorators
  - `@Authorize` - Role-based authorization
  - `@UseGuard` - Custom guards
  - `@Use` - Middleware support
- Built-in authentication providers:
  - JWT authentication with `createJwtAuthProvider`
  - Session authentication with `createSessionAuthProvider`
  - Custom authentication with `createCustomAuthProvider`
- Built-in guards:
  - `RoleGuard` - Role-based access control
  - `PermissionGuard` - Permission-based access control
  - `AuthenticatedGuard` - Simple authentication check
- Zod validation support for request bodies
- Lightweight dependency injection container
- Route compilation and matching engine
- TypeScript support with full type safety
- Comprehensive documentation and examples

### Features

- Performance optimized route compilation
- Support for dynamic route parameters (e.g., `/users/:id`)
- Nested route support (e.g., `/users/:id/posts/:postId`)
- Controller-level and route-level guards
- Controller-level and route-level middleware
- Custom error handling
- Route prefixing
- Automatic parameter injection
- ESM and CJS dual module format

### Documentation

- Comprehensive README with examples
- Example controllers (User, Auth, Health)
- Example middleware (Logger, CORS, Cache)
- Example guards (Premium, Owner, API Key)
- Example services (UserService)
- Advanced product controller example
- Contributing guidelines

## [Unreleased]

### Planned

- OpenAPI/Swagger generation
- Automatic controller discovery
- WebSocket support
- GraphQL integration
- Rate limiting middleware
- Response caching decorators
- Request/Response interceptors
- Better development error messages
- CLI tools for scaffolding
