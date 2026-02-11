export type BookingStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type BookingFrequency = 'ONCE' | 'WEEKLY' | 'MONTHLY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Address {
  id: string;
  userId: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  expertId: string;
  serviceId: string;
  status: BookingStatus;
  frequency: BookingFrequency;
  startDate: string;
  timeSlot: string;
  duration: number;
  addressId: string;
  address?: Address;
  baseAmount: number;
  gst: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  couponCode?: string;
  discount?: number;
  createdAt: string;
  updatedAt: string;
  cancelledBy?: 'CUSTOMER' | 'EXPERT';
  cancellationReason?: string;
  otpStart?: string;
  otpEnd?: string;
  reviewId?: string;
}

export interface CreateBookingRequest {
  expertId: string;
  serviceId: string;
  frequency: BookingFrequency;
  startDate: string;
  timeSlot: string;
  duration: number;
  addressId: string;
  couponCode?: string;
}

export interface ModifyBookingRequest {
  expertId?: string;
  serviceId?: string;
  frequency?: BookingFrequency;
  startDate?: string;
  timeSlot?: string;
  duration?: number;
  addressId?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  eligibility: string;
  minAmount: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount?: number;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  expertId: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'CARD' | 'UPI' | 'NET_BANKING';
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
  cardNumber?: string;
  cardholderName?: string;
  upiId?: string;
}
