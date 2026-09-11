import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import type { AuthSuccessData, TokenPair } from '../api/ApiTypes';
import { User, type UserDTO } from '../models/User';
import { LocalStorageService } from '../storage/LocalStorageService';
import { Logger } from '../utils/Logger';

const logger = new Logger('AuthService');

export class AuthService {
  private static instance: AuthService;
  private readonly http: HttpClient;
  private readonly storage: LocalStorageService;

  private constructor() {
    this.http = HttpClient.getInstance();
    this.storage = LocalStorageService.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Request a 6-digit OTP via SMS
   */
  public async requestOtp(phoneNumber: string, purpose: 'LOGIN' | 'REGISTRATION' | 'PASSWORD_RESET' = 'LOGIN'): Promise<void> {
    logger.info(`Requesting OTP for ${phoneNumber} (${purpose})`);
    await this.http.post(
      ApiEndpoints.AUTH.OTP_REQUEST,
      { phone_number: phoneNumber, purpose },
      false
    );
  }

  /**
   * Verify OTP and store tokens & user session
   */
  public async verifyOtp(phoneNumber: string, otpCode: string, purpose: 'LOGIN' | 'REGISTRATION' = 'LOGIN'): Promise<User> {
    logger.info(`Verifying OTP for ${phoneNumber}`);
    const data = await this.http.post<AuthSuccessData>(
      ApiEndpoints.AUTH.OTP_VERIFY,
      {
        phone_number: phoneNumber,
        otp_code: otpCode,
        purpose,
      },
      false
    );

    const tokens: TokenPair = { access: data.access, refresh: data.refresh };
    this.storage.setItem('sifo_tokens', tokens);

    const user = new User({
      id: data.user.id,
      role: data.user.role as any,
      full_name: data.user.full_name,
      status: data.user.status as any,
      student_id: data.user.student_id,
      terms_accepted: data.user.terms_accepted,
      privacy_accepted: data.user.privacy_accepted,
      phone_number: phoneNumber,
    });

    this.storage.setItem('sifo_user', data.user);
    logger.info(`User authenticated: ${user.fullName} [${user.role}]`);
    return user;
  }

  /**
   * Register a new free Guest Learner
   */
  public async registerGuest(payload: {
    first_name: string;
    last_name: string;
    phone_number: string;
    password?: string;
    terms_of_service_accepted: boolean;
  }): Promise<{ phone_number: string }> {
    logger.info(`Registering guest learner: ${payload.phone_number}`);
    return this.http.post<{ phone_number: string }>(
      ApiEndpoints.AUTH.REGISTER_GUEST,
      payload,
      false
    );
  }

  /**
   * Register a new full Student
   */
  public async registerStudent(payload: {
    first_name: string;
    last_name: string;
    phone_number: string;
    password?: string;
    terms_of_service_accepted: boolean;
    privacy_policy_accepted: boolean;
    national_id?: string;
  }): Promise<{ phone_number: string }> {
    logger.info(`Registering student: ${payload.phone_number}`);
    return this.http.post<{ phone_number: string }>(
      ApiEndpoints.AUTH.REGISTER_STUDENT,
      payload,
      false
    );
  }

  /**
   * Accept Terms of Service
   */
  public async acceptTermsOfService(): Promise<void> {
    logger.info('Submitting Terms of Service consent');
    await this.http.post(ApiEndpoints.AUTH.CONSENT_TERMS, { terms_of_service_accepted: true });
    this.refreshLocalUserConsent({ termsAccepted: true });
  }

  /**
   * Accept Privacy Policy
   */
  public async acceptPrivacyPolicy(): Promise<void> {
    logger.info('Submitting Privacy Policy consent');
    await this.http.post(ApiEndpoints.AUTH.CONSENT_PRIVACY, { privacy_policy_accepted: true });
    this.refreshLocalUserConsent({ privacyAccepted: true });
  }

  /**
   * Fetch current user profile
   */
  public async getProfile(): Promise<User> {
    const data = await this.http.get<UserDTO>(ApiEndpoints.AUTH.ME);
    const user = new User(data);
    this.storage.setItem('sifo_user', data);
    return user;
  }

  /**
   * Get cached local user if available
   */
  public getStoredUser(): User | null {
    const raw = this.storage.getItem<UserDTO>('sifo_user');
    return raw ? new User(raw) : null;
  }

  public setStoredUser(user: User): void {
    this.storage.setItem('sifo_user', {
      id: user.id,
      phone_number: user.phoneNumber,
      role: user.role,
      full_name: user.fullName,
      status: user.status,
      student_id: user.studentId,
      terms_accepted: user.termsAccepted,
      privacy_accepted: user.privacyAccepted,
    });
  }

  /**
   * Clear session
   */
  public logout(): void {
    logger.info('Logging out user session');
    this.storage.removeItem('sifo_tokens');
    this.storage.removeItem('sifo_user');
  }

  private refreshLocalUserConsent(patch: { termsAccepted?: boolean; privacyAccepted?: boolean }): void {
    const current = this.storage.getItem<UserDTO>('sifo_user');
    if (current) {
      if (patch.termsAccepted !== undefined) current.terms_accepted = patch.termsAccepted;
      if (patch.privacyAccepted !== undefined) current.privacy_accepted = patch.privacyAccepted;
      this.storage.setItem('sifo_user', current);
    }
  }
}
