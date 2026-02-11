import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Store } from '@ngrx/store';

import { selectUser } from '../../../store/auth/auth.selectors';
import { BookingService, BackendBooking, BackendAddress } from '../../../core/services/booking.service';
import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../core/models/service.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  user: User | null = null;

  loading = false;
  error: string | null = null;

  bookings: BackendBooking[] = [];
  services: Service[] = [];
  addresses: BackendAddress[] = [];

  constructor(
    private router: Router,
    private store: Store,
    private bookingService: BookingService,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser).subscribe(user => {
      this.user = user;
      if (user && !this.loading) {
        this.load(user.id);
      }
    });
  }

  private load(customerId: string): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      bookings: this.bookingService.getCustomerBookings(customerId),
      services: this.serviceService.getServices(),
      addresses: this.bookingService.getCustomerAddresses(customerId)
    }).subscribe({
      next: ({ bookings, services, addresses }) => {
        this.bookings = [...bookings].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        this.services = services;
        this.addresses = addresses;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load bookings.';
        this.loading = false;
      }
    });
  }

  getServiceName(serviceId: string): string {
    return this.services.find(s => s.id === serviceId)?.name || 'Service';
  }

  getAddressLabel(addressId: string): string {
    const a = this.addresses.find(x => x.id === addressId);
    if (!a) return '';
    return `${a.line1}, ${a.city} - ${a.postalCode}`;
  }

  openDetails(id: string): void {
    this.router.navigate(['/customer/bookings', id]);
  }

  back(): void {
    this.router.navigate(['/customer/dashboard']);
  }
}
