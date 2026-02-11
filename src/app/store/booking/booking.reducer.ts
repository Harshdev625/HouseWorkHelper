import { createReducer, on } from '@ngrx/store';
import { BackendAddress, BackendBooking } from '../../core/services/booking.service';
import * as BookingActions from './booking.actions';

export interface BookingState {
  customerBookings: BackendBooking[];
  expertBookings: BackendBooking[];
  addresses: BackendAddress[];

  loadingCustomerBookings: boolean;
  loadingExpertBookings: boolean;
  loadingAddresses: boolean;

  creatingBooking: boolean;
  patchingBooking: boolean;
  creatingAddress: boolean;

  lastCreatedBooking: BackendBooking | null;

  error: string | null;
}

export const initialState: BookingState = {
  customerBookings: [],
  expertBookings: [],
  addresses: [],

  loadingCustomerBookings: false,
  loadingExpertBookings: false,
  loadingAddresses: false,

  creatingBooking: false,
  patchingBooking: false,
  creatingAddress: false,

  lastCreatedBooking: null,

  error: null
};

export const bookingReducer = createReducer(
  initialState,

  on(BookingActions.loadCustomerBookings, (state) => ({
    ...state,
    loadingCustomerBookings: true,
    error: null
  })),
  on(BookingActions.loadCustomerBookingsSuccess, (state, { bookings }) => ({
    ...state,
    customerBookings: bookings,
    loadingCustomerBookings: false,
    error: null
  })),
  on(BookingActions.loadCustomerBookingsFailure, (state, { error }) => ({
    ...state,
    loadingCustomerBookings: false,
    error
  })),

  on(BookingActions.loadExpertBookings, (state) => ({
    ...state,
    loadingExpertBookings: true,
    error: null
  })),
  on(BookingActions.loadExpertBookingsSuccess, (state, { bookings }) => ({
    ...state,
    expertBookings: bookings,
    loadingExpertBookings: false,
    error: null
  })),
  on(BookingActions.loadExpertBookingsFailure, (state, { error }) => ({
    ...state,
    loadingExpertBookings: false,
    error
  })),

  on(BookingActions.createBooking, (state) => ({
    ...state,
    creatingBooking: true,
    lastCreatedBooking: null,
    error: null
  })),
  on(BookingActions.createBookingSuccess, (state, { booking }) => ({
    ...state,
    creatingBooking: false,
    lastCreatedBooking: booking,
    customerBookings: [booking, ...state.customerBookings],
    error: null
  })),
  on(BookingActions.createBookingFailure, (state, { error }) => ({
    ...state,
    creatingBooking: false,
    error
  })),

  on(BookingActions.patchBooking, (state) => ({
    ...state,
    patchingBooking: true,
    error: null
  })),
  on(BookingActions.patchBookingSuccess, (state, { booking }) => ({
    ...state,
    patchingBooking: false,
    customerBookings: state.customerBookings.map(b => (b.id === booking.id ? booking : b)),
    expertBookings: state.expertBookings.map(b => (b.id === booking.id ? booking : b)),
    error: null
  })),
  on(BookingActions.patchBookingFailure, (state, { error }) => ({
    ...state,
    patchingBooking: false,
    error
  })),

  on(BookingActions.loadCustomerAddresses, (state) => ({
    ...state,
    loadingAddresses: true,
    error: null
  })),
  on(BookingActions.loadCustomerAddressesSuccess, (state, { addresses }) => ({
    ...state,
    addresses,
    loadingAddresses: false,
    error: null
  })),
  on(BookingActions.loadCustomerAddressesFailure, (state, { error }) => ({
    ...state,
    loadingAddresses: false,
    error
  })),

  on(BookingActions.createAddress, (state) => ({
    ...state,
    creatingAddress: true,
    error: null
  })),
  on(BookingActions.createAddressSuccess, (state, { address }) => ({
    ...state,
    creatingAddress: false,
    addresses: [address, ...state.addresses],
    error: null
  })),
  on(BookingActions.createAddressFailure, (state, { error }) => ({
    ...state,
    creatingAddress: false,
    error
  })),

  on(BookingActions.clearBookingError, (state) => ({
    ...state,
    error: null
  }))
);
