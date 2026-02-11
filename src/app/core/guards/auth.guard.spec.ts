import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { authGuard, customerGuard, expertGuard } from './auth.guard';
import { selectIsAuthenticated, selectIsCustomer } from '../../store/auth/auth.selectors';
import { of } from 'rxjs';

describe('Auth Guards', () => {
  let store: MockStore;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    });

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('authGuard', () => {
    it('should allow access if authenticated', (done) => {
      store.overrideSelector(selectIsAuthenticated, true);
      
      TestBed.runInInjectionContext(() => {
        const result = authGuard({} as any, {} as any);
        
        if (result instanceof Promise) {
          result.then(canActivate => {
            expect(canActivate).toBeTruthy();
            done();
          });
        } else if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe(canActivate => {
            expect(canActivate).toBeTruthy();
            done();
          });
        }
      });
    });

    it('should redirect to home if not authenticated', (done) => {
      store.overrideSelector(selectIsAuthenticated, false);
      
      TestBed.runInInjectionContext(() => {
        const result = authGuard({} as any, {} as any);
        
        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe(canActivate => {
            expect(canActivate).toBeFalsy();
            expect(router.navigate).toHaveBeenCalledWith(['/']);
            done();
          });
        }
      });
    });
  });

  describe('customerGuard', () => {
    it('should allow access if user is customer', (done) => {
      store.overrideSelector(selectIsCustomer, true);
      
      TestBed.runInInjectionContext(() => {
        const result = customerGuard({} as any, {} as any);
        
        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe(canActivate => {
            expect(canActivate).toBeTruthy();
            done();
          });
        }
      });
    });

    it('should redirect if user is not customer', (done) => {
      store.overrideSelector(selectIsCustomer, false);
      
      TestBed.runInInjectionContext(() => {
        const result = customerGuard({} as any, {} as any);
        
        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe(canActivate => {
            expect(canActivate).toBeFalsy();
            expect(router.navigate).toHaveBeenCalledWith(['/']);
            done();
          });
        }
      });
    });
  });

  describe('expertGuard', () => {
    it('should allow access if user is authenticated expert', (done) => {
      store.overrideSelector(selectIsAuthenticated, true);
      
      // Mock JWT token for expert
      const expertToken = 'header.' + btoa(JSON.stringify({ 
        id: '1', 
        role: 'ROLE_EXPERT', 
        phone: '+919876543211' 
      })) + '.signature';
      localStorage.setItem('token', expertToken);
      
      TestBed.runInInjectionContext(() => {
        const result = expertGuard({} as any, {} as any);
        
        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe(canActivate => {
            expect(canActivate).toBeTruthy();
            done();
          });
        }
      });
    });

    it('should redirect if user is not expert', (done) => {
      store.overrideSelector(selectIsAuthenticated, true);
      
      // Mock JWT token for customer (not expert)
      const customerToken = 'header.' + btoa(JSON.stringify({ 
        id: '1', 
        role: 'ROLE_CUSTOMER', 
        phone: '+919876543210' 
      })) + '.signature';
      localStorage.setItem('token', customerToken);
      
      TestBed.runInInjectionContext(() => {
        const result = expertGuard({} as any, {} as any);
        
        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe(canActivate => {
            expect(canActivate).toBeFalsy();
            expect(router.navigate).toHaveBeenCalledWith(['/']);
            done();
          });
        }
      });
    });

    it('should redirect if not authenticated', (done) => {
      store.overrideSelector(selectIsAuthenticated, false);
      
      TestBed.runInInjectionContext(() => {
        const result = expertGuard({} as any, {} as any);
        
        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe(canActivate => {
            expect(canActivate).toBeFalsy();
            expect(router.navigate).toHaveBeenCalledWith(['/']);
            done();
          });
        }
      });
    });
  });
});
