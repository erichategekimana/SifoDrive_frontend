/**
 * Sifo Drive — Driving Test Booking Domain Model
 * Irembo Driving Test Concierge applications.
 */

import { Formatter } from '../utils/Formatter';

export type LicenseCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'SLOTS_UNAVAILABLE'
  | 'CANCELLED';

export interface BookingDTO {
  id: string;
  ticket_number?: string;
  ticketNumber?: string;
  category: LicenseCategory;
  preferred_district: string;
  preferred_site?: string;
  application_fee_rwf: number;
  status: BookingStatus;
  created_at: string;
  bill_id?: string;
  irembo_application_number?: string;
  scheduled_exam_date?: string | null;
  agent_notes?: string;
}

export class Booking {
  public readonly id: string;
  public readonly ticketNumber: string;
  public readonly category: LicenseCategory;
  public readonly preferredDistrict: string;
  public readonly preferredSite: string;
  public readonly applicationFeeRwf: number;
  public readonly status: BookingStatus;
  public readonly createdAt: string;
  public readonly billId: string;
  public readonly iremboApplicationNumber: string | null;
  public readonly scheduledExamDate: string | null;

  constructor(dto: BookingDTO) {
    this.id = dto.id;
    this.ticketNumber = dto.ticketNumber || dto.ticket_number || `TK-${dto.id.slice(0, 8).toUpperCase()}`;
    this.category = dto.category;
    this.preferredDistrict = dto.preferred_district;
    this.preferredSite = dto.preferred_site || '';
    this.applicationFeeRwf = dto.application_fee_rwf || 0;
    this.status = dto.status;
    this.createdAt = dto.created_at;
    this.billId = dto.bill_id || '';
    this.iremboApplicationNumber = dto.irembo_application_number || null;
    this.scheduledExamDate = dto.scheduled_exam_date || null;
  }

  public getFormattedFee(): string {
    return Formatter.currency(this.applicationFeeRwf);
  }

  public canCancel(): boolean {
    return ['PENDING_PAYMENT', 'QUEUED'].includes(this.status);
  }

  public getStatusBadge(): { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'neutral' } {
    switch (this.status) {
      case 'COMPLETED': return { label: 'Exam Booked', variant: 'success' };
      case 'PROCESSING': return { label: 'Agent Booking Slot', variant: 'warning' };
      case 'QUEUED': return { label: 'Queued for Slots', variant: 'info' };
      case 'PENDING_PAYMENT': return { label: 'Payment Pending', variant: 'warning' };
      case 'SLOTS_UNAVAILABLE': return { label: 'Retained in Queue', variant: 'neutral' };
      case 'CANCELLED': return { label: 'Cancelled', variant: 'danger' };
      default: return { label: this.status, variant: 'neutral' };
    }
  }

  public getCategoryDisplay(): string {
    switch (this.category) {
      case 'A': return 'Category A (Motorcycle)';
      case 'B': return 'Category B (Passenger Car)';
      case 'C': return 'Category C (Heavy Truck)';
      case 'D': return 'Category D (Passenger Bus)';
      case 'E': return 'Category E (Trailer)';
      case 'F': return 'Category F (Special Vehicle)';
      default: return `Category ${this.category}`;
    }
  }
}
