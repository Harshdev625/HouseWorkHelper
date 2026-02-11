import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { BookingService } from '../../core/services/booking.service';
import * as BookingActions from './booking.actions';

@Injectable()
export class BookingEffects {
  private actions$ = inject(Actions);
  private bookingService = inject(BookingService);

  loadCustomerBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadCustomerBookings),
      exhaustMap(({ customerId }) =>
        this.bookingService.getCustomerBookings(customerId).pipe(
          map((bookings) => BookingActions.loadCustomerBookingsSuccess({ bookings })),
          catchError((error) =>
            of(BookingActions.loadCustomerBookingsFailure({ error: error.message || 'Failed to load bookings' }))
          )
        )
      )
    )
  );

  loadExpertBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadExpertBookings),
      exhaustMap(({ expertProfileId }) =>
        this.bookingService.getBookingsByExpert(expertProfileId).pipe(
          map((bookings) => BookingActions.loadExpertBookingsSuccess({ bookings })),
          catchError((error) =>
            of(BookingActions.loadExpertBookingsFailure({ error: error.message || 'Failed to load expert bookings' }))
          )
        )
      )
    )
  );

  createBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.createBooking),
      exhaustMap(({ payload }) =>
        this.bookingService.createBooking(payload).pipe(
          map((booking) => BookingActions.createBookingSuccess({ booking })),
          catchError((error) =>
            of(BookingActions.createBookingFailure({ error: error.message || 'Failed to create booking' }))
          )
        )
      )
    )
  );

  patchBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.patchBooking),
      exhaustMap(({ bookingId, patch }) =>
        this.bookingService.patchBooking(bookingId, patch).pipe(
          map((booking) => BookingActions.patchBookingSuccess({ booking })),
          catchError((error) =>
            of(BookingActions.patchBookingFailure({ error: error.message || 'Failed to update booking' }))
          )
        )
      )
    )
  );

  loadAddresses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadCustomerAddresses),
      exhaustMap(({ customerId }) =>
        this.bookingService.getCustomerAddresses(customerId).pipe(
          map((addresses) => BookingActions.loadCustomerAddressesSuccess({ addresses })),
          catchError((error) =>
            of(BookingActions.loadCustomerAddressesFailure({ error: error.message || 'Failed to load addresses' }))
          )
        )
      )
    )
  );

  createAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.createAddress),
      exhaustMap(({ payload }) =>
        this.bookingService.createAddress(payload).pipe(
          map((address) => BookingActions.createAddressSuccess({ address })),
          catchError((error) =>
            of(BookingActions.createAddressFailure({ error: error.message || 'Failed to create address' }))
          )
        )
      )
    )
  );
}
