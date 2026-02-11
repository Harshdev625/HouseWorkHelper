import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    token: response.token,
    isAuthenticated: true,
    loading: false,
    error: null
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Register Customer
  on(AuthActions.registerCustomer, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.registerCustomerSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    token: response.token,
    isAuthenticated: true,
    loading: false,
    error: null
  })),

  on(AuthActions.registerCustomerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Register Expert
  on(AuthActions.registerExpert, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.registerExpertSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    token: response.token,
    isAuthenticated: true,
    loading: false,
    error: null
  })),

  on(AuthActions.registerExpertFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Logout
  on(AuthActions.logout, () => initialState),

  // Clear Error
  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null
  }))
);
