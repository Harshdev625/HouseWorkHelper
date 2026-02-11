import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ServiceState } from './service.reducer';

export const selectServiceState = createFeatureSelector<ServiceState>('service');

export const selectAllServices = createSelector(
  selectServiceState,
  (state) => state.services
);

export const selectServiceLoading = createSelector(
  selectServiceState,
  (state) => state.loading
);

export const selectServiceError = createSelector(
  selectServiceState,
  (state) => state.error
);

export const selectSelectedServiceId = createSelector(
  selectServiceState,
  (state) => state.selectedServiceId
);

export const selectSelectedService = createSelector(
  selectAllServices,
  selectSelectedServiceId,
  (services, selectedId) => services.find(s => s.id === selectedId) || null
);
