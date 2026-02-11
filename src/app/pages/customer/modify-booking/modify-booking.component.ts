import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Store } from '@ngrx/store';

import { selectUser } from '../../../store/auth/auth.selectors';
import { BookingService, BackendBooking, BackendAddress } from '../../../core/services/booking.service';
import { ServiceService } from '../../../core/services/service.service';
import { ExpertService } from '../../../core/services/expert.service';
import { PaymentService, PaymentMethod } from '../../../core/services/payment.service';
import { ExpertAvailabilityService } from '../../../core/services/expert-availability.service';
import { Service, ExpertProfile, User } from '../../../core/models';

@Component({
  selector: 'app-modify-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modify-booking.component.html',
  styleUrls: ['./modify-booking.component.css']
})
export class ModifyBookingComponent implements OnInit {
  user: User | null = null;
  bookingId = '';

  loading = false;
  error: string | null = null;

  booking: BackendBooking | null = null;
  originalBooking: BackendBooking | null = null;
  service: Service | null = null;
  address: BackendAddress | null = null;
  expert: ExpertProfile | null = null;

  amountPaid = 0;
  hasChanges = false;

  // Edit modals
  showEditExpertModal = false;
  showEditScheduleModal = false;
  showEditAddressModal = false;
  showCancelModal = false;
  showPaymentModal = false;

  // Edit expert
  services: Service[] = [];
  experts: ExpertProfile[] = [];
  selectedExpertId: string | null = null;
  selectedServiceId: string | null = null;
  expertSearch = '';

  // Edit schedule
  dateOptions: string[] = [];
  selectedDate: string | null = null;
  timeSlots: string[] = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
  selectedTimeSlot: string | null = null;
  durationMinutes: number | null = null;
  frequency: 'ONCE' = 'ONCE';

  // Edit address
  addresses: BackendAddress[] = [];
  selectedAddressId: string | null = null;
  showAddAddress = false;
  newAddress: Omit<BackendAddress, 'id'> = {
    customerId: '',
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false
  };

  // Payment
  paying = false;
  paymentTab: 'CARD' | 'UPI' | 'NET_BANKING' = 'CARD';
  card = {
    cardNumber: '',
    cardholderName: '',
    expiry: '',
    cvv: ''
  };
  upi = { upiId: '' };

  // Cancel
  cancelReason = '';
  cancelling = false;

  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private bookingService: BookingService,
    private serviceService: ServiceService,
    private expertService: ExpertService,
    private paymentService: PaymentService,
    private availabilityService: ExpertAvailabilityService
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id') || '';

    this.store.select(selectUser).subscribe(user => {
      this.user = user;
      if (user && this.bookingId && !this.loading) {
        this.load(user.id, this.bookingId);
      }
    });

