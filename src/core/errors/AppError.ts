/**
 * Sifo Drive — Object-Oriented Error Hierarchy
 * Provides typed domain errors mapped to DRF error codes.
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: Record<string, string[]>;

  constructor(message: string, code = 'app_error', statusCode?: number, details?: Record<string, string[]>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public getFriendlyMessage(): string {
    return this.message || 'An unexpected error occurred. Please try again.';
  }
}

export class HttpError extends AppError {
  constructor(message: string, statusCode: number, code = 'http_error', details?: Record<string, string[]>) {
    super(message, code, statusCode, details);
  }
}

export class AuthError extends HttpError {
  constructor(message = 'Authentication required or session expired', code = 'authentication_failed', statusCode = 401) {
    super(message, statusCode, code);
  }
}

export class ConsentRequiredError extends HttpError {
  public readonly consentType?: string;

  constructor(message = 'Legal consent is required to proceed', consentType?: string) {
    super(message, 403, 'consent_required');
    this.consentType = consentType;
  }
}

export class ValidationError extends HttpError {
  constructor(message = 'Invalid request data', details?: Record<string, string[]>) {
    super(message, 400, 'validation_error', details);
  }

  public getFirstFieldError(): string | null {
    if (!this.details) return null;
    const firstKey = Object.keys(this.details)[0];
    if (!firstKey) return null;
    const errors = this.details[firstKey];
    return errors && errors.length > 0 ? `${firstKey}: ${errors[0]}` : null;
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network connection failed. Please check your internet connection.') {
    super(message, 'network_error');
  }
}
