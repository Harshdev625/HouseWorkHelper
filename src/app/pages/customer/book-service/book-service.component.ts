import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Store } from '@ngrx/store';

import { selectUser } from '../../../store/auth/auth.selectors';
import { ServiceService } from '../../../core/services/service.service';
import { ExpertService } from '../../../core/services/expert.service';
import { BookingService, BackendAddress, BackendBooking } from '../../../core/services/booking.service';
import { CouponService, BackendCoupon } from '../../../core/services/coupon.service';
import { PaymentService, PaymentMethod } from '../../../core/services/payment.service';
import { ExpertAvailabilityService, ExpertAvailability } from '../../../core/services/expert-availability.service';
import { Service, Category, Zone, ExpertProfile, User } from '../../../core/models';

type Step = 1 | 2 | 3 | 4;

type PaymentTab = 'CARD' | 'UPI' | 'NET_BANKING';

@Component({
  selector: 'app-book-service',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-service.component.html',
  styleUrls: ['./book-service.component.css']
})
export class BookServiceComponent implements OnInit {
  step: Step = 1;

  user: User | null = null;

  services: Service[] = [];
  categories: Category[] = [];
  zones: Zone[] = [];

  loading = false;
  error: string | null = null;

  selectedZoneId: string | null = null;

  selectedServiceId: string | null = null;
  selectedAddonIds: string[] = [];
  serviceSearch = '';

  experts: ExpertProfile[] = [];
  expertSearch = '';
  selectedExpertId: string | null = null;
  // Availability
  availabilityLoading = false;
  availabilityByExpertId = new Map<string, ExpertAvailability>();

  // Schedule
  bookingType: 'ASAP' | 'SCHEDULED' = 'ASAP';
  frequency: 'ONCE' = 'ONCE';
  dateOptions: string[] = [];
  selectedDate: string | null = null;
  timeSlots: string[] = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
  selectedTimeSlot: string | null = null;
  durationMinutes: number | null = null;

  // Address
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

  // Coupons + price summary
  coupons: BackendCoupon[] = [];
  couponCode = '';
  appliedCoupon: BackendCoupon | null = null;
  couponError: string | null = null;

  // Payment
  showPaymentModal = false;
  paymentTab: PaymentTab = 'CARD';
  paying = false;
  paymentSuccess = false;
  lastPaidAmount = 0;

  card = {
    cardNumber: '',
    cardholderName: '',
    expiry: '',
    cvv: ''
  };

  upi = {
    upiId: ''
  };

  netBanking = {
    bankName: ''
  };

  createdBooking: BackendBooking | null = null;

  constructor(
    public router: Router,
    private store: Store,
    private serviceService: ServiceService,
    private expertService: ExpertService,
    private bookingService: BookingService,
    private couponService: CouponService,
    private paymentService: PaymentService,
    private availabilityService: ExpertAvailabilityService
  ) {}

  ngOnInit(): void {
    this.dateOptions = this.buildNext4Days();

    this.store.select(selectUser).subscribe(user => {
      this.user = user;
      this.newAddress.customerId = user?.id || '';
      if (user && !this.loading) {
        this.loadInitialData(user);
      }
    });
  }

