# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- ESM module format

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
