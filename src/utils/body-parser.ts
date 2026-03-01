/**
 * Parse request body based on Content-Type header
 * Supports application/json and application/x-www-form-urlencoded
 */
export function parseBody(text: string, contentType?: string): Record<string, any> {
  if (!text) {
    return {}
  }

  // Extract the media type, removing charset and other parameters
  const mediaType = (contentType || 'application/json').split(';')[0].toLowerCase().trim()

  switch (mediaType) {
    case 'application/x-www-form-urlencoded':
      return parseFormUrlEncoded(text)
    case 'application/json':
    default:
      return parseJSON(text)
  }
}

/**
 * Parse JSON text, return empty object on empty string
 */
function parseJSON(text: string): Record<string, any> {
  if (!text) {
    return {}
  }
  return JSON.parse(text)
}

/**
 * Parse application/x-www-form-urlencoded text into object
 * Uses URLSearchParams for automatic URL decoding
 */
function parseFormUrlEncoded(text: string): Record<string, any> {
  if (!text) {
    return {}
  }

  const params = new URLSearchParams(text)
  const result: Record<string, any> = {}

  // Convert URLSearchParams to plain object
  // Note: URLSearchParams.entries() returns only the last value for duplicate keys
  for (const [key, value] of params.entries()) {
    result[key] = value
  }

  return result
}
