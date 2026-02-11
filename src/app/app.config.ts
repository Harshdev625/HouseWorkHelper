import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authReducer } from './store/auth/auth.reducer';
import { serviceReducer } from './store/service/service.reducer';
import { bookingReducer } from './store/booking/booking.reducer';
import { expertReducer } from './store/expert/expert.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { ServiceEffects } from './store/service/service.effects';
import { BookingEffects } from './store/booking/booking.effects';
import { ExpertEffects } from './store/expert/expert.effects';
import { AuthService } from './core/services/auth.service';
import * as AuthActions from './store/auth/auth.actions';

function initializeApp(authService: AuthService, store: Store) {
  return () => {
    const token = authService.getToken();
    if (token) {
      return firstValueFrom(
        authService.getCurrentUser()
      ).then(
        (response) => {
          store.dispatch(AuthActions.loginSuccess({ response }));
        },
        () => {
          authService.removeToken();
          store.dispatch(AuthActions.logout());
        }
      );
    }
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideStore({
      auth: authReducer,
      service: serviceReducer,
      booking: bookingReducer,
      expert: expertReducer
    }),
    provideEffects([AuthEffects, ServiceEffects, BookingEffects, ExpertEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService, Store],
      multi: true
    }
  ]
};
