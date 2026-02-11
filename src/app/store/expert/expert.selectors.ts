import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExpertState } from './expert.reducer';

export const selectExpertState = createFeatureSelector<ExpertState>('expert');

export const selectExpertProfile = createSelector(
  selectExpertState,
  (state) => state.profile
);

export const selectExpertLoading = createSelector(
  selectExpertState,
  (state) => ({
    loading: state.loading,
    updatingStatus: state.updatingStatus
  })
);

export const selectExpertError = createSelector(
  selectExpertState,
  (state) => state.error
);
