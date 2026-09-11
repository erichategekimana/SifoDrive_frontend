/**
 * Sifo Drive — Live Class Domain Model
 * Google Meet interactive classes and timetable scheduling.
 */

export type LiveClassStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';

export interface LiveClassDTO {
  id: string;
  title: string;
  topic?: string;
  cohort_name?: string;
  tutor_name?: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  google_meet_url: string;
  status: LiveClassStatus;
  is_published?: boolean;
}

export class LiveClass {
  public readonly id: string;
  public readonly title: string;
  public readonly topic: string;
  public readonly cohortName: string;
  public readonly tutorName: string;
  public readonly scheduledDate: string;
  public readonly startTime: string;
  public readonly endTime: string;
  public readonly googleMeetUrl: string;
  public readonly status: LiveClassStatus;

  constructor(dto: LiveClassDTO) {
    this.id = dto.id;
    this.title = dto.title;
    this.topic = dto.topic || '';
    this.cohortName = dto.cohort_name || 'All Enrolled Students';
    this.tutorName = dto.tutor_name || 'Senior Instructor';
    this.scheduledDate = dto.scheduled_date;
    this.startTime = dto.start_time;
    this.endTime = dto.end_time;
    this.googleMeetUrl = dto.google_meet_url;
    this.status = dto.status;
  }

  public isLiveNow(): boolean {
    return this.status === 'IN_PROGRESS';
  }

  public isJoinable(): boolean {
    return this.status === 'IN_PROGRESS' || this.status === 'SCHEDULED';
  }

  public getFormattedTimeRange(): string {
    return `${this.startTime.slice(0, 5)} – ${this.endTime.slice(0, 5)} CAT`;
  }

  public getStatusBadge(): { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'neutral' } {
    switch (this.status) {
      case 'IN_PROGRESS': return { label: 'LIVE NOW', variant: 'danger' };
      case 'SCHEDULED': return { label: 'SCHEDULED', variant: 'info' };
      case 'COMPLETED': return { label: 'COMPLETED', variant: 'success' };
      case 'CANCELLED': return { label: 'CANCELLED', variant: 'neutral' };
      default: return { label: this.status, variant: 'warning' };
    }
  }
}
