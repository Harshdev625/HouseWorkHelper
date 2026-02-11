import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';

export interface ExpertAvailability {
  id: string;
  expertProfileId: string;
  date: string; // YYYY-MM-DD
  timeSlots: string[]; // e.g. "09:00 AM"
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpertAvailabilityService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getByDate(date: string): Observable<ExpertAvailability[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ExpertAvailability[]>(`${this.apiUrl}/expertAvailability`, { params });
  }

  getByExpertAndDate(expertProfileId: string, date: string): Observable<ExpertAvailability | null> {
    const params = new HttpParams().set('expertProfileId', expertProfileId).set('date', date);
    return this.http
      .get<ExpertAvailability[]>(`${this.apiUrl}/expertAvailability`, { params })
      .pipe(map((list) => list[0] || null));
  }

  upsert(expertProfileId: string, date: string, timeSlots: string[]): Observable<ExpertAvailability> {
    const now = new Date().toISOString();

    return this.getByExpertAndDate(expertProfileId, date).pipe(
      switchMap((existing) => {
        if (existing) {
          return this.http.patch<ExpertAvailability>(`${this.apiUrl}/expertAvailability/${existing.id}`, {
            timeSlots: [...timeSlots],
            updatedAt: now
          });
        }

        return this.http.post<ExpertAvailability>(`${this.apiUrl}/expertAvailability`, {
          expertProfileId,
          date,
          timeSlots: [...timeSlots],
          updatedAt: now
        });
      })
    );
  }
}
