import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, exhaustMap } from 'rxjs/operators';
import { ServiceService } from '../../core/services/service.service';
import * as ServiceActions from './service.actions';

@Injectable()
export class ServiceEffects {
  private actions$ = inject(Actions);
  private serviceService = inject(ServiceService);

  loadServices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ServiceActions.loadServices),
      exhaustMap(() =>
        this.serviceService.getServices().pipe(
          map((services) => ServiceActions.loadServicesSuccess({ services })),
          catchError((error) =>
            of(ServiceActions.loadServicesFailure({ error: error.message || 'Failed to load services' }))
          )
        )
      )
    )
  );
}
