import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BookingState } from './booking.reducer';

export const selectBookingState = createFeatureSelector<BookingState>('booking');

export const selectCustomerBookings = createSelector(
  selectBookingState,
  (state) => state.customerBookings
);

export const selectExpertBookings = createSelector(
  selectBookingState,
  (state) => state.expertBookings
);

export const selectAddresses = createSelector(
  selectBookingState,
  (state) => state.addresses
);

export const selectLastCreatedBooking = createSelector(
  selectBookingState,
  (state) => state.lastCreatedBooking
);

export const selectBookingLoading = createSelector(
  selectBookingState,
  (state) => ({
    customerBookings: state.loadingCustomerBookings,
    expertBookings: state.loadingExpertBookings,
    addresses: state.loadingAddresses,
    creatingBooking: state.creatingBooking,
    patchingBooking: state.patchingBooking,
    creatingAddress: state.creatingAddress
  })
);

export const selectBookingError = createSelector(
  selectBookingState,
  (state) => state.error
);
