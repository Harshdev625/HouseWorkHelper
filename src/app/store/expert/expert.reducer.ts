import { createReducer, on } from '@ngrx/store';
import { ExpertProfile } from '../../core/models/user.model';
import * as ExpertActions from './expert.actions';

export interface ExpertState {
  profile: ExpertProfile | null;
  loading: boolean;
  updatingStatus: boolean;
  error: string | null;
}

export const initialState: ExpertState = {
  profile: null,
  loading: false,
  updatingStatus: false,
  error: null
};

export const expertReducer = createReducer(
  initialState,
  on(ExpertActions.loadExpertProfile, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ExpertActions.loadExpertProfileSuccess, (state, { profile }) => ({
    ...state,
    profile,
    loading: false,
    error: null
  })),
  on(ExpertActions.loadExpertProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(ExpertActions.updateOnlineStatus, (state) => ({
    ...state,
    updatingStatus: true,
    error: null
  })),
  on(ExpertActions.updateOnlineStatusSuccess, (state, { profile }) => ({
    ...state,
    profile,
    updatingStatus: false,
    error: null
  })),
  on(ExpertActions.updateOnlineStatusFailure, (state, { error }) => ({
    ...state,
    updatingStatus: false,
    error
  })),

  on(ExpertActions.clearExpertError, (state) => ({
    ...state,
    error: null
  }))
);
