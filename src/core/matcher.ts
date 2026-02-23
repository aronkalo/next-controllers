import pathToRegexp from 'path-to-regexp'
import type { CompiledRoute } from '../types/route'

interface Key {
  name: string | number
  prefix: string
  delimiter: string
  optional: boolean
  repeat: boolean
  pattern: string
}

/**
 * Compile a route path into a regular expression
 */
export function compileRoute(path: string): {
  pattern: RegExp
  keys: { name: string; index: number }[]
} {
  const keys: Key[] = []
  const pattern = pathToRegexp(path, keys)

  return {
    pattern,
    keys: keys.map((key, index) => ({
      name: String(key.name),
      index,
    })),
  }
}

/**
 * Match a URL path against compiled routes
 */
export function matchRoute(
  pathname: string,
  method: string,
  routes: CompiledRoute[]
): {
  route: CompiledRoute
  params: Record<string, string>
} | null {
  for (const route of routes) {
    if (route.method !== method) continue

    const match = route.pattern.exec(pathname)
    if (!match) continue

    const params: Record<string, string> = {}
    route.keys.forEach((key) => {
      params[key.name] = match[key.index + 1] || ''
    })

    return { route, params }
  }

  return null
}

/**
 * Normalize path by removing trailing slashes and ensuring leading slash
 */
export function normalizePath(...paths: string[]): string {
  const joined = paths.join('/').replace(/\/+/g, '/')
  const normalized = joined.endsWith('/') && joined.length > 1
    ? joined.slice(0, -1)
    : joined
  return normalized.startsWith('/') ? normalized : `/${normalized}`
}
