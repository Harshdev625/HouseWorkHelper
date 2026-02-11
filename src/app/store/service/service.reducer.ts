import { createReducer, on } from '@ngrx/store';
import { Service } from '../../core/models';
import * as ServiceActions from './service.actions';

export interface ServiceState {
  services: Service[];
  selectedServiceId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialState: ServiceState = {
  services: [],
  selectedServiceId: null,
  loading: false,
  error: null
};

export const serviceReducer = createReducer(
  initialState,

  on(ServiceActions.loadServices, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ServiceActions.loadServicesSuccess, (state, { services }) => ({
    ...state,
    services,
    loading: false,
    error: null
  })),

  on(ServiceActions.loadServicesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(ServiceActions.selectService, (state, { serviceId }) => ({
    ...state,
    selectedServiceId: serviceId
  })),

  on(ServiceActions.clearSelectedService, (state) => ({
    ...state,
    selectedServiceId: null
  }))
);
