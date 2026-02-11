import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Service, Category, Zone } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getZones(): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.apiUrl}/zones`);
  }

  getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/services/${id}`);
  }

  getServicesWithCategories(): Observable<any[]> {
    return forkJoin({
      services: this.getServices(),
      categories: this.getCategories()
    }).pipe(
      map(({ services, categories }) => {
        return services.map(service => ({
          ...service,
          category: categories.find(cat => cat.id === service.categoryId)
        }));
      })
    );
  }
}