  private loadInitialData(user: User): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      services: this.serviceService.getServices(),
      categories: this.serviceService.getCategories(),
      zones: this.serviceService.getZones(),
      experts: this.expertService.getExperts({ status: 'APPROVED' }),
      addresses: this.bookingService.getCustomerAddresses(user.id),
      coupons: this.couponService.getActiveCoupons()
    }).subscribe({
      next: ({ services, categories, zones, experts, addresses, coupons }) => {
        this.services = services.filter(s => s.isActive);
        this.categories = categories.filter(c => c.isActive);
        this.zones = zones.filter(z => z.isActive);
        this.experts = experts;
        this.addresses = addresses;
        this.coupons = coupons;

        const defaultZone = user?.roles?.includes('ROLE_CUSTOMER') ? (user as any).preferredZoneIds?.[0] : null;
        this.selectedZoneId = defaultZone || zones.find(z => z.isActive)?.id || null;

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load booking data.';
        this.loading = false;
      }
    });
  }

  // Step 1: select service & expert
  get filteredServices(): Service[] {
    const q = this.serviceSearch.trim().toLowerCase();
    if (!q) return this.services;
    return this.services.filter(s => (s.name || '').toLowerCase().includes(q));
  }

  selectService(service: Service): void {
    this.selectedServiceId = service.id;
    this.selectedAddonIds = [];
    this.durationMinutes = service.durationMinutes || 60;
    this.appliedCoupon = null;
    this.couponCode = '';
    this.couponError = null;
    this.createdBooking = null;
    this.selectedExpertId = null;
    this.expertSearch = '';
  }

  toggleAddon(addonId: string): void {
    if (!this.selectedService) return;
    if (this.selectedAddonIds.includes(addonId)) {
      this.selectedAddonIds = this.selectedAddonIds.filter(id => id !== addonId);
    } else {
      this.selectedAddonIds = [...this.selectedAddonIds, addonId];
    }
  }

  get selectedService(): Service | null {
    return this.services.find(s => s.id === this.selectedServiceId) || null;
  }

  get selectedCategory(): Category | null {
    const svc = this.selectedService;
    if (!svc) return null;
    return this.categories.find(c => c.id === svc.categoryId) || null;
  }

  get selectedExpertName(): string {
    if (!this.selectedExpertId) return '';
    return this.experts.find(e => e.id === this.selectedExpertId)?.fullName || '';
  }

  get hourlyRateLabel(): string {
    const svc = this.selectedService;
    if (!svc) return '';
    const hours = Math.max(1, (svc.durationMinutes || 60) / 60);
    const hourly = Math.round(svc.hourlyRateInr / hours);
    return `₹${hourly}/hr`;
  }

  get expertCards(): ExpertProfile[] {
    const q = this.expertSearch.trim().toLowerCase();
    const zoneId = this.selectedZoneId;

    let list = this.experts;

    if (zoneId) {
      list = list.filter(e => (e.zoneIds || []).includes(zoneId));
    }

    const categoryName = (this.selectedCategory?.name || '').toLowerCase();
    if (categoryName) {
      list = list.filter(e => (e.skills || []).some(s => s.toLowerCase().includes(categoryName)));
    }

    if (q) {
      list = list.filter(e => (e.fullName || '').toLowerCase().includes(q));
    }

    // Availability filtering
    if (this.bookingType === 'ASAP') {
      list = list.filter(e => e.onlineStatus === 'ONLINE');
    } else {
      if (this.selectedDate && this.selectedTimeSlot) {
        list = list.filter(e => {
          const rec = this.availabilityByExpertId.get(e.id);
          return (rec?.timeSlots || []).includes(this.selectedTimeSlot!);
        });
      }
    }

    return list;
  }

  get availableExpertsCount(): number {
    return this.expertCards.length;
  }

  selectExpert(expertId: string): void {
    this.selectedExpertId = expertId;
  }

  // Step navigation
  next(): void {
    if (this.step === 1) {
      if (!this.selectedServiceId) return;
      this.step = 2;
      return;
    }

    if (this.step === 2) {
      if (this.bookingType === 'SCHEDULED' && (!this.selectedDate || !this.selectedTimeSlot)) return;
      if (!this.durationMinutes) return;
      if (!this.selectedExpertId) return;
      this.step = 3;
      return;
    }

    if (this.step === 3) {
      if (!this.selectedAddressId) return;
      this.step = 4;
      return;
    }
  }

  back(): void {
    if (this.step === 1) {
      this.router.navigate(['/customer/dashboard']);
      return;
    }

    this.step = (this.step - 1) as Step;
  }

  // Step 2 helpers
  setBookingType(type: 'ASAP' | 'SCHEDULED'): void {
    this.bookingType = type;

    if (type === 'ASAP') {
      this.selectedDate = null;
      this.selectedTimeSlot = null;
      this.availabilityByExpertId.clear();
      this.availabilityLoading = false;
    } else {
      this.selectedDate = this.selectedDate || this.dateOptions[0] || null;
      if (this.selectedDate) {
        this.loadAvailabilityForDate(this.selectedDate);
      }
    }

    if (this.selectedExpertId && !this.expertCards.some(e => e.id === this.selectedExpertId)) {
      this.selectedExpertId = null;
    }
  }

  onScheduledDateChange(date: string | null): void {
    this.selectedDate = date;
    this.selectedTimeSlot = null;
    this.availabilityByExpertId.clear();

    if (date) {
      this.loadAvailabilityForDate(date);
    } else {
      this.availabilityLoading = false;
    }

    if (this.selectedExpertId && !this.expertCards.some(e => e.id === this.selectedExpertId)) {
      this.selectedExpertId = null;
    }
  }

  onScheduledTimeChange(slot: string | null): void {
    this.selectedTimeSlot = slot;

    if (this.selectedExpertId && !this.expertCards.some(e => e.id === this.selectedExpertId)) {
      this.selectedExpertId = null;
    }
  }

  private loadAvailabilityForDate(date: string): void {
    this.availabilityLoading = true;
    this.availabilityByExpertId.clear();

    this.availabilityService.getByDate(date).subscribe({
      next: (records) => {
        this.availabilityByExpertId = new Map<string, ExpertAvailability>(
          records.map(r => [r.expertProfileId, r])
        );
        this.availabilityLoading = false;

        if (this.selectedExpertId && !this.expertCards.some(e => e.id === this.selectedExpertId)) {
          this.selectedExpertId = null;
        }
      },
      error: () => {
        this.availabilityLoading = false;
        this.availabilityByExpertId.clear();
      }
    });
  }

  // Step 3: addresses
  selectAddress(addressId: string): void {
    this.selectedAddressId = addressId;
  }

  saveAddress(): void {
    if (!this.user) return;
    const a = this.newAddress;
    if (!a.label || !a.line1 || !a.city || !a.state || !a.postalCode) return;

    this.bookingService.createAddress({
      ...a,
      customerId: this.user.id
    }).subscribe({
      next: (created) => {
        this.addresses = [created, ...this.addresses];
        this.selectedAddressId = created.id;
        this.showAddAddress = false;
        this.newAddress = {
          customerId: this.user?.id || '',
          label: 'Home',
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          isDefault: false
        };
      },
      error: () => {
        this.error = 'Failed to save address.';
      }
    });
  }

  // Step 4: coupons + quote
  get baseAmount(): number {
    return this.selectedService?.hourlyRateInr || 0;
  }

  get addonsAmount(): number {
    if (!this.selectedService) return 0;
    const addons = this.selectedService.addons || [];
    return addons
      .filter(a => this.selectedAddonIds.includes(a.id))
      .reduce((sum, a) => sum + (a.priceInr || 0), 0);
  }

  get subtotal(): number {
    return this.baseAmount + this.addonsAmount;
  }

  get discountAmount(): number {
    const coupon = this.appliedCoupon;
    if (!coupon) return 0;

    if (this.subtotal < (coupon.minOrderValue || 0)) return 0;

    if (coupon.applicableZones?.length && this.selectedZoneId && !coupon.applicableZones.includes(this.selectedZoneId)) {
      return 0;
    }

    if (coupon.applicableServices?.length && this.selectedServiceId && !coupon.applicableServices.includes(this.selectedServiceId)) {
      return 0;
    }

    let discount = 0;
    if (coupon.discountType === 'FIXED') {
      discount = coupon.discountValue;
    } else {
      discount = (this.subtotal * coupon.discountValue) / 100;
    }

    if (coupon.maxDiscount != null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    discount = Math.max(0, Math.min(discount, this.subtotal));
    return Math.round(discount);
  }

  get gstAmount(): number {
    const taxable = Math.max(0, this.subtotal - this.discountAmount);
    return Math.round(taxable * 0.18);
  }

  get totalAmount(): number {
    return Math.max(0, this.subtotal - this.discountAmount) + this.gstAmount;
  }

  applyCoupon(): void {
    this.couponError = null;
    const code = this.couponCode.trim().toUpperCase();

    if (!code) {
      this.appliedCoupon = null;
      return;
    }

    const coupon = this.coupons.find(c => (c.code || '').toUpperCase() === code) || null;
    if (!coupon) {
      this.appliedCoupon = null;
      this.couponError = 'Invalid coupon code.';
      return;
    }

    if (this.subtotal < (coupon.minOrderValue || 0)) {
      this.appliedCoupon = null;
      this.couponError = `Minimum order ₹${coupon.minOrderValue} required.`;
      return;
    }

    if (coupon.applicableZones?.length && this.selectedZoneId && !coupon.applicableZones.includes(this.selectedZoneId)) {
      this.appliedCoupon = null;
      this.couponError = 'Coupon not applicable for selected zone.';
      return;
    }

    if (coupon.applicableServices?.length && this.selectedServiceId && !coupon.applicableServices.includes(this.selectedServiceId)) {
      this.appliedCoupon = null;
      this.couponError = 'Coupon not applicable for selected service.';
      return;
    }

    this.appliedCoupon = coupon;
  }

  proceedToPayment(): void {
    if (!this.user || !this.selectedServiceId || !this.selectedAddressId) return;
    if (!this.selectedZoneId) return;
    if (!this.selectedExpertId) return;

    if (this.paying) return;

    const scheduled = this.bookingType === 'SCHEDULED'
      ? this.toScheduledISO(this.selectedDate, this.selectedTimeSlot)
      : null;

    const payload: Omit<BackendBooking, 'id' | 'createdAt' | 'updatedAt' | 'otp'> = {
      customerId: this.user.id,
      expertId: this.selectedExpertId,
      zoneId: this.selectedZoneId,
      serviceId: this.selectedServiceId,
      addressId: this.selectedAddressId,
      status: 'PENDING_PAYMENT',
      bookingType: this.bookingType,
      durationMinutes: this.durationMinutes || (this.selectedService?.durationMinutes || 60),
      addonIds: [...this.selectedAddonIds],
      quotedAmount: this.totalAmount,
      currency: 'INR',
      etaMinutes: this.bookingType === 'ASAP' ? 35 : null,
      scheduledStartTime: scheduled,
      actualStartTime: null,
      actualEndTime: null,
      notes: ''
    };

    this.bookingService.createBooking(payload).subscribe({
      next: (created) => {
        this.createdBooking = created;
        this.showPaymentModal = true;
      },
      error: () => {
        this.error = 'Failed to create booking.';
      }
    });
  }

  pay(method: PaymentMethod): void {
    if (!this.user || !this.createdBooking) return;
    if (this.paying) return;

    this.paying = true;
    this.paymentSuccess = false;
    this.lastPaidAmount = 0;

    const amount = this.createdBooking.quotedAmount;

    this.paymentService.createPayment({
      bookingId: this.createdBooking.id,
      customerId: this.user.id,
      amount,
      currency: 'INR',
      status: 'SUCCEEDED',
      method,
      transactionId: `txn_${Date.now()}`
    }).subscribe({
      next: () => {
        this.bookingService.patchBooking(this.createdBooking!.id, { status: 'CONFIRMED' }).subscribe({
          next: (updated) => {
            this.createdBooking = updated;
            this.lastPaidAmount = amount;
            this.paymentSuccess = true;
            this.paying = false;
          },
          error: () => {
            this.paying = false;
            this.error = 'Payment succeeded, but booking update failed.';
          }
        });
      },
      error: () => {
        this.paying = false;
        this.error = 'Payment failed.';
      }
    });
  }

  closePayment(): void {
    this.showPaymentModal = false;
    if (this.paymentSuccess) {
      this.router.navigate(['/customer/dashboard']);
    }
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

  private toScheduledISO(date: string | null, timeSlot: string | null): string | null {
    if (!date || !timeSlot) return null;
    const [time, meridiem] = timeSlot.split(' ');
    const [hhStr, mmStr] = time.split(':');
    let hh = parseInt(hhStr, 10);
    const mm = parseInt(mmStr, 10);
    if (meridiem === 'PM' && hh !== 12) hh += 12;
    if (meridiem === 'AM' && hh === 12) hh = 0;

    const d = new Date(`${date}T00:00:00`);
    d.setHours(hh, mm, 0, 0);
    return d.toISOString();
  }
}
