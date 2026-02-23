import {
  Controller,
  Get,
  Post,
  Body,
  Context,
  Authorize,
} from 'next-controllers'
import type { RequestContext } from 'next-controllers'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const RegisterSchema = LoginSchema.extend({
  name: z.string().min(2),
})

type LoginDto = z.infer<typeof LoginSchema>
type RegisterDto = z.infer<typeof RegisterSchema>

/**
 * Authentication Controller
 * Handles login, register, and profile operations
 */
@Controller('/auth')
export class AuthController {
  /**
   * Login endpoint
   * POST /auth/login
   */
  @Post('/login')
  async login(@Body(LoginSchema) credentials: LoginDto) {
    // In production, validate credentials against database
    const token = 'jwt-token-here'

    return Response.json({
      success: true,
      token,
      user: {
        id: 'user-id',
        email: credentials.email,
        roles: ['user'],
      },
    })
  }

  /**
   * Register endpoint
   * POST /auth/register
   */
  @Post('/register')
  async register(@Body(RegisterSchema) data: RegisterDto) {
    // In production, create user in database
    const token = 'jwt-token-here'

    return Response.json(
      {
        success: true,
        token,
        user: {
          id: 'new-user-id',
          name: data.name,
          email: data.email,
          roles: ['user'],
        },
      },
      { status: 201 }
    )
  }

  /**
   * Get current user profile
   * GET /auth/me
   */
  @Get('/me')
  @Authorize()
  async getProfile(@Context() ctx: RequestContext) {
    if (!ctx.auth) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return Response.json({
      userId: ctx.auth.userId,
      roles: ctx.auth.roles,
      permissions: ctx.auth.permissions,
    })
  }

  /**
   * Logout endpoint
   * POST /auth/logout
   */
  @Post('/logout')
  @Authorize()
  async logout() {
    // In production, invalidate session/token
    return Response.json({
      success: true,
      message: 'Logged out successfully',
    })
  }
}
