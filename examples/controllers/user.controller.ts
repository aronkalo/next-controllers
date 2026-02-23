import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Route,
  Query,
  Authorize,
} from 'next-controllers'

// Example DTO with Zod validation
import { z } from 'zod'

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).optional(),
})

const UpdateUserSchema = CreateUserSchema.partial()

type CreateUserDto = z.infer<typeof CreateUserSchema>
type UpdateUserDto = z.infer<typeof UpdateUserSchema>

/**
 * Example User Controller
 * Demonstrates CRUD operations with decorators
 */
@Controller('/users')
export class UserController {
  /**
   * Get all users with optional search
   * GET /users?search=john
   */
  @Get('/')
  async getUsers(@Query('search') search?: string) {
    const users = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ]

    if (search) {
      const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
      )
      return Response.json(filtered)
    }

    return Response.json(users)
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  @Get('/:id')
  async getUser(@Route('id') id: string) {
    return Response.json({
      id,
      name: 'John Doe',
      email: 'john@example.com',
    })
  }

  /**
   * Create a new user
   * POST /users
   * Body: { name, email, age? }
   */
  @Post('/')
  async createUser(@Body(CreateUserSchema) body: CreateUserDto) {
    // Body is automatically validated with Zod
    return Response.json(
      {
        id: 'new-id',
        ...body,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  }

  /**
   * Update user
   * PUT /users/:id
   */
  @Put('/:id')
  @Authorize() // Requires authentication
  async updateUser(
    @Route('id') id: string,
    @Body(UpdateUserSchema) body: UpdateUserDto
  ) {
    return Response.json({
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    })
  }

  /**
   * Delete user
   * DELETE /users/:id
   */
  @Delete('/:id')
  @Authorize('admin') // Requires 'admin' role
  async deleteUser(@Route('id') id: string) {
    return Response.json({
      success: true,
      id,
      deletedAt: new Date().toISOString(),
    })
  }

  /**
   * Get user statistics
   * GET /users/:id/stats
   */
  @Get('/:id/stats')
  @Authorize('admin', 'moderator') // Requires 'admin' OR 'moderator' role
  async getUserStats(@Route('id') id: string) {
    return Response.json({
      userId: id,
      totalPosts: 42,
      totalComments: 128,
      joinedAt: '2024-01-01',
    })
  }
}
