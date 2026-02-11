import { createAction, props } from '@ngrx/store';
import { BackendAddress, BackendBooking } from '../../core/services/booking.service';

export const loadCustomerBookings = createAction(
  '[Booking] Load Customer Bookings',
  props<{ customerId: string }>()
);

export const loadCustomerBookingsSuccess = createAction(
  '[Booking] Load Customer Bookings Success',
  props<{ bookings: BackendBooking[] }>()
);

export const loadCustomerBookingsFailure = createAction(
  '[Booking] Load Customer Bookings Failure',
  props<{ error: string }>()
);

export const loadExpertBookings = createAction(
  '[Booking] Load Expert Bookings',
  props<{ expertProfileId: string }>()
);

export const loadExpertBookingsSuccess = createAction(
  '[Booking] Load Expert Bookings Success',
  props<{ bookings: BackendBooking[] }>()
);

export const loadExpertBookingsFailure = createAction(
  '[Booking] Load Expert Bookings Failure',
  props<{ error: string }>()
);

export const createBooking = createAction(
  '[Booking] Create Booking',
  props<{ payload: Omit<BackendBooking, 'id' | 'createdAt' | 'updatedAt' | 'otp'> & { otp?: string } }>()
);

export const createBookingSuccess = createAction(
  '[Booking] Create Booking Success',
  props<{ booking: BackendBooking }>()
);

export const createBookingFailure = createAction(
  '[Booking] Create Booking Failure',
  props<{ error: string }>()
);

export const patchBooking = createAction(
  '[Booking] Patch Booking',
  props<{ bookingId: string; patch: Partial<BackendBooking> }>()
);

export const patchBookingSuccess = createAction(
  '[Booking] Patch Booking Success',
  props<{ booking: BackendBooking }>()
);

export const patchBookingFailure = createAction(
  '[Booking] Patch Booking Failure',
  props<{ error: string }>()
);

export const loadCustomerAddresses = createAction(
  '[Booking] Load Customer Addresses',
  props<{ customerId: string }>()
);

export const loadCustomerAddressesSuccess = createAction(
  '[Booking] Load Customer Addresses Success',
  props<{ addresses: BackendAddress[] }>()
);

export const loadCustomerAddressesFailure = createAction(
  '[Booking] Load Customer Addresses Failure',
  props<{ error: string }>()
);

export const createAddress = createAction(
  '[Booking] Create Address',
  props<{ payload: Omit<BackendAddress, 'id'> }>()
);

export const createAddressSuccess = createAction(
  '[Booking] Create Address Success',
  props<{ address: BackendAddress }>()
);

export const createAddressFailure = createAction(
  '[Booking] Create Address Failure',
  props<{ error: string }>()
);

export const clearBookingError = createAction('[Booking] Clear Error');
