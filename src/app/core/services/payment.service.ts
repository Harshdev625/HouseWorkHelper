import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING';
export type BackendPaymentStatus = 'SUCCEEDED' | 'PENDING' | 'FAILED';

export interface BackendPayment {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency: 'INR' | string;
  status: BackendPaymentStatus;
  method: PaymentMethod;
  transactionId: string;
  receiptId: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getPaymentsByCustomer(customerId: string): Observable<BackendPayment[]> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<BackendPayment[]>(`${this.apiUrl}/payments`, { params });
  }

  createPayment(payload: Omit<BackendPayment, 'id' | 'createdAt' | 'updatedAt' | 'receiptId'> & { receiptId?: string | null }): Observable<BackendPayment> {
    const now = new Date().toISOString();
    const payment: Partial<BackendPayment> = {
      ...payload,
      createdAt: now,
      updatedAt: now,
      receiptId: payload.receiptId ?? null
    };
    return this.http.post<BackendPayment>(`${this.apiUrl}/payments`, payment);
  }
}
