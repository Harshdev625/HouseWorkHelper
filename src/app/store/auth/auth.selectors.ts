import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectUserType = createSelector(
  selectCurrentUser,
  (user) => user?.roles?.[0] || null
);

export const selectUserRole = createSelector(
  selectUser,
  (user) => user?.roles?.[0]
);

export const selectIsCustomer = createSelector(
  selectUserRole,
  (role) => role === 'ROLE_CUSTOMER'
);

export const selectIsExpert = createSelector(
  selectUserRole,
  (role) => role === 'ROLE_EXPERT'
);
