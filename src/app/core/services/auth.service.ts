import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RegisterCustomerRequest,
  RegisterExpertRequest
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request);
  }

  registerCustomer(request: RegisterCustomerRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register/customer`, request);
  }

  registerExpert(request: RegisterExpertRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register/expert`, request);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {});
  }

  getCurrentUser(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${this.apiUrl}/auth/me`);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }
}
