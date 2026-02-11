import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { LoginComponent } from './login.component';
import { login } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;

  const initialState = {
    auth: {
      user: null,
      token: null,
      loading: false,
      error: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        CommonModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'role' ? 'customer' : null
              }
            }
          }
        }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    store.overrideSelector(selectAuthLoading, false);
    store.overrideSelector(selectAuthError, null);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('phone')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should set userRole to ROLE_CUSTOMER for customer route', () => {
    expect(component.userRole).toBe('ROLE_CUSTOMER');
  });

  it('should set userRole to ROLE_EXPERT for expert route', () => {
    const expertRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => key === 'role' ? 'expert' : null
        }
      }
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: ActivatedRoute, useValue: expertRoute }
      ]
    });

    const expertFixture = TestBed.createComponent(LoginComponent);
    const expertComponent = expertFixture.componentInstance;
    expertFixture.detectChanges();

    expect(expertComponent.userRole).toBe('ROLE_EXPERT');
  });

  it('should validate phone number format', () => {
    const phoneControl = component.loginForm.get('phone');
    
    phoneControl?.setValue('1234567890');
    expect(phoneControl?.hasError('pattern')).toBeTruthy();
    
    phoneControl?.setValue('+919876543210');
    expect(phoneControl?.valid).toBeTruthy();
  });

  it('should validate password length', () => {
    const passwordControl = component.loginForm.get('password');
    
    passwordControl?.setValue('short');
    expect(passwordControl?.hasError('minlength')).toBeTruthy();
    
    passwordControl?.setValue('longenoughpassword');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should not submit form if invalid', () => {
    component.loginForm.patchValue({
      phone: 'invalid',
      password: 'short'
    });

    component.onSubmit();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should dispatch login action when form is valid', () => {
    component.loginForm.patchValue({
      phone: '+919876543210',
      password: 'Str0ngP@ssw0rd!'
    });

    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalledWith(
      login({
        request: {
          phone: '+919876543210',
          password: 'Str0ngP@ssw0rd!',
          role: 'ROLE_CUSTOMER'
        }
      })
    );
  });

  it('should mark fields as touched when submitting invalid form', () => {
    component.loginForm.patchValue({
      phone: '',
      password: ''
    });

    component.onSubmit();

    expect(component.loginForm.get('phone')?.touched).toBeTruthy();
    expect(component.loginForm.get('password')?.touched).toBeTruthy();
  });

  it('should return correct register link for customer', () => {
    component.userRole = 'ROLE_CUSTOMER';
    expect(component.getRegisterLink()).toBe('/register/customer');
  });

  it('should return correct register link for expert', () => {
    component.userRole = 'ROLE_EXPERT';
    expect(component.getRegisterLink()).toBe('/register/expert');
  });

  it('should return correct login title for customer', () => {
    component.userRole = 'ROLE_CUSTOMER';
    expect(component.getLoginTitle()).toBe('Customer Login');
  });

  it('should return correct login title for expert', () => {
    component.userRole = 'ROLE_EXPERT';
    expect(component.getLoginTitle()).toBe('Expert Login');
  });

  it('should display loading state', () => {
    store.overrideSelector(selectAuthLoading, true);
    store.refreshState();
    fixture.detectChanges();

    component.loading$.subscribe(loading => {
      expect(loading).toBeTruthy();
    });
  });

  it('should display error message', () => {
    const errorMessage = 'Invalid credentials';
    store.overrideSelector(selectAuthError, errorMessage);
    store.refreshState();
    fixture.detectChanges();

    component.error$.subscribe(error => {
      expect(error).toBe(errorMessage);
    });
  });
});
