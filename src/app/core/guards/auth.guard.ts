import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAuthenticated, selectUser } from '../../store/auth/auth.selectors';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
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

  return store.select(selectUser).pipe(
    take(1),
    map(user => {
      const isCustomer = user?.roles?.[0] === 'ROLE_CUSTOMER';
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

  return store.select(selectUser).pipe(
    take(1),
    map(user => {
      const isExpert = user?.roles?.[0] === 'ROLE_EXPERT';
      if (!isExpert) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
