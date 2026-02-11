import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { CustomerDashboardComponent } from './customer-dashboard.component';
import { selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';
import { of } from 'rxjs';
import { User } from '../../../core/models';

describe('CustomerDashboardComponent', () => {
  let component: CustomerDashboardComponent;
  let fixture: ComponentFixture<CustomerDashboardComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;

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
    await TestBed.configureTestingModule({
      imports: [
        CustomerDashboardComponent,
        CommonModule
      ],
      providers: [
        provideMockStore({ initialState })
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
    expect(component.services).toBeDefined();
    expect(component.services.length).toBeGreaterThan(0);
    expect(component.services.some(s => s.name === 'Cleaning')).toBeTruthy();
  });

  it('should initialize with empty upcoming bookings', () => {
    expect(component.upcomingBookings).toEqual([]);
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
});
