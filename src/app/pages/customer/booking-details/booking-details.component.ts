import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Store } from '@ngrx/store';

import { selectUser } from '../../../store/auth/auth.selectors';
import { BookingService, BackendBooking, BackendAddress } from '../../../core/services/booking.service';
import { ServiceService } from '../../../core/services/service.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Service } from '../../../core/models/service.model';
import { User } from '../../../core/models/user.model';
import { OtpService } from '../../../core/services/otp.service';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details-updated.component.css']
})
export class BookingDetailsComponent implements OnInit {
  user: User | null = null;
  bookingId = '';

  loading = false;
  error: string | null = null;

  booking: BackendBooking | null = null;
  service: Service | null = null;
  address: BackendAddress | null = null;

  amountPaid = 0;
  showOTP = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private bookingService: BookingService,
    private serviceService: ServiceService,
    private paymentService: PaymentService,
    private otpService: OtpService
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id') || '';

    this.store.select(selectUser).subscribe(user => {
      this.user = user;
      if (user && this.bookingId && !this.loading) {
        this.load(user.id, this.bookingId);
      }
    });
  }

  private load(customerId: string, bookingId: string): void {
    this.loading = true;
    this.error = null;

    this.bookingService.getBookingById(bookingId).subscribe({
      next: (booking) => {
        forkJoin({
          service: this.serviceService.getServiceById(booking.serviceId),
          addresses: this.bookingService.getCustomerAddresses(customerId),
          payments: this.paymentService.getPaymentsByCustomer(customerId)
        }).subscribe({
          next: ({ service, addresses, payments }) => {
            this.booking = booking;
            this.service = service;
            this.address = addresses.find(a => a.id === booking.addressId) || null;
            this.amountPaid = payments
              .filter(p => p.bookingId === booking.id && p.status === 'SUCCEEDED')
              .reduce((sum, p) => sum + (p.amount || 0), 0);
            this.loading = false;
          },
          error: () => {
            this.error = 'Failed to load booking details.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Booking not found.';
        this.loading = false;
      }
    });
  }

  get amountDue(): number {
    if (!this.booking) return 0;
    return Math.max(0, (this.booking.quotedAmount || 0) - this.amountPaid);
  }

  back(): void {
    this.router.navigate(['/customer/bookings']);
  }

  modifyBooking(): void {
    this.router.navigate(['/customer/bookings', this.bookingId, 'modify']);
  }

  provideFeedback(): void {
    this.router.navigate(['/customer/feedback']);
  }

  toggleOTP(): void {
    this.showOTP = !this.showOTP;
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'IN_PROGRESS': 'status-inprogress',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled',
      'CANCELLED_BY_CUSTOMER': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  }

  getStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled',
      'CANCELLED_BY_CUSTOMER': 'Cancelled'
    };
    return labelMap[status] || status;
  }
}
