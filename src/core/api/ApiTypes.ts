/**
 * Sifo Drive — Standard API Types
 * Mirrors the backend DRF SuccessResponseMixin and error payload structure.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface ApiListResponse<T = unknown> {
  success: boolean;
  count: number;
  results: T[];
  next?: string | null;
  previous?: string | null;
  message?: string;
}

export interface ApiErrorBlock {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBlock;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface AuthSuccessData {
  access: string;
  refresh: string;
  user: {
    id: string;
    role: string;
    full_name: string;
    status: string;
    student_id?: string | null;
    terms_accepted: boolean;
    privacy_accepted: boolean;
  };
}
