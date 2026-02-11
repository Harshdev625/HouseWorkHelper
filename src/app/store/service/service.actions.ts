import { createAction, props } from '@ngrx/store';
import { Service } from '../../core/models';

export const loadServices = createAction('[Service] Load Services');

export const loadServicesSuccess = createAction(
  '[Service] Load Services Success',
  props<{ services: Service[] }>()
);

export const loadServicesFailure = createAction(
  '[Service] Load Services Failure',
  props<{ error: string }>()
);

export const selectService = createAction(
  '[Service] Select Service',
  props<{ serviceId: string }>()
);

export const clearSelectedService = createAction('[Service] Clear Selected Service');
