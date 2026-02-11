import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ request }) =>
        this.authService.login(request).pipe(
          map((response) => {
            localStorage.setItem('token', response.token);
            return AuthActions.loginSuccess({ response });
          }),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message || 'Login failed' }))
          )
        )
      )
    )
  );

  registerCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerCustomer),
      exhaustMap(({ request }) =>
        this.authService.registerCustomer(request).pipe(
          map((response) => {
            localStorage.setItem('token', response.token);
            return AuthActions.registerCustomerSuccess({ response });
          }),
          catchError((error) =>
            of(AuthActions.registerCustomerFailure({ error: error.message || 'Registration failed' }))
          )
        )
      )
    )
  );

  registerExpert$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerExpert),
      exhaustMap(({ request }) =>
        this.authService.registerExpert(request).pipe(
          map((response) => {
            localStorage.setItem('token', response.token);
            return AuthActions.registerExpertSuccess({ response });
          }),
          catchError((error) =>
            of(AuthActions.registerExpertFailure({ error: error.message || 'Registration failed' }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerCustomerSuccess, AuthActions.registerExpertSuccess),
        tap(({ response }) => {
          const role = response.user.roles[0];
          if (role === 'ROLE_CUSTOMER') {
            this.router.navigate(['/customer/dashboard']);
          } else if (role === 'ROLE_EXPERT') {
            this.router.navigate(['/expert/dashboard']);
          }
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        exhaustMap(() =>
          this.authService.logout().pipe(
            tap(() => {
              localStorage.removeItem('token');
              // clear any cached session/user details
              localStorage.removeItem('user');
              localStorage.removeItem('profile');
              this.router.navigate(['/']);
            }),
            catchError(() => {
              // even if backend logout fails, client session must be cleared
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('profile');
              this.router.navigate(['/']);
              return of(null);
            })
          )
        )
      ),
    { dispatch: false }
  );
}
