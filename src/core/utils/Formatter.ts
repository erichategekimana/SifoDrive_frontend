/**
 * Sifo Drive — Formatter Utilities
 * Formats currencies, dates, Rwandan phone numbers, and time intervals.
 */

export class Formatter {
  /**
   * Format Rwandan Francs (e.g. 15,000 RWF)
   */
  public static currency(amount: number | string | null | undefined): string {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
      return '0 RWF';
    }
    const num = Number(amount);
    return new Intl.NumberFormat('en-RW', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(num) + ' RWF';
  }

  /**
   * Format dates to a readable Rwandan / International standard
   */
  public static date(dateString: string | Date | null | undefined): string {
    if (!dateString) return '—';
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  }

  /**
   * Format date + time
   */
  public static dateTime(dateString: string | Date | null | undefined): string {
    if (!dateString) return '—';
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }

  /**
   * Format Rwandan phone number (+250 78X XXX XXX)
   */
  public static phoneNumber(phone: string | null | undefined): string {
    if (!phone) return '—';
    const clean = phone.replace(/[^\d+]/g, '');
    if (clean.startsWith('+250') && clean.length === 13) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7, 10)} ${clean.slice(10)}`;
    }
    return phone;
  }
}
