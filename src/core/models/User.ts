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
  role: UserRole;
  full_name?: string;
  fullName?: string;
  first_name?: string;
  last_name?: string;
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
  public readonly role: UserRole;
  public readonly fullName: string;
  public readonly status: UserStatus;
  public readonly studentId: string | null;
  public readonly termsAccepted: boolean;
  public readonly privacyAccepted: boolean;

  constructor(dto: UserDTO) {
    this.id = dto.id;
    this.phoneNumber = dto.phoneNumber || dto.phone_number || '';
    this.role = dto.role;
    this.fullName = dto.fullName || dto.full_name || `${dto.first_name || ''} ${dto.last_name || ''}`.trim() || 'User';
    this.status = dto.status;
    this.studentId = dto.studentId ?? dto.student_id ?? null;
    this.termsAccepted = Boolean(dto.termsAccepted ?? dto.terms_accepted);
    this.privacyAccepted = Boolean(dto.privacyAccepted ?? dto.privacy_accepted);
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
