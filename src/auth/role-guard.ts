import type { Guard, RequestContext } from '../types/http'

/**
 * Role-based guard
 * Checks if user has any of the required roles
 */
export class RoleGuard implements Guard {
  constructor(private requiredRoles: string[]) {}

  async canActivate(context: RequestContext): Promise<boolean> {
    if (!context.auth) {
      return false
    }

    if (this.requiredRoles.length === 0) {
      return true
    }

    return this.requiredRoles.some((role) =>
      context.auth!.roles.includes(role)
    )
  }
}

/**
 * Permission-based guard
 * Checks if user has any of the required permissions
 */
export class PermissionGuard implements Guard {
  constructor(private requiredPermissions: string[]) {}

  async canActivate(context: RequestContext): Promise<boolean> {
    if (!context.auth || !context.auth.permissions) {
      return false
    }

    if (this.requiredPermissions.length === 0) {
      return true
    }

    return this.requiredPermissions.some((permission) =>
      context.auth!.permissions!.includes(permission)
    )
  }
}

/**
 * Authenticated guard
 * Simply checks if user is authenticated
 */
export class AuthenticatedGuard implements Guard {
  async canActivate(context: RequestContext): Promise<boolean> {
    return !!context.auth
  }
}
