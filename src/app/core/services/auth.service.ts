import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  LoginRequest,
  LoginResponse,
  RegisterCustomerRequest,
  RegisterExpertRequest,
  User,
  CustomerProfile,
  ExpertProfile
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.get<User[]>(`${this.apiUrl}/users?phone=${request.phone}`).pipe(
      switchMap(users => {
        const user = users.find(u => u.password === request.password && u.roles.includes(request.role));
        if (!user) {
          throw new Error('Invalid credentials');
        }

        // Fetch user profile based on role
        const profileEndpoint = request.role === 'ROLE_CUSTOMER' ? 'customerProfiles' : 'expertProfiles';
        return this.http.get<any[]>(`${this.apiUrl}/${profileEndpoint}?userId=${user.id}`).pipe(
          map(profiles => {
            const profile = profiles[0];
            const token = btoa(JSON.stringify({ id: user.id, role: request.role }));
            
            return {
              token,
              user,
              profile
            };
          })
        );
      })
    );
  }

  registerCustomer(request: RegisterCustomerRequest): Observable<LoginResponse> {
    const userId = this.generateId();
    const newUser: User = {
      id: userId,
      phone: request.phone,
      email: request.email,
      fullName: request.fullName,
      password: request.password,
      roles: ['ROLE_CUSTOMER'],
      blocked: false,
      createdAt: new Date().toISOString()
    };

    const newProfile: CustomerProfile = {
      id: userId,
      userId: userId,
      fullName: request.fullName,
      phone: request.phone,
      email: request.email,
      preferredZoneIds: request.preferredZoneIds || []
    };

    return forkJoin({
      user: this.http.post<User>(`${this.apiUrl}/users`, newUser),
      profile: this.http.post<CustomerProfile>(`${this.apiUrl}/customerProfiles`, newProfile)
    }).pipe(
      map(({ user, profile }) => {
        const token = btoa(JSON.stringify({ id: user.id, role: 'ROLE_CUSTOMER' }));
        return {
          token,
          user,
          profile
        };
      })
    );
  }

  registerExpert(request: RegisterExpertRequest): Observable<LoginResponse> {
    const userId = this.generateId();
    const newUser: User = {
      id: userId,
      phone: request.phone,
      email: request.email,
      fullName: request.fullName,
      password: request.password,
      roles: ['ROLE_EXPERT'],
      blocked: false,
      createdAt: new Date().toISOString()
    };

    const newProfile: ExpertProfile = {
      id: userId,
      userId: userId,
      fullName: request.fullName,
      phone: request.phone,
      skills: request.skills,
      zoneIds: request.zoneIds,
      status: 'PENDING',
      onlineStatus: 'OFFLINE',
      rating: 0,
      totalJobs: 0,
      createdAt: new Date().toISOString()
    };

    return forkJoin({
      user: this.http.post<User>(`${this.apiUrl}/users`, newUser),
      profile: this.http.post<ExpertProfile>(`${this.apiUrl}/expertProfiles`, newProfile)
    }).pipe(
      map(({ user, profile }) => {
        const token = btoa(JSON.stringify({ id: user.id, role: 'ROLE_EXPERT' }));
        return {
          token,
          user,
          profile
        };
      })
    );
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
