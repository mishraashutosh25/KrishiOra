import { Request, Response, NextFunction } from "express";

/**
 * Base Application Error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode = 500, code?: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access", code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden", code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

export class ValidationError extends AppError {
  public readonly errors?: Record<string, string>;

  constructor(message = "Validation failed", errors?: Record<string, string>, code = "VALIDATION_ERROR") {
    super(message, 422, code);
    this.errors = errors;
  }
}

/**
 * Global Express Error Handling Middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = (err as AppError).statusCode || 500;
  const code = (err as AppError).code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "An unexpected error occurred. Please try again later.";

  if (process.env.NODE_ENV !== "test" && statusCode === 500) {
    console.error(`[Global Error] ${req.method} ${req.originalUrl}:`, err);
  }

  return res.status(statusCode).json({
    success: false,
    code,
    message,
    ...((err as ValidationError).errors ? { errors: (err as ValidationError).errors } : {}),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
