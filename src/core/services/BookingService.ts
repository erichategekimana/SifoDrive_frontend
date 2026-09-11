import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import { Booking, type BookingDTO, type LicenseCategory } from '../models/Booking';
import { Logger } from '../utils/Logger';

const logger = new Logger('BookingService');

export interface CategoryPricingItem {
  category: LicenseCategory;
  price_rwf: number;
  description: string;
}

export class BookingService {
  private static instance: BookingService;
  private readonly http: HttpClient;

  private constructor() {
    this.http = HttpClient.getInstance();
  }

  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  /**
   * Fetch active category pricing
   */
  public async getPricing(): Promise<CategoryPricingItem[]> {
    try {
      const data = await this.http.get<any>(ApiEndpoints.BOOKING.PRICING, false);
      const results = Array.isArray(data) ? data : data.results || [];
      return results;
    } catch {
      return [
        { category: 'A', price_rwf: 10000, description: 'Motorcycle Provisional Test' },
        { category: 'B', price_rwf: 15000, description: 'Passenger Car Provisional Test' },
        { category: 'C', price_rwf: 20000, description: 'Heavy Commercial Vehicle Test' },
        { category: 'D', price_rwf: 25000, description: 'Bus Transport Test' },
      ];
    }
  }

  /**
   * Fetch Rwanda district choices and testing sites
   */
  public async getDistricts(): Promise<{ districts: string[]; sites: Record<string, string[]> }> {
    try {
      return await this.http.get(ApiEndpoints.BOOKING.DISTRICTS, false);
    } catch {
      return {
        districts: [
          'GASABO', 'KICUKIRO', 'NYARUGENGE',
          'MUSANZE', 'GICUMBI', 'RUBAVU', 'HUYE', 'RWAMAGANA'
        ],
        sites: {
          'KICUKIRO': ['BUSANZA AUTOMATED CENTER', 'BUSANZA SITE (KIC)'],
          'GASABO': ['REMERA TESTING CENTER'],
          'NYARUGENGE': ['NYAMIRAMBO TESTING CENTER'],
        },
      };
    }
  }

  /**
   * Submit an Irembo Driving Test Concierge application
   */
  public async submitApplication(payload: {
    category: LicenseCategory;
    preferred_district: string;
    preferred_site?: string;
    applicant_name: string;
    applicant_national_id: string;
    applicant_phone: string;
  }): Promise<Booking> {
    logger.info(`Submitting booking application for Category ${payload.category}`);
    const data = await this.http.post<BookingDTO>(ApiEndpoints.BOOKING.APPLY, payload);
    return new Booking(data);
  }

  /**
   * Get student's booking history
   */
  public async getMyBookings(): Promise<Booking[]> {
    try {
      const data = await this.http.get<any>(ApiEndpoints.BOOKING.MY_BOOKINGS);
      const results = Array.isArray(data) ? data : data.results || [];
      return results.map((dto: BookingDTO) => new Booking(dto));
    } catch {
      return [];
    }
  }

  /**
   * Cancel booking
   */
  public async cancelBooking(bookingId: string): Promise<void> {
    logger.info(`Cancelling booking ${bookingId}`);
    await this.http.post(ApiEndpoints.BOOKING.CANCEL(bookingId));
  }
}
