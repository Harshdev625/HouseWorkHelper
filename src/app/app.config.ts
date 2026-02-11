import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authReducer } from './store/auth/auth.reducer';
import { serviceReducer } from './store/service/service.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { ServiceEffects } from './store/service/service.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideStore({
      auth: authReducer,
      service: serviceReducer
    }),
    provideEffects([AuthEffects, ServiceEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false
    })
  ]
};
