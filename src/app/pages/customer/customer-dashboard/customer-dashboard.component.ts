import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, forkJoin } from 'rxjs';
import { User } from '../../../core/models';
import { selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';
import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../core/models/service.model';
import { BookingService, BackendBooking, BackendAddress } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  user$: Observable<User | null>;

  popularServices = [
    { id: 'cleaning-1', name: 'Cleaning', iconUrl: 'assets/images/icons/clean.jpg' },
    { id: 'cooking-1', name: 'Cooking', iconUrl: 'assets/images/icons/cook.jpg' },
    { id: 'gardening-1', name: 'Gardening', iconUrl: 'assets/images/icons/garden.jpg' },
    { id: 'cleaning-2', name: 'Cleaning', iconUrl: 'assets/images/icons/clean.jpg' },
    { id: 'cooking-2', name: 'Cooking', iconUrl: 'assets/images/icons/cook.jpg' }
  ];

  featuredServices: Array<{
    id: string;
    name: string;
    description: string;
    hourlyRateInr: number;
    imageUrl: string;
  }> = [];
  featuredLoading = false;
  featuredError: string | null = null;

  faqs: Array<{ question: string; answer: string; expanded: boolean }> = [
    {
      question: 'How Can I Trust The Expert Sent By HouseMate?',
      answer:
        'We thoroughly vet all of our experts through background checks and skill assessments. You can also view ratings and reviews from other users before booking.',
      expanded: true
    },
    {
      question: "What If The Service Provider Is Late Or Doesn\'t Show Up?",
      answer:
        'If your expert is delayed or unavailable, you can reschedule or modify the booking. Support is available to help you find the next best slot.',
      expanded: false
    }
  ];

  upcomingBookings: Array<{
    id: string;
    amountChipLabel: string;
    dateLabel: string;
    timeLabel: string;
    addressLabel: string;
  }> = [];

  upcomingLoading = false;

  constructor(
    private store: Store,
    private serviceService: ServiceService,
    private bookingService: BookingService,
    private paymentService: PaymentService
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    this.loadFeaturedServices();

    this.user$.subscribe(user => {
      if (!user) return;
      this.loadUpcomingBookings(user.id);
    });
  }

  toggleFaq(index: number): void {
    this.faqs = this.faqs.map((faq, i) => ({ ...faq, expanded: i === index ? !faq.expanded : false }));
  }

  private loadFeaturedServices(): void {
    this.featuredLoading = true;
    this.featuredError = null;

    this.serviceService.getServices().subscribe({
      next: (services: Service[]) => {
        const active = services.filter(s => s.isActive);
        const preferredNames = ['Deep House Cleaning', 'Cooking Service', 'Gardening Service'];
        const picked: Service[] = [];

        for (const name of preferredNames) {
          const match = active.find(s => s.name.toLowerCase() === name.toLowerCase());
          if (match && !picked.some(p => p.id === match.id)) {
            picked.push(match);
          }
        }

        for (const svc of active) {
          if (picked.length >= 3) break;
          if (!picked.some(p => p.id === svc.id)) picked.push(svc);
        }

        this.featuredServices = picked.slice(0, 3).map(svc => {
          const hours = Math.max(0.5, (svc.typicalDurationMinutes || 60) / 60);
          const hourlyRateInr = Math.round((svc.startingPrice || 0) / hours);
          return {
            id: svc.id,
            name: svc.name,
            description: svc.description,
            hourlyRateInr,
            imageUrl: this.getServiceImageUrl(svc)
          };
        });
        this.featuredLoading = false;
      },
      error: () => {
        this.featuredError = 'Failed to load services.';
        this.featuredLoading = false;
        this.featuredServices = [];
      }
    });
  }

  private loadUpcomingBookings(customerId: string): void {
    this.upcomingLoading = true;
    forkJoin({
      bookings: this.bookingService.getCustomerBookings(customerId),
      services: this.serviceService.getServices(),
      addresses: this.bookingService.getCustomerAddresses(customerId),
      payments: this.paymentService.getPaymentsByCustomer(customerId)
    }).subscribe({
      next: ({ bookings, services, addresses, payments }) => {
        const serviceMap = new Map<string, Service>(services.map(s => [s.id, s]));
        const addressMap = new Map<string, BackendAddress>(addresses.map(a => [a.id, a]));
        const paidByBooking = new Map<string, number>();
        for (const p of payments) {
          if (p.status !== 'SUCCEEDED') continue;
          paidByBooking.set(p.bookingId, (paidByBooking.get(p.bookingId) || 0) + (p.amount || 0));
        }

        const upcoming = bookings
          .filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'REJECTED')
          .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
          .slice(0, 8);

        this.upcomingBookings = upcoming.map(b => {
          const svc = serviceMap.get(b.serviceId);
          const addr = addressMap.get(b.addressId);
          const due = Math.max(0, (b.quotedAmount || 0) - (paidByBooking.get(b.id) || 0));

          const when = b.scheduledStartTime || b.createdAt;
          const d = new Date(when);
          const dateLabel = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'long' });
          const timeLabel = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

          const addressLabel = addr
            ? `${addr.line1}, ${addr.city} - ${addr.postalCode}`
            : 'Address not found';

          const durationHours = Math.max(1, Math.round((b.durationMinutes || (svc?.typicalDurationMinutes || 60)) / 60));
          const amountChipLabel = due > 0 ? `₹${due}/- to pay` : 'Paid';

          return {
            id: b.id,
            amountChipLabel,
            dateLabel,
            timeLabel: `${timeLabel}, booked for ${durationHours}hrs`,
            addressLabel
          };
        });

        this.upcomingLoading = false;
      },
      error: () => {
        this.upcomingBookings = [];
        this.upcomingLoading = false;
      }
    });
  }

  private getServiceImageUrl(service: Service): string {
    const name = (service.name || '').toLowerCase();
    if (name.includes('clean')) return 'assets/images/services/allcleaning.jpg';
    if (name.includes('cook')) return 'assets/images/services/cooking.jpg';
    if (name.includes('garden')) return 'assets/images/services/gardening.jpg';
    return 'assets/images/services/cleaning.jpg';
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.store.dispatch(logout());
    }
  }
}
