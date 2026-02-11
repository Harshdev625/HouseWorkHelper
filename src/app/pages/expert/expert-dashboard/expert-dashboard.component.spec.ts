import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ExpertDashboardComponent } from './expert-dashboard.component';
import { selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';
import { User } from '../../../core/models';
import { selectExpertProfile } from '../../../store/expert/expert.selectors';
import { updateOnlineStatus } from '../../../store/expert/expert.actions';
import { selectExpertBookings } from '../../../store/booking/booking.selectors';
import { selectAllServices } from '../../../store/service/service.selectors';

describe('ExpertDashboardComponent', () => {
  let component: ExpertDashboardComponent;
  let fixture: ComponentFixture<ExpertDashboardComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;

  const mockUser: User = {
    id: '1',
    phone: '+919876543211',
    email: 'expert@example.com',
    fullName: 'Test Expert',
    password: 'hashed',
    roles: ['ROLE_EXPERT'],
    blocked: false,
    createdAt: '2026-01-01T00:00:00Z'
  };

  const initialState = {
    auth: {
      user: mockUser,
      token: 'mock-token',
      loading: false,
      error: null
    },
    expert: {
      profile: {
        id: 'exp-1',
        userId: mockUser.id,
        fullName: mockUser.fullName,
        phone: mockUser.phone,
        email: mockUser.email,
        skills: ['Cleaning'],
        zoneIds: ['zone-1'],
        status: 'APPROVED',
        onlineStatus: 'OFFLINE',
        rating: 4.7,
        totalJobs: 10,
        createdAt: '2026-01-01T00:00:00Z'
      },
      loading: false,
      updatingStatus: false,
      error: null
    },
    booking: {
      customerBookings: [],
      expertBookings: [],
      addresses: [],
      loadingCustomerBookings: false,
      loadingExpertBookings: false,
      loadingAddresses: false,
      creatingBooking: false,
      patchingBooking: false,
      creatingAddress: false,
      lastCreatedBooking: null,
      error: null
    },
    service: {
      services: [],
      selectedServiceId: null,
      loading: false,
      error: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExpertDashboardComponent,
        CommonModule,
        HttpClientTestingModule
      ],
      providers: [
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    store.overrideSelector(selectUser, mockUser);
    store.overrideSelector(selectExpertProfile as any, initialState.expert.profile as any);
    store.overrideSelector(selectExpertBookings as any, [] as any);
    store.overrideSelector(selectAllServices as any, [] as any);

    fixture = TestBed.createComponent(ExpertDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose computed stats$', (done) => {
    component.stats$.subscribe(stats => {
      expect(stats.todayJobs).toBeGreaterThanOrEqual(0);
      expect(stats.thisWeekJobs).toBeGreaterThanOrEqual(0);
      expect(stats.totalEarnings).toBeGreaterThanOrEqual(0);
      expect(stats.rating).toBeGreaterThanOrEqual(0);
      done();
    });
  });

  it('should dispatch updateOnlineStatus on toggle', () => {
    component.toggleOnlineStatus();
    expect(dispatchSpy).toHaveBeenCalledWith(updateOnlineStatus({ expertProfileId: 'exp-1', onlineStatus: 'ONLINE' }));
  });

  it('should dispatch logout action when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    dispatchSpy.calls.reset();
    
    component.onLogout();
    
    expect(dispatchSpy).toHaveBeenCalledWith(logout());
  });

  it('should not dispatch logout action when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    dispatchSpy.calls.reset();
    
    component.onLogout();
    
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should display expert name in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    
    expect(compiled.textContent).toContain('Test Expert');
  });
});
