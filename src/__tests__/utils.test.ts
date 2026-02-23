import { describe, it, expect } from 'vitest'
import {
  createResponse,
  createErrorResponse,
  createValidationError,
  parseQuery,
} from '../utils/index'

describe('createResponse', () => {
  it('returns 200 JSON response by default', async () => {
    const res = createResponse({ ok: true })
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.ok).toBe(true)
  })

  it('supports custom status', async () => {
    const res = createResponse({ created: true }, { status: 201 })
    expect(res.status).toBe(201)
  })

  it('supports custom headers', async () => {
    const res = createResponse({}, { headers: { 'x-custom': 'yes' } })
    expect(res.headers.get('x-custom')).toBe('yes')
  })
})

describe('createErrorResponse', () => {
  it('returns 500 by default', async () => {
    const res = createErrorResponse('Something failed')
    expect(res.status).toBe(500)
    const body = await res.json() as any
    expect(body.error.message).toBe('Something failed')
  })

  it('supports custom status and code', async () => {
    const res = createErrorResponse('Not found', { status: 404, code: 'NOT_FOUND' })
    expect(res.status).toBe(404)
    const body = await res.json() as any
    expect(body.error.code).toBe('NOT_FOUND')
  })

  it('supports details', async () => {
    const res = createErrorResponse('Bad', { details: { field: 'email' } })
    const body = await res.json() as any
    expect(body.error.details).toEqual({ field: 'email' })
  })
})

describe('createValidationError', () => {
  it('returns 400 with validation errors', async () => {
    const res = createValidationError({
      email: ['Required', 'Must be valid'],
      name: ['Too short'],
    })
    expect(res.status).toBe(400)
    const body = await res.json() as any
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.details.email).toHaveLength(2)
    expect(body.error.details.name).toHaveLength(1)
  })
})

describe('parseQuery', () => {
  it('parses single values', () => {
    const result = parseQuery('http://localhost?a=1&b=2')
    expect(result).toEqual({ a: '1', b: '2' })
  })

  it('parses repeated keys into arrays', () => {
    const result = parseQuery('http://localhost?tag=a&tag=b&tag=c')
    expect(result.tag).toEqual(['a', 'b', 'c'])
  })

  it('returns empty object for no query', () => {
    const result = parseQuery('http://localhost')
    expect(result).toEqual({})
  })
})
