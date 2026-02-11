import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');
    
    if (token) {
      const user = JSON.parse(atob(token));
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'x-roles': user.role
        }
      });
    }
    
    return next.handle(request);
  }
}
