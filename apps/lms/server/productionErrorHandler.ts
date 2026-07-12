import { Request, Response, NextFunction } from 'express';

/**
 * Production-ready error handler with comprehensive logging and user-friendly messages
 */
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export class ProductionError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'ProductionError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleValidationError = (message: string) => {
  return new ProductionError(message, 400, 'VALIDATION_ERROR');
};

export const handleAuthError = (message: string = 'Authentication required') => {
  return new ProductionError(message, 401, 'AUTH_ERROR');
};

export const handleNotFoundError = (resource: string = 'Resource') => {
  return new ProductionError(`${resource} not found`, 404, 'NOT_FOUND');
};

export const handleDatabaseError = (error: any) => {
  console.error('Database error:', error);
  return new ProductionError('Database operation failed', 500, 'DATABASE_ERROR');
};

export const handlePaymentError = (message: string) => {
  return new ProductionError(message, 402, 'PAYMENT_ERROR');
};

export const handleEmailError = (message: string) => {
  return new ProductionError(`Email service error: ${message}`, 503, 'EMAIL_ERROR');
};

/**
 * Global error handler middleware for production
 */
export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.isOperational = err.isOperational || false;

  // Log error details for debugging
  console.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    code: err.code,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Determine user-friendly error message
  let userMessage = 'An unexpected error occurred. Please try again.';
  
  switch (err.code) {
    case 'VALIDATION_ERROR':
      userMessage = err.message;
      break;
    case 'AUTH_ERROR':
      userMessage = 'Authentication required. Please log in again.';
      break;
    case 'NOT_FOUND':
      userMessage = err.message;
      break;
    case 'DATABASE_ERROR':
      userMessage = 'Database temporarily unavailable. Please try again in a moment.';
      break;
    case 'PAYMENT_ERROR':
      userMessage = 'Payment processing failed. Please check your payment details and try again.';
      break;
    case 'EMAIL_ERROR':
      userMessage = 'Email service temporarily unavailable. The system administrator has been notified.';
      break;
    default:
      if (err.isOperational) {
        userMessage = err.message;
      }
  }

  // Send error response
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: userMessage,
      code: err.code,
      timestamp: new Date().toISOString()
    },
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        originalMessage: err.message,
        stack: err.stack
      }
    })
  });
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = handleNotFoundError(`Route ${req.originalUrl}`);
  next(error);
};