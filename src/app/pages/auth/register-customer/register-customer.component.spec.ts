import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { RegisterCustomerComponent } from './register-customer.component';
import { registerCustomer } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';

describe('RegisterCustomerComponent', () => {
  let component: RegisterCustomerComponent;
  let fixture: ComponentFixture<RegisterCustomerComponent>;
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
        RegisterCustomerComponent,
        CommonModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    store.overrideSelector(selectAuthLoading, false);
    store.overrideSelector(selectAuthError, null);

    fixture = TestBed.createComponent(RegisterCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with all required fields', () => {
    expect(component.registrationForm.get('fullName')).toBeDefined();
    expect(component.registrationForm.get('age')).toBeDefined();
    expect(component.registrationForm.get('address')).toBeDefined();
    expect(component.registrationForm.get('phone')).toBeDefined();
    expect(component.registrationForm.get('email')).toBeDefined();
    expect(component.registrationForm.get('password')).toBeDefined();
  });

  it('should validate fullName field', () => {
    const fullNameControl = component.registrationForm.get('fullName');
    
    fullNameControl?.setValue('');
    expect(fullNameControl?.hasError('required')).toBeTruthy();
    
    fullNameControl?.setValue('A');
    expect(fullNameControl?.hasError('minlength')).toBeTruthy();
    
    fullNameControl?.setValue('John Doe');
    expect(fullNameControl?.valid).toBeTruthy();
  });

  it('should validate age field', () => {
    const ageControl = component.registrationForm.get('age');
    
    ageControl?.setValue('');
    expect(ageControl?.hasError('required')).toBeTruthy();
    
    ageControl?.setValue(17);
    expect(ageControl?.hasError('min')).toBeTruthy();
    
    ageControl?.setValue(101);
    expect(ageControl?.hasError('max')).toBeTruthy();
    
    ageControl?.setValue(25);
    expect(ageControl?.valid).toBeTruthy();
  });

  it('should validate address field', () => {
    const addressControl = component.registrationForm.get('address');
    
    addressControl?.setValue('');
    expect(addressControl?.hasError('required')).toBeTruthy();
    
    addressControl?.setValue('Short');
    expect(addressControl?.hasError('minlength')).toBeTruthy();
    
    addressControl?.setValue('123 Main Street, City');
    expect(addressControl?.valid).toBeTruthy();
  });

  it('should validate phone number with +91 prefix', () => {
    const phoneControl = component.registrationForm.get('phone');
    
    phoneControl?.setValue('9876543210');
    expect(phoneControl?.hasError('pattern')).toBeTruthy();
    
    phoneControl?.setValue('+919876543210');
    expect(phoneControl?.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.registrationForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
    
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate strong password', () => {
    const passwordControl = component.registrationForm.get('password');
    
    passwordControl?.setValue('short');
    expect(passwordControl?.hasError('minlength')).toBeTruthy();
    
    passwordControl?.setValue('weakpassword');
    expect(passwordControl?.hasError('pattern')).toBeTruthy();
    
    passwordControl?.setValue('Str0ngP@ssw0rd!');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should not submit form if invalid', () => {
    component.registrationForm.patchValue({
      fullName: '',
      age: 10,
      address: '',
      phone: 'invalid',
      email: 'invalid',
      password: 'weak'
    });

    component.onSubmit();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should dispatch registerCustomer action when form is valid', () => {
    const validData = {
      fullName: 'John Doe',
      age: 25,
      address: '123 Main Street, Bangalore',
      phone: '+919876543210',
      email: 'john@example.com',
      password: 'Str0ngP@ssw0rd!'
    };

    component.registrationForm.patchValue(validData);
    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalledWith(
      registerCustomer({ request: validData })
    );
  });

  it('should return correct error message for required field', () => {
    const fullNameControl = component.registrationForm.get('fullName');
    fullNameControl?.setValue('');
    fullNameControl?.markAsTouched();

    const errorMessage = component.getErrorMessage('fullName');
    expect(errorMessage).toContain('required');
  });

  it('should return correct error message for email validation', () => {
    const emailControl = component.registrationForm.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();

    const errorMessage = component.getErrorMessage('email');
    expect(errorMessage).toContain('valid email');
  });

  it('should return correct error message for phone pattern', () => {
    const phoneControl = component.registrationForm.get('phone');
    phoneControl?.setValue('1234567890');
    phoneControl?.markAsTouched();

    const errorMessage = component.getErrorMessage('phone');
    expect(errorMessage).toContain('+91');
  });

  it('should return correct error message for password pattern', () => {
    const passwordControl = component.registrationForm.get('password');
    passwordControl?.setValue('weak');
    passwordControl?.markAsTouched();

    const errorMessage = component.getErrorMessage('password');
    expect(errorMessage).toContain('8 characters');
  });

  it('should return correct error message for age validation', () => {
    const ageControl = component.registrationForm.get('age');
    ageControl?.setValue(17);
    ageControl?.markAsTouched();

    const errorMessage = component.getErrorMessage('age');
    expect(errorMessage).toContain('Minimum age');
  });

  it('should mark all fields as touched when submitting invalid form', () => {
    component.onSubmit();

    expect(component.registrationForm.get('fullName')?.touched).toBeTruthy();
    expect(component.registrationForm.get('age')?.touched).toBeTruthy();
    expect(component.registrationForm.get('address')?.touched).toBeTruthy();
    expect(component.registrationForm.get('phone')?.touched).toBeTruthy();
    expect(component.registrationForm.get('email')?.touched).toBeTruthy();
    expect(component.registrationForm.get('password')?.touched).toBeTruthy();
  });
});
