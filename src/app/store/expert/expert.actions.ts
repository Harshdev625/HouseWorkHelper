import { createAction, props } from '@ngrx/store';
import { ExpertProfile } from '../../core/models/user.model';

export const loadExpertProfile = createAction(
  '[Expert] Load Expert Profile',
  props<{ userId: string }>()
);

export const loadExpertProfileSuccess = createAction(
  '[Expert] Load Expert Profile Success',
  props<{ profile: ExpertProfile | null }>()
);

export const loadExpertProfileFailure = createAction(
  '[Expert] Load Expert Profile Failure',
  props<{ error: string }>()
);

export const updateOnlineStatus = createAction(
  '[Expert] Update Online Status',
  props<{ expertProfileId: string; onlineStatus: 'ONLINE' | 'OFFLINE' }>()
);

export const updateOnlineStatusSuccess = createAction(
  '[Expert] Update Online Status Success',
  props<{ profile: ExpertProfile }>()
);

export const updateOnlineStatusFailure = createAction(
  '[Expert] Update Online Status Failure',
  props<{ error: string }>()
);

export const clearExpertError = createAction('[Expert] Clear Error');