    // Generate date options (next 4 days)
    for (let i = 0; i < 4; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      this.dateOptions.push(date.toISOString().split('T')[0]);
    }
  }

  private load(customerId: string, bookingId: string): void {
    this.loading = true;
    this.error = null;

    this.bookingService.getBookingById(bookingId).subscribe({
      next: (booking) => {
        forkJoin({
          service: this.serviceService.getServiceById(booking.serviceId),
          addresses: this.bookingService.getCustomerAddresses(customerId),
          payments: this.paymentService.getPaymentsByCustomer(customerId),
          services: this.serviceService.getServices()
        }).subscribe({
          next: ({ service, addresses, payments, services }) => {
            this.booking = { ...booking };
            this.originalBooking = { ...booking };
            this.service = service;
            this.addresses = addresses;
            this.address = addresses.find(a => a.id === booking.addressId) || null;
            this.services = services;
            
            this.amountPaid = payments
              .filter(p => p.bookingId === booking.id && p.status === 'SUCCEEDED')
              .reduce((sum, p) => sum + (p.amount || 0), 0);

            // Load expert if assigned
            if (booking.expertId) {
              this.expertService.getExpertProfileByUserId(booking.expertId).subscribe({
                next: (profiles) => {
                  this.expert = profiles.length > 0 ? profiles[0] : null;
                },
                error: () => {}
              });
            }

            // Init edit values
            this.selectedServiceId = booking.serviceId;
            this.selectedExpertId = booking.expertId;
            this.selectedAddressId = booking.addressId;
            this.durationMinutes = booking.durationMinutes;
            if (booking.scheduledStartTime) {
              const dt = new Date(booking.scheduledStartTime);
              this.selectedDate = dt.toISOString().split('T')[0];
              this.selectedTimeSlot = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            }

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

  get baseAmount(): number {
    if (!this.originalBooking) return 0;
    return this.originalBooking.quotedAmount || 0;
  }

  get subtotal(): number {
    return this.baseAmount;
  }

  get gst(): number {
    return Math.round(this.subtotal * 0.18);
  }

  get totalAmount(): number {
    return this.subtotal + this.gst;
  }

  get newServiceAmount(): number {
    if (!this.booking) return 0;
    return this.booking.quotedAmount || 0;
  }

  get newSubtotal(): number {
    return this.newServiceAmount;
  }

  get newGst(): number {
    return Math.round(this.newSubtotal * 0.18);
  }

  get amountToPay(): number {
    const newTotal = this.newSubtotal + this.newGst;
    return Math.max(0, newTotal - this.amountPaid);
  }

  openEditExpert(): void {
    this.showEditExpertModal = true;
    // Load experts
    if (this.booking) {
      this.expertService.getExperts({ zoneId: this.booking.zoneId, status: 'APPROVED' }).subscribe({
        next: (experts) => {
          this.experts = experts;
        },
        error: () => {}
      });
    }
  }

  closeEditExpert(): void {
    this.showEditExpertModal = false;
  }

  selectExpert(expertId: string): void {
    if (this.booking) {
      this.booking.expertId = expertId;
      this.selectedExpertId = expertId;
      this.hasChanges = true;
      
      // Load expert details
      this.expertService.getExpertProfileByUserId(expertId).subscribe({
        next: (profiles) => {
          this.expert = profiles.length > 0 ? profiles[0] : null;
        },
        error: () => {}
      });
    }
    this.closeEditExpert();
  }

  openEditSchedule(): void {
    this.showEditScheduleModal = true;
  }

  closeEditSchedule(): void {
    this.showEditScheduleModal = false;
  }

  saveSchedule(): void {
    if (this.booking && this.selectedDate && this.selectedTimeSlot && this.durationMinutes) {
      const [time, period] = this.selectedTimeSlot.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const scheduledDate = new Date(this.selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);

      this.booking.scheduledStartTime = scheduledDate.toISOString();
      this.booking.durationMinutes = this.durationMinutes;
      this.hasChanges = true;
      this.closeEditSchedule();
    }
  }

  openEditAddress(): void {
    this.showEditAddressModal = true;
  }

  closeEditAddress(): void {
    this.showEditAddressModal = false;
    this.showAddAddress = false;
  }

  selectAddress(addressId: string): void {
    if (this.booking) {
      this.booking.addressId = addressId;
      this.selectedAddressId = addressId;
      this.address = this.addresses.find(a => a.id === addressId) || null;
      this.hasChanges = true;
    }
    this.closeEditAddress();
  }

  showAddNewAddress(): void {
    this.showAddAddress = true;
    if (this.user) {
      this.newAddress.customerId = this.user.id;
    }
  }

  saveNewAddress(): void {
    if (!this.newAddress.line1 || !this.newAddress.city || !this.newAddress.state || !this.newAddress.postalCode) {
      alert('Please fill all required address fields');
      return;
    }

    this.bookingService.createAddress(this.newAddress).subscribe({
      next: (addr) => {
        this.addresses.push(addr);
        this.selectAddress(addr.id);
        this.showAddAddress = false;
      },
      error: () => {
        alert('Failed to add address');
      }
    });
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelReason = '';
  }

  confirmCancel(): void {
    if (!this.booking) return;

    this.cancelling = true;
    this.bookingService.patchBooking(this.booking.id, { 
      status: 'CANCELLED_BY_CUSTOMER',
      notes: this.cancelReason 
    }).subscribe({
      next: () => {
        alert('Booking cancelled successfully');
        this.router.navigate(['/customer/bookings']);
      },
      error: () => {
        alert('Failed to cancel booking');
        this.cancelling = false;
      }
    });
  }

  confirmChanges(): void {
    if (!this.booking || !this.hasChanges) return;

    if (this.amountToPay > 0) {
      this.showPaymentModal = true;
    } else {
      this.saveChanges();
    }
  }

  saveChanges(): void {
    if (!this.booking) return;

    this.saving = true;
    const updates: Partial<BackendBooking> = {
      expertId: this.booking.expertId,
      serviceId: this.booking.serviceId,
      addressId: this.booking.addressId,
      scheduledStartTime: this.booking.scheduledStartTime,
      durationMinutes: this.booking.durationMinutes,
      quotedAmount: this.booking.quotedAmount
    };

    this.bookingService.patchBooking(this.booking.id, updates).subscribe({
      next: () => {
        alert('Booking updated successfully');
        this.router.navigate(['/customer/bookings', this.bookingId]);
      },
      error: () => {
        alert('Failed to update booking');
        this.saving = false;
      }
    });
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  processPayment(): void {
    if (!this.booking || !this.user) return;

    // Validate payment method
    if (this.paymentTab === 'CARD') {
      if (!this.card.cardNumber || !this.card.cardholderName || !this.card.expiry || !this.card.cvv) {
        alert('Please fill all card details');
        return;
      }
    } else if (this.paymentTab === 'UPI') {
      if (!this.upi.upiId) {
        alert('Please enter UPI ID');
        return;
      }
    }

    this.paying = true;

    const payment = {
      bookingId: this.booking.id,
      customerId: this.user.id,
      amount: this.amountToPay,
      currency: 'INR' as const,
      status: 'SUCCEEDED' as const,
      method: this.paymentTab as PaymentMethod,
      transactionId: `txn_${this.amountToPay}_${Date.now()}`
    };

    this.paymentService.createPayment(payment).subscribe({
      next: () => {
        this.showPaymentModal = false;
        this.saving = true;
        this.saveChanges();
      },
      error: () => {
        alert('Payment failed. Please try again.');
        this.paying = false;
      }
    });
  }

  back(): void {
    this.router.navigate(['/customer/bookings', this.bookingId]);
  }

  getServiceName(serviceId: string): string {
    return this.services.find(s => s.id === serviceId)?.name || 'Service';
  }

  getAddressLabel(addr: BackendAddress): string {
    return `${addr.line1}, ${addr.city} - ${addr.postalCode}`;
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
}
