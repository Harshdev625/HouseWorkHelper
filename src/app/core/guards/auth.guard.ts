import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { selectIsAuthenticated, selectIsCustomer } from '../../store/auth/auth.selectors';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};

export const customerGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsCustomer).pipe(
    map(isCustomer => {
      if (!isCustomer) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};

export const expertGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
