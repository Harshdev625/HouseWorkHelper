import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpertProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ExpertService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getExperts(params?: {
    zoneId?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    onlineStatus?: 'ONLINE' | 'OFFLINE';
  }): Observable<ExpertProfile[]> {
    let httpParams = new HttpParams();
    if (params?.zoneId) httpParams = httpParams.set('zoneIds_like', params.zoneId);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.onlineStatus) httpParams = httpParams.set('onlineStatus', params.onlineStatus);

    return this.http.get<ExpertProfile[]>(`${this.apiUrl}/expertProfiles`, {
      params: httpParams
    });
  }

  getExpertProfileByUserId(userId: string): Observable<ExpertProfile[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<ExpertProfile[]>(`${this.apiUrl}/expertProfiles`, { params });
  }

  patchExpertProfile(expertProfileId: string, patch: Partial<ExpertProfile>): Observable<ExpertProfile> {
    return this.http.patch<ExpertProfile>(`${this.apiUrl}/expertProfiles/${expertProfileId}`, patch);
  }
}
