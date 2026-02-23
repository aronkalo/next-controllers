/**
 * Base HTTP exception class.
 * Throw these from controller handlers, guards, or middleware
 * and the exception filter will convert them to proper HTTP responses.
 */
export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'HttpException'
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request', details?: unknown) {
    super(400, message, details)
    this.name = 'BadRequestException'
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(401, message, details)
    this.name = 'UnauthorizedException'
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden', details?: unknown) {
    super(403, message, details)
    this.name = 'ForbiddenException'
  }
}

/**
 * 404 Not Found
 */
export class NotFoundException extends HttpException {
  constructor(message = 'Not Found', details?: unknown) {
    super(404, message, details)
    this.name = 'NotFoundException'
  }
}

/**
 * 409 Conflict
 */
export class ConflictException extends HttpException {
  constructor(message = 'Conflict', details?: unknown) {
    super(409, message, details)
    this.name = 'ConflictException'
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerErrorException extends HttpException {
  constructor(message = 'Internal Server Error', details?: unknown) {
    super(500, message, details)
    this.name = 'InternalServerErrorException'
  }
}
