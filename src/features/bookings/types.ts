import type {
  BookingOrderItem,
  CategoryPricingItem,
  PaginatedResult,
} from '../../core/services/AdminService';

export type BookingsTab = 'ORDERS' | 'PRICING';
export type BookingActionType = 'ASSIGN' | 'STATUS' | 'COMPLETE';

export type {
  BookingOrderItem,
  CategoryPricingItem,
  PaginatedResult,
};
