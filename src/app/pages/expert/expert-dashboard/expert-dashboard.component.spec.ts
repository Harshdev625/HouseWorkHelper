import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ExpertDashboardComponent } from './expert-dashboard.component';
import { selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';
import { User } from '../../../core/models';

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
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExpertDashboardComponent,
        CommonModule
      ],
      providers: [
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    store.overrideSelector(selectUser, mockUser);

    fixture = TestBed.createComponent(ExpertDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with offline status', () => {
    expect(component.isOnline).toBeFalsy();
  });

  it('should toggle online status', () => {
    expect(component.isOnline).toBeFalsy();
    
    component.toggleOnlineStatus();
    expect(component.isOnline).toBeTruthy();
    
    component.toggleOnlineStatus();
    expect(component.isOnline).toBeFalsy();
  });

  it('should have stats defined', () => {
    expect(component.stats).toBeDefined();
    expect(component.stats.todayJobs).toBeDefined();
    expect(component.stats.thisWeekJobs).toBeDefined();
    expect(component.stats.totalEarnings).toBeDefined();
    expect(component.stats.rating).toBeDefined();
  });

  it('should initialize with empty appointments', () => {
    expect(component.appointments).toEqual([]);
  });

  it('should initialize with empty pending requests', () => {
    expect(component.pendingRequests).toEqual([]);
  });

  it('should load expert stats on init', (done) => {
    component.user$.subscribe(user => {
      if (user) {
        expect(component.stats.todayJobs).toBeGreaterThanOrEqual(0);
        expect(component.stats.rating).toBeGreaterThanOrEqual(0);
        done();
      }
    });
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

  it('should display expert name in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    
    expect(compiled.textContent).toContain('Test Expert');
  });
});
