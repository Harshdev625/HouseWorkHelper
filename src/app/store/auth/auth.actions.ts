import { createAction, props } from '@ngrx/store';
import { User, LoginRequest, LoginResponse, RegisterCustomerRequest, RegisterExpertRequest } from '../../core/models';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ request: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: LoginResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Register Customer Actions
export const registerCustomer = createAction(
  '[Auth] Register Customer',
  props<{ request: RegisterCustomerRequest }>()
);

export const registerCustomerSuccess = createAction(
  '[Auth] Register Customer Success',
  props<{ response: LoginResponse }>()
);

export const registerCustomerFailure = createAction(
  '[Auth] Register Customer Failure',
  props<{ error: string }>()
);

// Register Expert Actions
export const registerExpert = createAction(
  '[Auth] Register Expert',
  props<{ request: RegisterExpertRequest }>()
);

export const registerExpertSuccess = createAction(
  '[Auth] Register Expert Success',
  props<{ response: LoginResponse }>()
);

export const registerExpertFailure = createAction(
  '[Auth] Register Expert Failure',
  props<{ error: string }>()
);

// Logout Action
export const logout = createAction('[Auth] Logout');

// Clear Error Action
export const clearError = createAction('[Auth] Clear Error');
