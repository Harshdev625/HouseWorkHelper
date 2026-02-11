import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface OTPVerificationRequest {
  bookingId: string;
  otp: string;
  action: 'START' | 'END';
}

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  booking?: any;
}

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * Verify OTP for starting or ending a job
   */
  verifyOTP(request: OTPVerificationRequest): Observable<OTPVerificationResponse> {
    // First, get the booking to verify OTP
    return this.http.get<any>(`${this.apiUrl}/bookings/${request.bookingId}`).pipe(
      map(booking => {
        if (!booking) {
          return {
            success: false,
            message: 'Booking not found'
          };
        }

        if (booking.otp !== request.otp) {
          return {
            success: false,
            message: 'Invalid OTP. Please try again.'
          };
        }

        // OTP is valid
        return {
          success: true,
          message: 'OTP verified successfully',
          booking
        };
      }),
      catchError(() => of({
        success: false,
        message: 'Failed to verify OTP'
      }))
    );
  }

  /**
   * Start a job with OTP verification
   */
  startJob(bookingId: string, otp: string): Observable<any> {
    return this.verifyOTP({ bookingId, otp, action: 'START' }).pipe(
      map(response => {
        if (response.success && response.booking) {
          // Update booking status to IN_PROGRESS and set actualStartTime
          const now = new Date().toISOString();
          return this.http.patch(`${this.apiUrl}/bookings/${bookingId}`, {
            status: 'IN_PROGRESS',
            actualStartTime: now,
            updatedAt: now
          });
        }
        throw new Error(response.message);
      })
    );
  }

  /**
   * End a job with OTP verification
   */
  endJob(bookingId: string, otp: string): Observable<any> {
    return this.verifyOTP({ bookingId, otp, action: 'END' }).pipe(
      map(response => {
        if (response.success && response.booking) {
          // Update booking status to COMPLETED and set actualEndTime
          const now = new Date().toISOString();
          return this.http.patch(`${this.apiUrl}/bookings/${bookingId}`, {
            status: 'COMPLETED',
            actualEndTime: now,
            updatedAt: now
          });
        }
        throw new Error(response.message);
      })
    );
  }

  /**
   * Get OTP for a booking (for testing/demo purposes)
   * In production, this would be sent via SMS/email
   */
  getBookingOTP(bookingId: string): Observable<string> {
    return this.http.get<any>(`${this.apiUrl}/bookings/${bookingId}`).pipe(
      map(booking => booking.otp || ''),
      catchError(() => of(''))
    );
  }

  /**
   * Regenerate OTP for a booking
   */
  regenerateOTP(bookingId: string): Observable<string> {
    const newOTP = Math.floor(1000 + Math.random() * 9000).toString();
    return this.http.patch<any>(`${this.apiUrl}/bookings/${bookingId}`, {
      otp: newOTP,
      updatedAt: new Date().toISOString()
    }).pipe(
      map(() => newOTP),
      catchError(() => of(''))
    );
  }
}
