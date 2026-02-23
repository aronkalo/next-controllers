# Quick Start Example

This is a minimal example to get you started with next-controllers in a Next.js project.

## Setup

### 1. Create a New Next.js Project

```bash
npx create-next-app@latest my-api-app
cd my-api-app
```

### 2. Install next-controllers

```bash
npm install next-controllers zod
```

### 3. Enable TypeScript Decorators

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    // ... other options
  }
}
```

### 4. Create Your First Controller

Create `app/controllers/hello.controller.ts`:

```typescript
import { Controller, Get, Query } from 'next-controllers'

@Controller('/hello')
export class HelloController {
  @Get('/')
  sayHello(@Query('name') name?: string) {
    return Response.json({
      message: `Hello ${name || 'World'}!`,
      timestamp: new Date().toISOString()
    })
  }

  @Get('/ping')
  ping() {
    return Response.json({ status: 'pong' })
  }
}
```

### 5. Set Up the Route Handler

Create `app/api/[...all]/route.ts`:

```typescript
import { createNextHandler } from 'next-controllers'
import { HelloController } from '@/controllers/hello.controller'

export const { GET, POST, PUT, DELETE, PATCH } = createNextHandler({
  controllers: [HelloController]
})
```

### 6. Start the Development Server

```bash
npm run dev
```

### 7. Test Your API

Open your browser or use curl:

```bash
# Basic greeting
curl http://localhost:3000/api/hello

# Personalized greeting
curl http://localhost:3000/api/hello?name=John

# Ping endpoint
curl http://localhost:3000/api/hello/ping
```

## Next Steps

Now that you have a basic API running, try:

1. **Add More Routes**: Create additional methods in your controller
2. **Use POST Requests**: Add `@Post` methods with `@Body` decorators
3. **Add Authentication**: Set up JWT or session auth
4. **Create More Controllers**: Organize your API by domain
5. **Add Validation**: Use Zod schemas with `@Body(schema)`

## Example: User CRUD API

Create `app/controllers/user.controller.ts`:

```typescript
import { Controller, Get, Post, Put, Delete, Body, Route, Authorize } from 'next-controllers'
import { z } from 'zod'

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
})

@Controller('/users')
export class UserController {
  @Get('/')
  getUsers() {
    return Response.json([
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' }
    ])
  }

  @Get('/:id')
  getUser(@Route('id') id: string) {
    return Response.json({ id, name: 'John', email: 'john@example.com' })
  }

  @Post('/')
  createUser(@Body(CreateUserSchema) body: any) {
    return Response.json({ id: 3, ...body }, { status: 201 })
  }

  @Put('/:id')
  @Authorize() // Requires authentication
  updateUser(@Route('id') id: string, @Body() body: any) {
    return Response.json({ id, ...body })
  }

  @Delete('/:id')
  @Authorize('admin') // Requires admin role
  deleteUser(@Route('id') id: string) {
    return Response.json({ success: true, id })
  }
}
```

Update `app/api/[...all]/route.ts`:

```typescript
import { createNextHandler } from 'next-controllers'
import { HelloController } from '@/controllers/hello.controller'
import { UserController } from '@/controllers/user.controller'

export const { GET, POST, PUT, DELETE, PATCH } = createNextHandler({
  controllers: [
    HelloController,
    UserController
  ]
})
```

Now you have a full CRUD API:
- `GET /api/users` - List all users
- `GET /api/users/1` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/1` - Update user (requires auth)
- `DELETE /api/users/1` - Delete user (requires admin)

## Resources

- [Full Documentation](../../README.md)
- [Advanced Examples](../advanced/)
- [Middleware Examples](../middleware/)
- [Guard Examples](../guards/)
