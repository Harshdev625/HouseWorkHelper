import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { RegisterExpertComponent } from './register-expert.component';
import { registerExpert } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';

describe('RegisterExpertComponent', () => {
  let component: RegisterExpertComponent;
  let fixture: ComponentFixture<RegisterExpertComponent>;
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
      imports: [RegisterExpertComponent, CommonModule, ReactiveFormsModule, RouterTestingModule],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    store.overrideSelector(selectAuthLoading, false);
    store.overrideSelector(selectAuthError, null);

    fixture = TestBed.createComponent(RegisterExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on step 1', () => {
    expect(component.currentStep).toBe(1);
  });

  it('should not advance to step 2 when step 1 is invalid', () => {
    component.nextStep();
    expect(component.currentStep).toBe(1);
  });

  it('should advance to step 2 when step 1 is valid', () => {
    component.personalInfoForm.patchValue({
      fullName: 'John Doe',
      mobileNumber: '9876543210',
      dateOfBirth: '1995-01-01',
      completeAddress: 'Flat 1, Some Building, Some Street',
      city: 'Pune',
      state: 'Maharashtra',
      pinCode: '411001'
    });

    component.nextStep();
    expect(component.currentStep).toBe(2);
  });

  it('should require selections in step 2 before advancing', () => {
    component.personalInfoForm.patchValue({
      fullName: 'John Doe',
      mobileNumber: '9876543210',
      dateOfBirth: '1995-01-01',
      completeAddress: 'Flat 1, Some Building, Some Street',
      city: 'Pune',
      state: 'Maharashtra',
      pinCode: '411001'
    });
    component.nextStep();

    component.serviceProfileForm.patchValue({
      experienceYears: 2,
      experienceMonths: 3,
      expectedHourlyRate: 150
    });

    component.nextStep();
    expect(component.currentStep).toBe(2);

    component.toggleService('cleaning');
    component.toggleLanguage('English');
    component.toggleEducationLevel('10th Pass');
    component.selectAvailability(component.availabilityOptions[0]);

    component.nextStep();
    expect(component.currentStep).toBe(3);
  });

  it('should not submit when step 3 is invalid', () => {
    component.onSubmit();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should dispatch registerExpert on valid submit', () => {
    component.personalInfoForm.patchValue({
      fullName: 'John Doe',
      mobileNumber: '9876543210',
      dateOfBirth: '1995-01-01',
      completeAddress: 'Flat 1, Some Building, Some Street',
      city: 'Pune',
      state: 'Maharashtra',
      pinCode: '411001'
    });
    component.serviceProfileForm.patchValue({
      experienceYears: 2,
      experienceMonths: 3,
      expectedHourlyRate: 150
    });
    component.idVerificationForm.patchValue({
      idProofType: 'Aadhar Card',
      idNumber: '56721-234-5566',
      photograph: 'photo.png'
    });

    component.selectedServices = ['cleaning'];
    component.selectedLanguages = ['English'];
    component.selectedEducationLevels = ['10th Pass'];
    component.selectedAvailability = component.availabilityOptions[0];

    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalled();
    expect(dispatchSpy.calls.mostRecent().args[0]).toEqual(
      registerExpert({
        request: jasmine.objectContaining({
          fullName: 'John Doe',
          phone: '+919876543210',
          services: ['cleaning'],
          languages: ['English'],
          educationLevels: ['10th Pass'],
          availability: component.availabilityOptions[0],
          idProofType: 'Aadhar Card',
          idNumber: '56721-234-5566',
          photograph: 'photo.png',
          zoneIds: jasmine.any(Array)
        }) as any
      })
    );
  });

  it('should return error message for invalid mobileNumber', () => {
    const control = component.personalInfoForm.get('mobileNumber');
    control?.setValue('invalid');
    control?.markAsTouched();

    const message = component.getErrorMessage(component.personalInfoForm, 'mobileNumber');
    expect(message).toContain('10-digit');
  });
});
