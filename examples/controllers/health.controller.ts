import { Controller, Get, Req } from 'next-controllers'
import type { NextRequest } from 'next/server'

/**
 * Health Check Controller
 * Provides system health and status endpoints
 */
@Controller('/health')
export class HealthController {
  /**
   * Basic health check
   * GET /health
   */
  @Get('/')
  async healthCheck() {
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  }

  /**
   * Detailed health check
   * GET /health/detailed
   */
  @Get('/detailed')
  async detailedHealth(@Req() request: NextRequest) {
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      headers: Object.fromEntries(request.headers.entries()),
    })
  }

  /**
   * Readiness probe
   * GET /health/ready
   */
  @Get('/ready')
  async readiness() {
    // Check if application is ready to serve traffic
    // In production, check database connections, etc.
    return Response.json({
      ready: true,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Liveness probe
   * GET /health/live
   */
  @Get('/live')
  async liveness() {
    return Response.json({
      alive: true,
      timestamp: new Date().toISOString(),
    })
  }
}
