/**
 * Sifo Drive — Live Class Domain Model
 * Google Meet interactive classes and timetable scheduling.
 */

export type LiveClassStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';

export interface LiveClassDTO {
  id: string;
  title: string;
  topic?: string;
  cohort?: string;
  cohort_name?: string;
  cohort_code?: string;
  tutor?: string;
  tutor_name?: string;
  created_by?: string;
  created_by_name?: string;
  created_by_role?: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  google_meet_url: string;
  status: LiveClassStatus;
  is_published?: boolean;
  notes?: string;
  recording_url?: string;
  is_past?: boolean;
  actual_started_at?: string;
  actual_ended_at?: string;
}

export class LiveClass {
  public readonly id: string;
  public readonly title: string;
  public readonly topic: string;
  public readonly cohortId?: string;
  public readonly cohortName: string;
  public readonly cohortCode: string;
  public readonly tutorId?: string;
  public readonly tutorName: string;
  public readonly createdByName: string;
  public readonly createdByRole: string;
  public readonly scheduledDate: string;
  public readonly startTime: string;
  public readonly endTime: string;
  public readonly googleMeetUrl: string;
  public readonly status: LiveClassStatus;
  public readonly notes: string;
  public readonly recordingUrl: string;
  public readonly isPast: boolean;

  constructor(dto: LiveClassDTO) {
    this.id = dto.id;
    this.title = dto.title;
    this.topic = dto.topic || '';
    this.cohortId = dto.cohort;
    this.cohortName = dto.cohort_name || 'All Enrolled Students';
    this.cohortCode = dto.cohort_code || '';
    this.tutorId = dto.tutor;
    this.tutorName = dto.tutor_name || 'Senior Instructor';
    this.createdByName = dto.created_by_name || 'Training Admin';
    this.createdByRole = dto.created_by_role || 'TRAINING_ADMIN';
    this.scheduledDate = dto.scheduled_date;
    this.startTime = dto.start_time;
    this.endTime = dto.end_time;
    this.googleMeetUrl = dto.google_meet_url;
    this.notes = dto.notes || '';
    this.recordingUrl = dto.recording_url || '';

    // Dynamically evaluate status based on current date & time
    const initialStatus = dto.status;
    if (initialStatus === 'CANCELLED' || initialStatus === 'RESCHEDULED') {
      this.status = initialStatus;
      this.isPast = dto.is_past ?? false;
    } else if (dto.scheduled_date) {
      const parts = dto.scheduled_date.split('T')[0].split('-').map(Number);
      if (parts.length === 3) {
        const now = new Date();
        let startH = 0, startM = 0;
        if (dto.start_time) {
          const sp = dto.start_time.split(':').map(Number);
          startH = sp[0] || 0;
          startM = sp[1] || 0;
        }
        let endH = startH + 1, endM = startM;
        if (dto.end_time) {
          const ep = dto.end_time.split(':').map(Number);
          endH = ep[0] || 0;
          endM = ep[1] || 0;
        }
        const startDt = new Date(parts[0], parts[1] - 1, parts[2], startH, startM, 0);
        const endDt = new Date(parts[0], parts[1] - 1, parts[2], endH, endM, 0);

        if (now > endDt) {
          this.status = 'COMPLETED';
          this.isPast = true;
        } else if (now >= startDt && now <= endDt) {
          this.status = 'IN_PROGRESS';
          this.isPast = false;
        } else {
          this.status = 'SCHEDULED';
          this.isPast = false;
        }
      } else {
        this.status = dto.status || 'SCHEDULED';
        this.isPast = dto.is_past ?? false;
      }
    } else {
      this.status = dto.status || 'SCHEDULED';
      this.isPast = dto.is_past ?? false;
    }
  }

  public isLiveNow(): boolean {
    return this.status === 'IN_PROGRESS';
  }

  public isJoinable(): boolean {
    return this.status === 'IN_PROGRESS' || this.status === 'SCHEDULED';
  }

  public hasRecording(): boolean {
    return Boolean(this.recordingUrl && this.recordingUrl.trim().length > 0);
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
