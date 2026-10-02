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
   * Authenticate with phone number and password (no OTP required)
   */
  public async login(phoneNumber: string, password: string): Promise<User> {
    logger.info(`Authenticating user with password: ${phoneNumber}`);
    const data = await this.http.post<AuthSuccessData>(
      ApiEndpoints.AUTH.LOGIN,
      {
        phone_number: phoneNumber,
        password,
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
      phone_number: data.user.phone_number || phoneNumber,
    });

    this.storage.setItem('sifo_user', data.user);
    logger.info(`User authenticated: ${user.fullName} [${user.role}]`);
    return user;
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
  public async acceptTermsOfService(): Promise<User | null> {
    logger.info('Submitting Terms of Service consent');
    const tokens = this.storage.getItem<TokenPair>('sifo_tokens');
    if (tokens?.access && tokens.access !== 'demo-access-token') {
      try {
        await this.http.post(ApiEndpoints.AUTH.CONSENT_TERMS, {
          accepted: true,
          terms_of_service_accepted: true,
        });
      } catch (err) {
        logger.warn('Remote consent terms submission failed, updating local state:', err);
      }
    }
    return this.refreshLocalUserConsent({ termsAccepted: true });
  }

  /**
   * Accept Privacy Policy
   */
  public async acceptPrivacyPolicy(): Promise<User | null> {
    logger.info('Submitting Privacy Policy consent');
    const tokens = this.storage.getItem<TokenPair>('sifo_tokens');
    if (tokens?.access && tokens.access !== 'demo-access-token') {
      try {
        await this.http.post(ApiEndpoints.AUTH.CONSENT_PRIVACY, {
          accepted: true,
          privacy_policy_accepted: true,
        });
      } catch (err) {
        logger.warn('Remote consent privacy submission failed, updating local state:', err);
      }
    }
    return this.refreshLocalUserConsent({ privacyAccepted: true });
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
   * Update user profile fields (names, bio, links, contacts, 2FA, photo)
   */
  public async updateProfile(payload: Partial<UserDTO> | FormData): Promise<User> {
    logger.info('Updating user profile');
    const data = await this.http.patch<UserDTO>(ApiEndpoints.AUTH.ME, payload);
    const user = new User(data);
    this.storage.setItem('sifo_user', data);
    return user;
  }

  /**
   * Change account password
   */
  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    logger.info('Updating account password');
    await this.http.post(ApiEndpoints.AUTH.PASSWORD_CHANGE, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  /**
   * Fetch dynamic active login sessions
   */
  public async getActiveSessions(): Promise<Array<{ id: string; ip_address: string; user_agent: string; last_active: string | null; is_current: boolean }>> {
    try {
      const data = await this.http.get<Array<{ id: string; ip_address: string; user_agent: string; last_active: string | null; is_current: boolean }>>(
        ApiEndpoints.AUTH.SESSIONS
      );
      return data || [];
    } catch {
      // Fallback to client session if network fails
      return [
        {
          id: 'current',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          last_active: new Date().toISOString(),
          is_current: true,
        },
      ];
    }
  }

  /**
   * Terminate other active sessions
   */
  public async terminateOtherSessions(): Promise<void> {
    await this.http.post(ApiEndpoints.AUTH.SESSIONS_TERMINATE, {});
  }

  /**
   * Get notification preferences
   */
  public async getNotificationPreferences(): Promise<any> {
    try {
      return await this.http.get(ApiEndpoints.AUTH.NOTIFICATION_PREFERENCES);
    } catch {
      return {
        sms_enabled: true,
        email_enabled: false,
        exam_alerts: true,
        booking_alerts: true,
        promo_alerts: false,
      };
    }
  }

  /**
   * Update notification preferences
   */
  public async updateNotificationPreferences(prefs: any): Promise<any> {
    return await this.http.patch(ApiEndpoints.AUTH.NOTIFICATION_PREFERENCES, prefs);
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
      email: user.email,
      role: user.role,
      full_name: user.fullName,
      first_name: user.firstName,
      last_name: user.lastName,
      profile_photo: user.profilePhoto,
      biography: user.biography,
      links: user.links,
      contact_methods: user.contactMethods,
      two_factor_enabled: user.twoFactorEnabled,
      two_factor_method: user.twoFactorMethod,
      last_login_ip: user.lastLoginIp,
      last_login: user.lastLogin,
      status: user.status,
      student_id: user.studentId,
      terms_accepted: user.termsAccepted,
      termsAccepted: user.termsAccepted,
      privacy_accepted: user.privacyAccepted,
      privacyAccepted: user.privacyAccepted,
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

  private refreshLocalUserConsent(patch: { termsAccepted?: boolean; privacyAccepted?: boolean }): User | null {
    const current = this.storage.getItem<UserDTO>('sifo_user');
    if (current) {
      if (patch.termsAccepted !== undefined) {
        current.terms_accepted = patch.termsAccepted;
        current.termsAccepted = patch.termsAccepted;
        (current as any).has_accepted_terms = patch.termsAccepted;
      }
      if (patch.privacyAccepted !== undefined) {
        current.privacy_accepted = patch.privacyAccepted;
        current.privacyAccepted = patch.privacyAccepted;
        (current as any).has_accepted_privacy_policy = patch.privacyAccepted;
      }
      this.storage.setItem('sifo_user', current);
      return new User(current);
    }
    return null;
  }
}

