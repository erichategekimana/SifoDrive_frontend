/**
 * Sifo Drive — User Domain Model
 * Encapsulates identity, role permissions, and legal consent status.
 */

export type UserRole = 'GUEST' | 'STUDENT' | 'TUTOR' | 'AGENT' | 'FINANCE_OFFICER' | 'BOARD_REVIEWER' | 'TRAINING_ADMIN' | 'ENTERPRISE_ADMIN' | 'SYSTEM_ADMIN';
export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface UserDTO {
  id: string;
  phone_number?: string;
  phoneNumber?: string;
  email?: string;
  role: UserRole;
  full_name?: string;
  fullName?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  profile_photo?: string | null;
  profilePhoto?: string | null;
  biography?: string;
  links?: Array<{ title: string; url: string }>;
  contact_methods?: Array<{ type: string; value: string; is_primary?: boolean }>;
  contactMethods?: Array<{ type: string; value: string; is_primary?: boolean }>;
  two_factor_enabled?: boolean;
  twoFactorEnabled?: boolean;
  two_factor_method?: 'phone' | 'email';
  twoFactorMethod?: 'phone' | 'email';
  last_login_ip?: string | null;
  lastLoginIp?: string | null;
  last_login?: string | null;
  lastLogin?: string | null;
  status: UserStatus;
  student_id?: string | null;
  studentId?: string | null;
  terms_accepted?: boolean;
  termsAccepted?: boolean;
  privacy_accepted?: boolean;
  privacyAccepted?: boolean;
}

export class User {
  public readonly id: string;
  public readonly phoneNumber: string;
  public readonly email: string;
  public readonly role: UserRole;
  public readonly fullName: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly profilePhoto: string | null;
  public readonly biography: string;
  public readonly links: Array<{ title: string; url: string }>;
  public readonly contactMethods: Array<{ type: string; value: string; is_primary?: boolean }>;
  public readonly twoFactorEnabled: boolean;
  public readonly twoFactorMethod: 'phone' | 'email';
  public readonly lastLoginIp: string | null;
  public readonly lastLogin: string | null;
  public readonly status: UserStatus;
  public readonly studentId: string | null;
  public readonly termsAccepted: boolean;
  public readonly privacyAccepted: boolean;

  constructor(dto: UserDTO) {
    this.id = dto.id;
    this.phoneNumber = dto.phoneNumber || dto.phone_number || '';
    this.email = dto.email || '';
    this.role = dto.role;
    this.firstName = dto.firstName || dto.first_name || '';
    this.lastName = dto.lastName || dto.last_name || '';
    this.fullName = dto.fullName || dto.full_name || `${this.firstName} ${this.lastName}`.trim() || 'User';
    this.profilePhoto = dto.profilePhoto ?? dto.profile_photo ?? null;
    this.biography = dto.biography || '';
    this.links = Array.isArray(dto.links) ? dto.links : [];
    this.contactMethods = Array.isArray(dto.contactMethods || dto.contact_methods) ? (dto.contactMethods || dto.contact_methods)! : [];
    this.twoFactorEnabled = Boolean(dto.twoFactorEnabled ?? dto.two_factor_enabled ?? false);
    this.twoFactorMethod = dto.twoFactorMethod || dto.two_factor_method || 'phone';
    this.lastLoginIp = dto.lastLoginIp ?? dto.last_login_ip ?? null;
    this.lastLogin = dto.lastLogin ?? dto.last_login ?? null;
    this.status = dto.status;
    this.studentId = dto.studentId ?? dto.student_id ?? null;
    this.termsAccepted = Boolean(
      dto.termsAccepted ??
      dto.terms_accepted ??
      (dto as any).has_accepted_terms
    );
    this.privacyAccepted = Boolean(
      dto.privacyAccepted ??
      dto.privacy_accepted ??
      (dto as any).has_accepted_privacy_policy
    );
  }


  public isGuest(): boolean {
    return this.role === 'GUEST';
  }

  public isStudent(): boolean {
    return this.role === 'STUDENT';
  }

  public isTutor(): boolean {
    return this.role === 'TUTOR';
  }

  public isAgent(): boolean {
    return this.role === 'AGENT';
  }

  public isTrainingAdmin(): boolean {
    return this.role === 'TRAINING_ADMIN';
  }

  public isBoardReviewer(): boolean {
    return this.role === 'BOARD_REVIEWER';
  }

  public isEnterpriseAdmin(): boolean {
    return this.role === 'ENTERPRISE_ADMIN';
  }

  public isAdmin(): boolean {
    return this.role === 'SYSTEM_ADMIN';
  }

  public isSystemAdmin(): boolean {
    return this.role === 'SYSTEM_ADMIN';
  }

  public isAnyAdmin(): boolean {
    return this.role === 'SYSTEM_ADMIN' || this.role === 'TRAINING_ADMIN';
  }

  public isStaff(): boolean {
    return ['TUTOR', 'AGENT', 'FINANCE_OFFICER', 'BOARD_REVIEWER', 'TRAINING_ADMIN', 'ENTERPRISE_ADMIN', 'SYSTEM_ADMIN'].includes(this.role);
  }

  public hasAcceptedLegalConsent(): boolean {
    return this.termsAccepted && this.privacyAccepted;
  }

  public canAccessStudentContent(): boolean {
    return this.isStudent() || this.isStaff();
  }

  public getInitials(): string {
    const parts = this.fullName.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (this.fullName[0] || 'U').toUpperCase();
  }

  public getRoleDisplay(): string {
    switch (this.role) {
      case 'GUEST': return 'Guest Learner';
      case 'STUDENT': return 'Full Student';
      case 'TUTOR': return 'Theory Instructor';
      case 'AGENT': return 'Irembo Agent';
      case 'TRAINING_ADMIN': return 'Training Administrator';
      case 'BOARD_REVIEWER': return 'Board Reviewer';
      case 'ENTERPRISE_ADMIN': return 'Driving School Director';
      case 'SYSTEM_ADMIN': return 'System Administrator';
      default: return this.role;
    }
  }
}
