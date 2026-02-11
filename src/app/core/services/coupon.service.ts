import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type CouponDiscountType = 'FIXED' | 'PERCENTAGE';

export interface BackendCoupon {
  id: string;
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  currency: 'INR' | string;
  minOrderValue: number;
  maxDiscount: number | null;
  validFrom: string;
  validUntil: string;
  usageLimit: number | null;
  isActive: boolean;
  applicableZones: string[];
  applicableServices: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getActiveCoupons(): Observable<BackendCoupon[]> {
    const params = new HttpParams().set('isActive', 'true');
    return this.http.get<BackendCoupon[]>(`${this.apiUrl}/coupons`, { params });
  }
}
