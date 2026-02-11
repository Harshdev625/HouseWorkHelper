import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { ExpertService } from '../../core/services/expert.service';
import * as ExpertActions from './expert.actions';

@Injectable()
export class ExpertEffects {
  private actions$ = inject(Actions);
  private expertService = inject(ExpertService);

  loadExpertProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExpertActions.loadExpertProfile),
      exhaustMap(({ userId }) =>
        this.expertService.getExpertProfileByUserId(userId).pipe(
          map((profiles) => ExpertActions.loadExpertProfileSuccess({ profile: profiles[0] || null })),
          catchError((error) =>
            of(ExpertActions.loadExpertProfileFailure({ error: error.message || 'Failed to load expert profile' }))
          )
        )
      )
    )
  );

  updateOnlineStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExpertActions.updateOnlineStatus),
      exhaustMap(({ expertProfileId, onlineStatus }) =>
        this.expertService.patchExpertProfile(expertProfileId, { onlineStatus }).pipe(
          map((profile) => ExpertActions.updateOnlineStatusSuccess({ profile })),
          catchError((error) =>
            of(ExpertActions.updateOnlineStatusFailure({ error: error.message || 'Failed to update status' }))
          )
        )
      )
    )
  );
}
