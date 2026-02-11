import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { forkJoin } from 'rxjs';

import { selectUser } from '../../../store/auth/auth.selectors';
import { BookingService, BackendBooking } from '../../../core/services/booking.service';
import { RatingService, CreateRatingRequest } from '../../../core/services/rating.service';
import { ExpertService } from '../../../core/services/expert.service';
import { ServiceService } from '../../../core/services/service.service';
import { User, ExpertProfile, Service } from '../../../core/models';

@Component({
  selector: 'app-provide-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './provide-feedback.component.html',
  styleUrls: ['./provide-feedback.component.css']
})
export class ProvideFeedbackComponent implements OnInit {
  user: User | null = null;

  loading = false;
  error: string | null = null;

  completedBookings: Array<{
    booking: BackendBooking;
    service: Service | null;
    expert: ExpertProfile | null;
    hasRating: boolean;
  }> = [];

  // Feedback modal
  showFeedbackModal = false;
  selectedBooking: BackendBooking | null = null;
  selectedExpert: ExpertProfile | null = null;
  selectedService: Service | null = null;
  
  rating: number = 0;
  feedback: string = '';
  hoveredRating: number = 0;
  submitting = false;

  constructor(
    private router: Router,
    private store: Store,
    private bookingService: BookingService,
    private ratingService: RatingService,
    private expertService: ExpertService,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser).subscribe(user => {
      this.user = user;
      if (user && !this.loading) {
        this.loadCompletedBookings(user.id);
      }
    });
  }

  private loadCompletedBookings(customerId: string): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      bookings: this.bookingService.getCustomerBookings(customerId),
      ratings: this.ratingService.getRatingsByCustomer(customerId),
      services: this.serviceService.getServices()
    }).subscribe({
      next: ({ bookings, ratings, services }) => {
        const completed = bookings.filter(b => b.status === 'COMPLETED');
        const ratingBookingIds = new Set(ratings.map(r => r.bookingId));

        // For each completed booking, load expert info
        const expertRequests = completed
          .filter(b => b.expertId)
          .map(b => this.expertService.getExpertProfileByUserId(b.expertId!));

        if (expertRequests.length > 0) {
          forkJoin(expertRequests).subscribe({
            next: (expertResults) => {
              this.completedBookings = completed.map((booking, index) => ({
                booking,
                service: services.find(s => s.id === booking.serviceId) || null,
                expert: expertResults[index]?.[0] || null,
                hasRating: ratingBookingIds.has(booking.id)
              }));
              this.loading = false;
            },
            error: () => {
              this.error = 'Failed to load expert details.';
              this.loading = false;
            }
          });
        } else {
          this.completedBookings = completed.map(booking => ({
            booking,
            service: services.find(s => s.id === booking.serviceId) || null,
            expert: null,
            hasRating: ratingBookingIds.has(booking.id)
          }));
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Failed to load bookings.';
        this.loading = false;
      }
    });
  }

  openFeedbackModal(item: { booking: BackendBooking; service: Service | null; expert: ExpertProfile | null }): void {
    this.selectedBooking = item.booking;
    this.selectedService = item.service;
    this.selectedExpert = item.expert;
    this.rating = 0;
    this.feedback = '';
    this.showFeedbackModal = true;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    this.selectedBooking = null;
    this.selectedService = null;
    this.selectedExpert = null;
    this.rating = 0;
    this.feedback = '';
    this.hoveredRating = 0;
  }

  setRating(star: number): void {
    this.rating = star;
  }

  setHoveredRating(star: number): void {
    this.hoveredRating = star;
  }

  clearHoveredRating(): void {
    this.hoveredRating = 0;
  }

  submitFeedback(): void {
    if (!this.selectedBooking || !this.user || !this.rating) {
      alert('Please provide a rating');
      return;
    }

    if (!this.selectedBooking.expertId) {
      alert('No expert assigned to this booking');
      return;
    }

    this.submitting = true;

    const ratingRequest: CreateRatingRequest = {
      bookingId: this.selectedBooking.id,
      customerId: this.user.id,
      expertId: this.selectedBooking.expertId,
      rating: this.rating,
      feedback: this.feedback || ''
    };

    this.ratingService.createRating(ratingRequest).subscribe({
      next: () => {
        alert('Thank you for your feedback!');
        this.closeFeedbackModal();
        if (this.user) {
          this.loadCompletedBookings(this.user.id);
        }
      },
      error: () => {
        alert('Failed to submit feedback. Please try again.');
        this.submitting = false;
      }
    });
  }

  back(): void {
    this.router.navigate(['/customer/dashboard']);
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }
}
