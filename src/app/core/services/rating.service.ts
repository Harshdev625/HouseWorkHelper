import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rating {
  id: string;
  bookingId: string;
  customerId: string;
  expertId: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

export interface CreateRatingRequest {
  bookingId: string;
  customerId: string;
  expertId: string;
  rating: number;
  feedback: string;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getRatingsByCustomer(customerId: string): Observable<Rating[]> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<Rating[]>(`${this.apiUrl}/ratings`, { params });
  }

  getRatingsByExpert(expertId: string): Observable<Rating[]> {
    const params = new HttpParams().set('expertId', expertId);
    return this.http.get<Rating[]>(`${this.apiUrl}/ratings`, { params });
  }

  getRatingByBooking(bookingId: string): Observable<Rating[]> {
    const params = new HttpParams().set('bookingId', bookingId);
    return this.http.get<Rating[]>(`${this.apiUrl}/ratings`, { params });
  }

  createRating(payload: CreateRatingRequest): Observable<Rating> {
    const now = new Date().toISOString();
    const rating: Partial<Rating> = {
      ...payload,
      createdAt: now
    };
    return this.http.post<Rating>(`${this.apiUrl}/ratings`, rating);
  }
}
