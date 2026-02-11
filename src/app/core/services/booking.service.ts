import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type BackendBookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'PENDING_PAYMENT'
  | 'CANCELLED_BY_CUSTOMER';

export type BackendBookingType = 'ASAP' | 'SCHEDULED';

export interface BackendBooking {
  id: string;
  customerId: string;
  expertId: string | null;
  zoneId: string;
  serviceId: string;
  addressId: string;
  status: BackendBookingStatus;
  bookingType: BackendBookingType;
  durationMinutes: number;
  addonIds: string[];
  quotedAmount: number;
  currency: 'INR' | string;
  etaMinutes: number | null;
  scheduledStartTime: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  notes: string;
  otp: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendAddress {
  id: string;
  customerId: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getCustomerBookings(customerId: string): Observable<BackendBooking[]> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<BackendBooking[]>(`${this.apiUrl}/bookings`, { params });
  }

  getBookingById(bookingId: string): Observable<BackendBooking> {
    return this.http.get<BackendBooking>(`${this.apiUrl}/bookings/${bookingId}`);
  }

  createBooking(payload: Omit<BackendBooking, 'id' | 'createdAt' | 'updatedAt' | 'otp'> & { otp?: string }): Observable<BackendBooking> {
    const now = new Date().toISOString();
    const booking: Partial<BackendBooking> = {
      ...payload,
      otp: payload.otp || Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: now,
      updatedAt: now
    };
    return this.http.post<BackendBooking>(`${this.apiUrl}/bookings`, booking);
  }

  patchBooking(bookingId: string, patch: Partial<BackendBooking>): Observable<BackendBooking> {
    const now = new Date().toISOString();
    return this.http.patch<BackendBooking>(`${this.apiUrl}/bookings/${bookingId}`, {
      ...patch,
      updatedAt: now
    });
  }

  getCustomerAddresses(customerId: string): Observable<BackendAddress[]> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<BackendAddress[]>(`${this.apiUrl}/addresses`, { params });
  }

  createAddress(payload: Omit<BackendAddress, 'id'>): Observable<BackendAddress> {
    return this.http.post<BackendAddress>(`${this.apiUrl}/addresses`, payload);
  }

  patchAddress(addressId: string, patch: Partial<BackendAddress>): Observable<BackendAddress> {
    return this.http.patch<BackendAddress>(`${this.apiUrl}/addresses/${addressId}`, patch);
  }
}
