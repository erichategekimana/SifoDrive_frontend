import { ApiEndpoints } from './ApiEndpoints';
import type { ApiResponse, ApiErrorResponse, TokenPair } from './ApiTypes';
import { AppError, AuthError, ConsentRequiredError, HttpError, NetworkError, ValidationError } from '../errors/AppError';
import { LocalStorageService } from '../storage/LocalStorageService';
import { Logger } from '../utils/Logger';

const logger = new Logger('HttpClient');

export class HttpClient {
  private static instance: HttpClient;
  private readonly storage: LocalStorageService;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private constructor() {
    this.storage = LocalStorageService.getInstance();
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  /**
   * Primary request method with error handling and automatic retry on 401.
   */
  public async request<T = unknown>(
    url: string,
    options: RequestInit = {},
    requiresAuth = true,
    isRetry = false
  ): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (requiresAuth) {
      const tokens = this.storage.getItem<TokenPair>('sifo_tokens');
      if (tokens?.access) {
        headers.set('Authorization', `Bearer ${tokens.access}`);
      }
    }

    try {
      logger.debug(`[${options.method || 'GET'}] ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 204 No Content
      if (response.status === 204) {
        return null as unknown as T;
      }

      // Handle 401 Unauthorized with Automatic Refresh
      if (response.status === 401 && requiresAuth && !isRetry) {
        logger.warn(`Received 401 for ${url}, attempting token refresh`);
        try {
          const newAccessToken = await this.handleTokenRefresh();
          // Retry the original request with the new token
          const retryHeaders = new Headers(options.headers || {});
          retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
          return this.request<T>(url, { ...options, headers: retryHeaders }, requiresAuth, true);
        } catch (refreshErr) {
          logger.error('Token refresh failed:', refreshErr);
          const tokens = this.storage.getItem<TokenPair>('sifo_tokens');
          if (tokens?.access === 'demo-access-token') {
            throw new AuthError('Demo session active');
          }
          this.storage.removeItem('sifo_tokens');
          this.storage.removeItem('sifo_user');
          window.dispatchEvent(new CustomEvent('sifo:auth-expired'));
          throw new AuthError('Session expired. Please log in again.');
        }
      }

      let json: unknown;
      try {
        json = await response.json();
      } catch {
        // Response wasn't JSON
        if (!response.ok) {
          throw new HttpError(response.statusText || 'Server Error', response.status);
        }
        return null as unknown as T;
      }

      // Handle HTTP errors or envelope success: false
      if (!response.ok) {
        this.handleErrorResponse(response.status, json);
      }

      // If response matches standard envelope { success: true, data: ... }
      if (json && typeof json === 'object' && 'success' in json) {
        const env = json as ApiResponse<T>;
        if (env.success === false) {
          this.handleErrorResponse(response.status, json);
        }
        // Return data if present, otherwise whole envelope
        return (env.data !== undefined ? env.data : env) as T;
      }

      return json as T;
    } catch (err: unknown) {
      if (err instanceof AppError) {
        throw err;
      }
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new NetworkError();
      }
      logger.error('Unhandled request exception:', err);
      throw new AppError(err instanceof Error ? err.message : 'Unknown network failure');
    }
  }

  /**
   * Concurrency-safe token refresh mutex queue.
   */
  private async handleTokenRefresh(): Promise<string> {
    const tokens = this.storage.getItem<TokenPair>('sifo_tokens');
    if (!tokens?.refresh) {
      throw new AuthError('No refresh token available');
    }

    if (this.isRefreshing) {
      return new Promise<string>((resolve) => {
        this.refreshSubscribers.push((newToken: string) => {
          resolve(newToken);
        });
      });
    }

    this.isRefreshing = true;

    try {
      logger.info('Refreshing access token...');
      const response = await fetch(ApiEndpoints.AUTH.TOKEN_REFRESH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });

      if (!response.ok) {
        throw new AuthError('Failed to refresh token', 'token_refresh_failed', response.status);
      }

      const json = await response.json();
      const newAccess = json.access || (json.data && json.data.access);
      if (!newAccess) {
        throw new AuthError('Malformed token refresh response');
      }

      // Update storage
      this.storage.setItem('sifo_tokens', {
        access: newAccess,
        refresh: json.refresh || tokens.refresh, // simplejwt may rotate refresh
      });

      logger.info('Access token refreshed successfully');

      // Notify waiting requests
      this.refreshSubscribers.forEach((callback) => callback(newAccess));
      this.refreshSubscribers = [];

      return newAccess;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Maps server error JSON to typed AppError subclass.
   */
  private handleErrorResponse(status: number, json: unknown): never {
    const errEnv = json as ApiErrorResponse;
    const errorBlock = errEnv?.error;
    const message = errorBlock?.message || 'A server error occurred.';
    const code = errorBlock?.code || 'server_error';
    const details = errorBlock?.details;

    if (code === 'consent_required') {
      throw new ConsentRequiredError(message);
    }
    if (status === 401 || code === 'authentication_failed' || code === 'token_expired') {
      throw new AuthError(message, code, status);
    }
    if (status === 400 && (details || code === 'validation_error')) {
      throw new ValidationError(message, details);
    }

    throw new HttpError(message, status, code, details);
  }

  // Convenience HTTP Methods
  public get<T>(url: string, requiresAuth = true): Promise<T> {
    return this.request<T>(url, { method: 'GET' }, requiresAuth);
  }

  public post<T>(url: string, data?: unknown, requiresAuth = true): Promise<T> {
    return this.request<T>(
      url,
      {
        method: 'POST',
        body: data !== undefined ? JSON.stringify(data) : undefined,
      },
      requiresAuth
    );
  }

  public patch<T>(url: string, data?: unknown, requiresAuth = true): Promise<T> {
    return this.request<T>(
      url,
      {
        method: 'PATCH',
        body: data !== undefined ? JSON.stringify(data) : undefined,
      },
      requiresAuth
    );
  }

  public delete<T>(url: string, requiresAuth = true): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' }, requiresAuth);
  }
}
