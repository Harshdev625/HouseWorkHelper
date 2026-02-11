import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { CustomerDashboardComponent } from './customer-dashboard.component';
import { selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';
import { of } from 'rxjs';
import { User } from '../../../core/models';
import { ServiceService } from '../../../core/services/service.service';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';

describe('CustomerDashboardComponent', () => {
  let component: CustomerDashboardComponent;
  let fixture: ComponentFixture<CustomerDashboardComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  let serviceService: jasmine.SpyObj<ServiceService>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let paymentService: jasmine.SpyObj<PaymentService>;

  const mockUser: User = {
    id: '1',
    phone: '+919876543210',
    email: 'customer@example.com',
    fullName: 'Test Customer',
    password: 'hashed',
    roles: ['ROLE_CUSTOMER'],
    blocked: false,
    createdAt: '2026-01-01T00:00:00Z'
  };

  const initialState = {
    auth: {
      user: mockUser,
      token: 'mock-token',
      loading: false,
      error: null
    }
  };

  beforeEach(async () => {
    serviceService = jasmine.createSpyObj<ServiceService>('ServiceService', ['getServices']);
    bookingService = jasmine.createSpyObj<BookingService>('BookingService', [
      'getCustomerBookings',
      'getCustomerAddresses'
    ]);
    paymentService = jasmine.createSpyObj<PaymentService>('PaymentService', ['getPaymentsByCustomer']);

    serviceService.getServices.and.returnValue(
      of([
        {
          id: 'svc-1',
          categoryId: 'cat-1',
          name: 'Deep House Cleaning',
          description: 'Desc 1',
          startingPrice: 300,
          currency: 'INR',
          typicalDurationMinutes: 120,
          isActive: true,
          availableZones: [],
          addons: []
        },
        {
          id: 'svc-2',
          categoryId: 'cat-2',
          name: 'Cooking Service',
          description: 'Desc 2',
          startingPrice: 300,
          currency: 'INR',
          typicalDurationMinutes: 120,
          isActive: true,
          availableZones: [],
          addons: []
        },
        {
          id: 'svc-3',
          categoryId: 'cat-3',
          name: 'Gardening Service',
          description: 'Desc 3',
          startingPrice: 300,
          currency: 'INR',
          typicalDurationMinutes: 120,
          isActive: true,
          availableZones: [],
          addons: []
        }
      ] as any)
    );

    bookingService.getCustomerAddresses.and.returnValue(
      of([
        {
          id: 'addr-1',
          customerId: mockUser.id,
          label: 'Home',
          line1: '201, Manjari Khurd',
          line2: '',
          city: 'Pune',
          state: 'MH',
          postalCode: '143505',
          isDefault: true
        }
      ] as any)
    );

    bookingService.getCustomerBookings.and.returnValue(
      of([
        {
          id: 'b-1',
          customerId: mockUser.id,
          expertId: 'exp-1',
          zoneId: 'zone-1',
          serviceId: 'svc-1',
          addressId: 'addr-1',
          status: 'CONFIRMED',
          bookingType: 'SCHEDULED',
          durationMinutes: 120,
          addonIds: [],
          quotedAmount: 299,
          currency: 'INR',
          etaMinutes: null,
          scheduledStartTime: '2026-01-31T09:00:00.000Z',
          actualStartTime: null,
          actualEndTime: null,
          notes: '',
          otp: '1234',
          createdAt: '2026-01-30T09:00:00.000Z',
          updatedAt: '2026-01-30T09:00:00.000Z'
        }
      ] as any)
    );

    paymentService.getPaymentsByCustomer.and.returnValue(of([] as any));

    await TestBed.configureTestingModule({
      imports: [
        CustomerDashboardComponent,
        CommonModule,
        RouterTestingModule
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: ServiceService, useValue: serviceService },
        { provide: BookingService, useValue: bookingService },
        { provide: PaymentService, useValue: paymentService }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    store.overrideSelector(selectUser, mockUser);

    fixture = TestBed.createComponent(CustomerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user from store', (done) => {
    component.user$.subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });
  });

  it('should have services defined', () => {
    expect(component.popularServices).toBeDefined();
    expect(component.popularServices.length).toBeGreaterThan(0);
    expect(component.popularServices.some(s => s.name === 'Cleaning')).toBeTruthy();
  });

  it('should load upcoming bookings from backend', () => {
    expect(bookingService.getCustomerBookings).toHaveBeenCalledWith(mockUser.id);
    expect(component.upcomingBookings.length).toBeGreaterThan(0);
  });

  it('should dispatch logout action when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    
    component.onLogout();
    
    expect(dispatchSpy).toHaveBeenCalledWith(logout());
  });

  it('should not dispatch logout action when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.onLogout();
    
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should display customer name in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    
    // This would check if the user name appears in the DOM
    expect(compiled.textContent).toContain('Test Customer');
  });

  it('should render upcoming booking cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.booking-card');
    expect(cards.length).toBeGreaterThan(0);

    const chip = compiled.querySelector('.pay-chip');
    expect(chip?.textContent || '').toContain('₹');
    // could be 'Paid' or '₹X/- to pay' depending on payment state
  });

  it('should render popular services tiles', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tiles = compiled.querySelectorAll('.popular-card');
    expect(tiles.length).toBe(component.popularServices.length);
  });

  it('should load and render featured services from backend', () => {
    expect(serviceService.getServices).toHaveBeenCalled();
    expect(component.featuredServices.length).toBe(3);

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.featured-card');
    expect(cards.length).toBe(3);
    const rate = compiled.querySelector('.featured-rate');
    expect(rate?.textContent || '').toContain('/hr');
  });

  it('should render FAQs and toggle expansion', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const faqItems = compiled.querySelectorAll('.faq-item');
    expect(faqItems.length).toBeGreaterThan(0);
    expect(compiled.textContent).toContain('How Can I Trust');

    component.toggleFaq(1);
    fixture.detectChanges();
    expect(component.faqs[1].expanded).toBeTrue();
  });
});
