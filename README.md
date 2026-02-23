# next-controllers

ASP.NET-style controllers and decorators for Next.js App Router. Build type-safe, organized APIs with a familiar decorator-based approach instead of deeply nested file-based routing.

[![npm version](https://badge.fury.io/js/next-controllers.svg)](https://www.npmjs.com/package/next-controllers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Motivation

Next.js App Router uses file-based routing, which can become cumbersome for complex APIs:

```
app/api/users/route.ts
app/api/users/[id]/route.ts
app/api/users/[id]/posts/route.ts
app/api/users/[id]/posts/[postId]/route.ts
```

With `next-controllers`, organize your API using controllers and decorators:

```typescript
@Controller('/users')
export class UserController {
  @Get('/')
  getUsers() { /* ... */ }
  
  @Get('/:id')
  getUser(@Route('id') id: string) { /* ... */ }
  
  @Get('/:id/posts')
  getUserPosts(@Route('id') id: string) { /* ... */ }
  
  @Get('/:id/posts/:postId')
  getPost(@Route('id') id: string, @Route('postId') postId: string) { /* ... */ }
}
```

## Features

- 🎯 **ASP.NET-style decorators** - Familiar API design patterns
- 🔐 **Built-in authentication** - JWT and session-based auth support
- 🛡️ **Role-based authorization** - `@Authorize()` decorator with role checks
- ✅ **Zod validation** - Automatic request body validation
- 🔒 **Custom guards** - Flexible authorization logic
- 🎭 **Middleware support** - Route-level and controller-level middleware
- 💉 **Dependency injection** - Lightweight DI container
- 📦 **Type-safe** - Full TypeScript support
- ⚡ **Performance** - Routes compiled once at startup
- 🪶 **Lightweight** - Minimal dependencies

## Installation

```bash
npm install next-controllers
```

```bash
pnpm add next-controllers
```

```bash
yarn add next-controllers
```

## Quick Start

### 1. Enable TypeScript Decorators

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

### 2. Create a Controller

```typescript
// app/controllers/user.controller.ts
import { Controller, Get, Post, Body, Route } from 'next-controllers'

@Controller('/users')
export class UserController {
  @Get('/')
  getUsers() {
    return Response.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ])
  }

  @Get('/:id')
  getUser(@Route('id') id: string) {
    return Response.json({ id, name: 'John' })
  }

  @Post('/')
  createUser(@Body() body: any) {
    return Response.json({ id: 3, ...body }, { status: 201 })
  }
}
```

### 3. Register Controllers with Next.js

Create a catch-all route handler:

```typescript
// app/api/[...all]/route.ts
import { createNextHandler } from 'next-controllers'
import { UserController } from '@/controllers/user.controller'

export const { GET, POST, PUT, DELETE, PATCH } = createNextHandler({
  controllers: [UserController]
})
```

### 4. Start Your App

```bash
npm run dev
```

Your API is now available:
- `GET /api/users` - Get all users
- `GET /api/users/123` - Get user by ID
- `POST /api/users` - Create user

## Core Concepts

### Controllers

Controllers group related routes together:

```typescript
@Controller('/products')
export class ProductController {
  @Get('/')
  getAllProducts() { }
  
  @Get('/:id')
  getProduct(@Route('id') id: string) { }
  
  @Post('/')
  createProduct(@Body() body: CreateProductDto) { }
}
```

### HTTP Method Decorators

Available decorators:
- `@Get(path)` - Handle GET requests
- `@Post(path)` - Handle POST requests
- `@Put(path)` - Handle PUT requests
- `@Delete(path)` - Handle DELETE requests
- `@Patch(path)` - Handle PATCH requests

```typescript
@Controller('/posts')
export class PostController {
  @Get('/')
  getPosts() { }
  
  @Post('/')
  createPost() { }
  
  @Put('/:id')
  updatePost() { }
  
  @Delete('/:id')
  deletePost() { }
  
  @Patch('/:id')
  patchPost() { }
}
```

### Parameter Decorators

Extract data from requests using parameter decorators:

#### `@Body(schema?)`

Inject request body (optionally with Zod validation):

```typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
})

@Post('/users')
createUser(@Body(CreateUserSchema) body: CreateUserDto) {
  // body is automatically parsed and validated
  return Response.json(body)
}
```

#### `@Query(key?)`

Extract query parameters:

```typescript
@Get('/search')
search(@Query('q') query: string, @Query('page') page: string) {
  return Response.json({ query, page })
}
```

#### `@Route(key?)`

Extract route parameters:

```typescript
@Get('/users/:userId/posts/:postId')
getPost(
  @Route('userId') userId: string,
  @Route('postId') postId: string
) {
  return Response.json({ userId, postId })
}
```

#### `@Req()`

Inject the NextRequest object:

```typescript
import { NextRequest } from 'next/server'

@Get('/info')
getInfo(@Req() request: NextRequest) {
  return Response.json({ url: request.url })
}
```

#### `@Headers(key?)`

Extract request headers:

```typescript
@Get('/auth-info')
getAuthInfo(@Headers('authorization') auth: string) {
  return Response.json({ auth })
}
```

#### `@Context()`

Inject the full request context:

```typescript
import { RequestContext } from 'next-controllers'

@Get('/context')
getContext(@Context() ctx: RequestContext) {
  return Response.json({
    auth: ctx.auth,
    params: ctx.params
  })
}
```

## Authentication

### JWT Authentication

Provide your own token verification function (e.g. using `jose`):

```typescript
import { createJwtAuthProvider } from 'next-controllers'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export const { GET, POST, PUT, DELETE } = createNextHandler({
  controllers: [UserController],
  authProvider: createJwtAuthProvider({
    verifyToken: async (token) => {
      const { payload } = await jwtVerify(token, secret)
      return payload as Record<string, unknown>
    },
    cookieName: 'token',
    extractUser: (payload) => ({
      userId: String(payload.sub),
      roles: Array.isArray(payload.roles) ? payload.roles : [],
      permissions: Array.isArray(payload.permissions) ? payload.permissions : undefined
    })
  })
})
```

### Session Authentication

```typescript
import { createSessionAuthProvider } from 'next-controllers'

export const { GET, POST } = createNextHandler({
  controllers: [UserController],
  authProvider: createSessionAuthProvider({
    cookieName: 'session',
    getSession: async (sessionId) => {
      // Fetch session from database
      const session = await db.session.findUnique({ where: { id: sessionId } })
      return {
        userId: session.userId,
        roles: session.roles
      }
    }
  })
})
```

### Custom Authentication

```typescript
import { createCustomAuthProvider } from 'next-controllers'

export const { GET, POST } = createNextHandler({
  controllers: [UserController],
  authProvider: createCustomAuthProvider(async (request) => {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) return null
    
    // Validate API key
    const user = await validateApiKey(apiKey)
    return {
      userId: user.id,
      roles: user.roles
    }
  })
})
```

## Authorization

### Basic Authorization

Require authentication (returns 401 if not authenticated):

```typescript
@Get('/profile')
@Authorize()  // Enforces authentication - no roles required
getProfile(@Context() ctx: RequestContext) {
  return Response.json({ user: ctx.auth })
}
```

### Role-Based Authorization

Require specific roles:

```typescript
@Delete('/users/:id')
@Authorize('admin')
deleteUser(@Route('id') id: string) {
  return Response.json({ deleted: true })
}
```

Multiple roles (any of them grants access):

```typescript
@Get('/content')
@Authorize('editor', 'admin')
getContent() {
  return Response.json({ content: '...' })
}
```

### Controller-Level Authorization

Apply authorization to all routes in a controller:

```typescript
@Controller('/admin')
@Authorize('admin')
export class AdminController {
  @Get('/users')
  getUsers() { }
  
  @Get('/settings')
  getSettings() { }
}
```

## Guards

Guards provide custom authorization logic:

```typescript
import { Guard, RequestContext } from 'next-controllers'

class PremiumUserGuard implements Guard {
  async canActivate(context: RequestContext): Promise<boolean> {
    if (!context.auth) return false
    
    // Check if user has premium subscription
    const user = await db.user.findUnique({
      where: { id: context.auth.userId }
    })
    
    return user?.isPremium === true
  }
}

@Get('/premium-content')
@UseGuard(PremiumUserGuard)
getPremiumContent() {
  return Response.json({ content: 'Premium content' })
}
```

### Built-in Guards

```typescript
import { RoleGuard, PermissionGuard, AuthenticatedGuard } from 'next-controllers'

@Get('/admin')
@UseGuard(new RoleGuard(['admin']))
getAdmin() { }

@Get('/write')
@UseGuard(new PermissionGuard(['posts:write']))
writePost() { }

@Get('/protected')
@UseGuard(AuthenticatedGuard)
getProtected() { }
```

## Middleware

Middleware can intercept requests and responses:

```typescript
import { Middleware, RequestContext } from 'next-controllers'

class LoggerMiddleware implements Middleware {
  async run(context: RequestContext, next: () => Promise<Response>) {
    console.log(`[${new Date().toISOString()}] ${context.request.method} ${context.request.url}`)
    
    const start = Date.now()
    const response = await next()
    const duration = Date.now() - start
    
    console.log(`Completed in ${duration}ms`)
    return response
  }
}

@Get('/data')
@Use(LoggerMiddleware)
getData() {
  return Response.json({ data: '...' })
}
```

### Controller-Level Middleware

```typescript
@Controller('/api')
@Use(LoggerMiddleware, CorsMiddleware)
export class ApiController {
  // All routes will use these middleware
}
```

## Dependency Injection

Inject services into controllers:

```typescript
// services/user.service.ts
export class UserService {
  async findAll() {
    return await db.user.findMany()
  }
  
  async findById(id: string) {
    return await db.user.findUnique({ where: { id } })
  }
}

// controllers/user.controller.ts
import { globalContainer } from 'next-controllers'

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get('/')
  async getUsers() {
    const users = await this.userService.findAll()
    return Response.json(users)
  }
}

// Register service
globalContainer.register(UserService)
```

## Configuration

### Route Prefix

Add a prefix to all routes:

```typescript
export const { GET, POST } = createNextHandler({
  controllers: [UserController],
  prefix: '/api/v1' // All routes will be prefixed with /api/v1
})
```

### Exception Handling

The library provides a built-in exception system for clean, structured error responses.

#### HttpException

Throw typed exceptions from your controllers instead of manually building error responses:

```typescript
import {
  HttpException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from 'next-controllers'

@Get('/users/:id')
async getUser(@Route('id') id: string) {
  const user = await this.userService.findById(id)
  if (!user) {
    throw new NotFoundException('User not found')
  }
  return Response.json(user)
}

@Post('/users')
async createUser(@Body(CreateUserSchema) body: CreateUserDto) {
  const existing = await this.userService.findByEmail(body.email)
  if (existing) {
    throw new ConflictException('Email already in use')
  }
  // ...
}
```

Available exception classes:
- `BadRequestException` (400)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `NotFoundException` (404)
- `ConflictException` (409)
- `InternalServerErrorException` (500)
- `HttpException` (custom status code)

#### Custom Exception Filter

Create your own exception filter for custom error formatting, logging, or monitoring:

```typescript
import { ExceptionFilter, HttpException } from 'next-controllers'
import type { NextRequest } from 'next/server'

class MyExceptionFilter implements ExceptionFilter {
  async catch(error: Error, request: NextRequest): Promise<Response> {
    // Log to your monitoring service
    await logToSentry(error)

    if (error instanceof HttpException) {
      return Response.json(
        { error: error.message, code: error.statusCode },
        { status: error.statusCode }
      )
    }

    return Response.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export const { GET, POST } = createNextHandler({
  controllers: [UserController],
  exceptionFilter: new MyExceptionFilter(),
})
```

#### Default Exception Filter

If you don't provide a custom `exceptionFilter`, the built-in `DefaultExceptionFilter` handles errors automatically:

- `HttpException` - Returns the exception's status code and message as JSON
- `ZodError` (validation failures) - Returns 400 with structured validation errors
- Body parse errors - Returns 400 with "Invalid request body"
- Unknown errors - Returns 500 with "Internal Server Error" (no internal details leaked)

#### Legacy `onError` (deprecated)

The `onError` callback is still supported for backwards compatibility but `exceptionFilter` is the preferred approach. If both are provided, `onError` takes priority:

```typescript
export const { GET, POST } = createNextHandler({
  controllers: [UserController],
  // @deprecated - use exceptionFilter instead
  onError: (error, request) => {
    console.error('API Error:', error)
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
})
```

## Folder Structure

Recommended project structure:

```
app/
  api/
    [...all]/
      route.ts          # Next.js catch-all handler
  controllers/
    user.controller.ts
    auth.controller.ts
    product.controller.ts
  services/
    user.service.ts
    auth.service.ts
  guards/
    premium.guard.ts
    admin.guard.ts
  middleware/
    logger.middleware.ts
    cors.middleware.ts
  dtos/
    user.dto.ts
    product.dto.ts
```

## Best Practices

### 1. Use DTOs with Zod

Define and validate your data structures:

```typescript
import { z } from 'zod'

export const CreateProductSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().positive(),
  description: z.string().optional()
})

export type CreateProductDto = z.infer<typeof CreateProductSchema>

@Post('/products')
createProduct(@Body(CreateProductSchema) body: CreateProductDto) {
  // body is fully validated
}
```

### 2. Separate Business Logic

Keep controllers thin, move logic to services:

```typescript
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get('/')
  async getUsers() {
    const users = await this.userService.findAll()
    return Response.json(users)
  }
}
```

### 3. Use Guards for Reusable Auth Logic

```typescript
class OwnerGuard implements Guard {
  async canActivate(context: RequestContext): Promise<boolean> {
    const resourceId = context.params.id
    const userId = context.auth?.userId
    
    return await checkOwnership(resourceId, userId)
  }
}
```

### 4. Handle Errors with HttpException

Throw typed exceptions instead of manually building error responses:

```typescript
import { NotFoundException } from 'next-controllers'

@Get('/users/:id')
async getUser(@Route('id') id: string) {
  const user = await this.userService.findById(id)

  if (!user) {
    throw new NotFoundException('User not found')
  }

  return Response.json(user)
}
```

The `DefaultExceptionFilter` (or your custom filter) converts these into proper JSON responses automatically.

## Performance

- **Route Compilation**: All routes are compiled once at application startup, not on every request
- **Zero Runtime Overhead**: Decorators are processed at startup, no reflection on each request
- **Efficient Matching**: Routes are sorted by specificity for optimal matching
- **Minimal Dependencies**: Only `path-to-regexp` is required

## TypeScript Support

Full TypeScript support with strict typing:

```typescript
import type { RequestContext, AuthContext } from 'next-controllers'

@Controller('/api')
export class ApiController {
  @Get('/context')
  getContext(@Context() ctx: RequestContext) {
    // ctx is fully typed
    const userId: string | undefined = ctx.auth?.userId
    const roles: string[] = ctx.auth?.roles || []
  }
}
```

## Examples

See the [examples](./examples) directory for complete examples:

- [User Controller](./examples/controllers/user.controller.ts) - CRUD operations
- [Auth Controller](./examples/controllers/auth.controller.ts) - Authentication
- [Health Controller](./examples/controllers/health.controller.ts) - Health checks
- [Next.js Integration](./examples/next-app/route.ts) - App Router setup

## Roadmap

- [ ] OpenAPI/Swagger generation
- [ ] Automatic controller discovery
- [ ] WebSocket support
- [ ] GraphQL integration
- [ ] More built-in validators
- [ ] Rate limiting middleware
- [ ] Response caching
- [ ] Request/Response interceptors
- [ ] Better error reporting in development

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

## License

MIT © Aron Kalo

## Acknowledgments

Inspired by:
- [ASP.NET Core MVC](https://docs.microsoft.com/en-us/aspnet/core/mvc/overview)
- [NestJS](https://nestjs.com/)
- [next13-api-decorators](https://github.com/liberatos278/next13-api-decorators)
