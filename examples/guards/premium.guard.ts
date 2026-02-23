import type { Guard, RequestContext } from 'next-controllers'

/**
 * Premium User Guard
 * Checks if the authenticated user has premium access
 */
export class PremiumUserGuard implements Guard {
  async canActivate(context: RequestContext): Promise<boolean> {
    if (!context.auth) {
      return false
    }

    // In production, check database for premium status
    // const user = await db.user.findUnique({
    //   where: { id: context.auth.userId }
    // })
    // return user?.isPremium === true

    // For demo purposes, check if user has 'premium' role
    return context.auth.roles.includes('premium')
  }
}

/**
 * Owner Guard
 * Checks if the authenticated user owns the resource
 */
export class OwnerGuard implements Guard {
  constructor(private paramName: string = 'id') {}

  async canActivate(context: RequestContext): Promise<boolean> {
    if (!context.auth) {
      return false
    }

    const resourceId = context.params[this.paramName] as string

    // In production, check database for ownership
    // const resource = await db.resource.findUnique({
    //   where: { id: resourceId }
    // })
    // return resource?.userId === context.auth.userId

    // For demo purposes, allow if IDs match
    return resourceId === context.auth.userId
  }
}

/**
 * API Key Guard
 * Validates API key from headers
 */
export class ApiKeyGuard implements Guard {
  constructor(private validApiKeys: string[]) {}

  async canActivate(context: RequestContext): Promise<boolean> {
    const apiKey = context.request.headers.get('x-api-key')

    if (!apiKey) {
      return false
    }

    return this.validApiKeys.includes(apiKey)
  }
}
