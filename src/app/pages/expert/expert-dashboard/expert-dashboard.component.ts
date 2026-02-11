import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { User, ExpertProfile, Service } from '../../../core/models';
import { selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';
import { loadExpertProfile, updateOnlineStatus } from '../../../store/expert/expert.actions';
import { selectExpertProfile } from '../../../store/expert/expert.selectors';
import { loadExpertBookings, patchBooking } from '../../../store/booking/booking.actions';
import { selectBookingLoading, selectExpertBookings } from '../../../store/booking/booking.selectors';
import { loadServices } from '../../../store/service/service.actions';
import { selectAllServices } from '../../../store/service/service.selectors';
import { BackendBooking } from '../../../core/services/booking.service';
import { ExpertAvailabilityService } from '../../../core/services/expert-availability.service';

@Component({
  selector: 'app-expert-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expert-dashboard.component.html',
  styleUrls: ['./expert-dashboard.component.css']
})
export class ExpertDashboardComponent implements OnInit {
  user$: Observable<User | null>;
  expertProfile$: Observable<ExpertProfile | null>;
  isOnline$: Observable<boolean>;

  services$: Observable<Service[]>;
  bookings$: Observable<BackendBooking[]>;

  appointments$: Observable<BackendBooking[]>;
  pendingRequests$: Observable<BackendBooking[]>;

  stats$: Observable<{ todayJobs: number; thisWeekJobs: number; totalEarnings: number; rating: number }>;

  // Take Action modal
  showActionModal = false;
  selectedRequest: BackendBooking | null = null;
  actionBusy = false;

  // Availability
  availabilityDateOptions: string[] = [];
  selectedAvailabilityDate: string | null = null;
  timeSlots: string[] = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
  selectedTimeSlots = new Set<string>();
  availabilitySaving = false;
  availabilityError: string | null = null;
  availabilitySaved = false;

  constructor(private store: Store, private availabilityService: ExpertAvailabilityService) {
    this.user$ = this.store.select(selectUser);
    this.expertProfile$ = this.store.select(selectExpertProfile);
    this.bookings$ = this.store.select(selectExpertBookings);
    this.services$ = this.store.select(selectAllServices);

    this.isOnline$ = this.expertProfile$.pipe(map(p => (p?.onlineStatus || 'OFFLINE') === 'ONLINE'));

    this.pendingRequests$ = this.bookings$.pipe(
      map(list => list.filter(b => b.status === 'PENDING'))
    );

    this.appointments$ = this.bookings$.pipe(
      map(list => list.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS' || b.status === 'COMPLETED' || b.status === 'CANCELLED_BY_CUSTOMER'))
    );

    this.store
      .select(selectBookingLoading)
      .pipe(map(l => l.patchingBooking), takeUntilDestroyed())
      .subscribe(isPatching => {
        this.actionBusy = isPatching;
      });

    this.stats$ = combineLatest([this.expertProfile$, this.bookings$]).pipe(
      map(([profile, bookings]) => {
        const now = new Date();

        const isSameDay = (a: Date, b: Date) =>
          a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const getBookingDate = (bk: BackendBooking) => new Date(bk.scheduledStartTime || bk.createdAt);

        const todayJobs = bookings.filter(bk => isSameDay(getBookingDate(bk), now)).length;
        const thisWeekJobs = bookings.filter(bk => getBookingDate(bk) >= startOfWeek).length;

        const totalEarnings = bookings
          .filter(bk => bk.status === 'COMPLETED' || bk.status === 'CONFIRMED' || bk.status === 'IN_PROGRESS')
          .reduce((sum, bk) => sum + (bk.quotedAmount || 0), 0);

        const rating = profile?.rating || 0;

        return { todayJobs, thisWeekJobs, totalEarnings, rating };
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(loadServices());

    this.availabilityDateOptions = this.buildNext4Days();
    this.selectedAvailabilityDate = this.availabilityDateOptions[0] || null;

    this.user$
      .pipe(
        filter((u): u is User => !!u),
        take(1)
      )
      .subscribe(user => {
        this.store.dispatch(loadExpertProfile({ userId: user.id }));
      });

    this.expertProfile$
      .pipe(
        filter((p): p is ExpertProfile => !!p),
        take(1)
      )
      .subscribe(profile => {
        this.store.dispatch(loadExpertBookings({ expertProfileId: profile.id }));

        if (this.selectedAvailabilityDate) {
          this.loadAvailability(profile.id, this.selectedAvailabilityDate);
        }
      });
  }

  onAvailabilityDateChange(date: string | null): void {
    this.selectedAvailabilityDate = date;
    this.availabilitySaved = false;
    this.availabilityError = null;
    if (!date) return;

    this.expertProfile$
      .pipe(
        filter((p): p is ExpertProfile => !!p),
        take(1)
      )
      .subscribe((profile) => this.loadAvailability(profile.id, date));
  }

  toggleTimeSlot(slot: string): void {
    this.availabilitySaved = false;
    if (this.selectedTimeSlots.has(slot)) {
      this.selectedTimeSlots.delete(slot);
    } else {
      this.selectedTimeSlots.add(slot);
    }
  }

  saveAvailability(): void {
    if (this.availabilitySaving) return;
    if (!this.selectedAvailabilityDate) return;

    this.availabilitySaving = true;
    this.availabilityError = null;
    this.availabilitySaved = false;

    this.expertProfile$
      .pipe(
        filter((p): p is ExpertProfile => !!p),
        take(1)
      )
      .subscribe({
        next: (profile) => {
          this.availabilityService
            .upsert(profile.id, this.selectedAvailabilityDate!, Array.from(this.selectedTimeSlots))
            .subscribe({
              next: () => {
                this.availabilitySaving = false;
                this.availabilitySaved = true;
              },
              error: () => {
                this.availabilitySaving = false;
                this.availabilityError = 'Failed to save availability.';
              }
            });
        },
        error: () => {
          this.availabilitySaving = false;
          this.availabilityError = 'Failed to resolve expert profile.';
        }
      });
  }

  private loadAvailability(expertProfileId: string, date: string): void {
    this.availabilitySaved = false;
    this.availabilityError = null;
    this.selectedTimeSlots.clear();

    this.availabilityService.getByExpertAndDate(expertProfileId, date).subscribe({
      next: (record) => {
        this.selectedTimeSlots.clear();
        for (const s of record?.timeSlots || []) {
          this.selectedTimeSlots.add(s);
        }
      },
      error: () => {
        this.availabilityError = 'Failed to load availability.';
      }
    });
  }

  private buildNext4Days(): string[] {
    const list: string[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 4; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      list.push(d.toISOString().slice(0, 10));
    }
    return list;
  }

  toggleOnlineStatus(): void {
    this.expertProfile$
      .pipe(
        filter((p): p is ExpertProfile => !!p),
        take(1)
      )
      .subscribe(profile => {
        const next = profile.onlineStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
        this.store.dispatch(updateOnlineStatus({ expertProfileId: profile.id, onlineStatus: next }));
      });
  }

  openTakeAction(request: BackendBooking): void {
    this.selectedRequest = request;
    this.showActionModal = true;
    this.actionBusy = false;
  }

  closeTakeAction(): void {
    if (this.actionBusy) return;
    this.showActionModal = false;
    this.selectedRequest = null;
  }

  acceptSelected(): void {
    if (!this.selectedRequest || this.actionBusy) return;
    this.actionBusy = true;
    this.store.dispatch(patchBooking({ bookingId: this.selectedRequest.id, patch: { status: 'CONFIRMED' } as any }));
    this.closeTakeAction();
  }

  rejectSelected(): void {
    if (!this.selectedRequest || this.actionBusy) return;
    this.actionBusy = true;
    this.store.dispatch(patchBooking({ bookingId: this.selectedRequest.id, patch: { status: 'REJECTED' } as any }));
    this.closeTakeAction();
  }

  getServiceName(serviceId: string, services: Service[]): string {
    return services.find(s => s.id === serviceId)?.name || 'Service';
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.store.dispatch(logout());
    }
  }
}
