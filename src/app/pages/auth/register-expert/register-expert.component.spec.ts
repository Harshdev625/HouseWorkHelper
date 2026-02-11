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
      imports: [
        RegisterExpertComponent,
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

    fixture = TestBed.createComponent(RegisterExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with available skills', () => {
    expect(component.availableSkills).toBeDefined();
    expect(component.availableSkills.length).toBeGreaterThan(0);
    expect(component.availableSkills).toContain('Cleaning');
  });

  it('should toggle skill selection', () => {
    expect(component.selectedSkills).toEqual([]);
    
    component.toggleSkill('Cleaning');
    expect(component.selectedSkills).toContain('Cleaning');
    
    component.toggleSkill('Cleaning');
    expect(component.selectedSkills).not.toContain('Cleaning');
  });

  it('should check if skill is selected', () => {
    component.selectedSkills = ['Cleaning', 'Plumbing'];
    
    expect(component.isSkillSelected('Cleaning')).toBeTruthy();
    expect(component.isSkillSelected('Cooking')).toBeFalsy();
  });

  it('should validate form fields', () => {
    const form = component.registrationForm;
    
    expect(form.get('fullName')?.valid).toBeFalsy();
    expect(form.get('phone')?.valid).toBeFalsy();
    expect(form.get('email')?.valid).toBeFalsy();
    expect(form.get('password')?.valid).toBeFalsy();
    
    form.patchValue({
      fullName: 'Expert Name',
      phone: '+919876543210',
      email: 'expert@example.com',
      password: 'Str0ngP@ssw0rd!'
    });
    
    expect(form.valid).toBeTruthy();
  });

  it('should not submit if no skills selected', () => {
    component.registrationForm.patchValue({
      fullName: 'Expert Name',
      phone: '+919876543210',
      email: 'expert@example.com',
      password: 'Str0ngP@ssw0rd!'
    });
    component.selectedSkills = [];

    component.onSubmit();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should dispatch registerExpert action with skills', () => {
    component.registrationForm.patchValue({
      fullName: 'Expert Name',
      phone: '+919876543210',
      email: 'expert@example.com',
      password: 'Str0ngP@ssw0rd!'
    });
    component.selectedSkills = ['Cleaning', 'Plumbing'];

    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalledWith(
      registerExpert({
        request: jasmine.objectContaining({
          fullName: 'Expert Name',
          phone: '+919876543210',
          email: 'expert@example.com',
          password: 'Str0ngP@ssw0rd!',
          skills: ['Cleaning', 'Plumbing']
        }) as any
      })
    );
  });

  it('should include default zone in registration', () => {
    component.registrationForm.patchValue({
      fullName: 'Expert Name',
      phone: '+919876543210',
      email: 'expert@example.com',
      password: 'Str0ngP@ssw0rd!'
    });
    component.selectedSkills = ['Cleaning'];

    component.onSubmit();

    const dispatchCall = dispatchSpy.calls.mostRecent();
    const request = dispatchCall.args[0].request;
    expect(request.zoneIds).toBeDefined();
    expect(request.zoneIds.length).toBeGreaterThan(0);
  });

  it('should validate phone number format', () => {
    const phoneControl = component.registrationForm.get('phone');
    
    phoneControl?.setValue('9876543210');
    expect(phoneControl?.hasError('pattern')).toBeTruthy();
    
    phoneControl?.setValue('+919876543210');
    expect(phoneControl?.valid).toBeTruthy();
  });

  it('should validate strong password', () => {
    const passwordControl = component.registrationForm.get('password');
    
    passwordControl?.setValue('weak');
    expect(passwordControl?.invalid).toBeTruthy();
    
    passwordControl?.setValue('Str0ngP@ssw0rd!');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should return correct error messages', () => {
    const phoneControl = component.registrationForm.get('phone');
    phoneControl?.setValue('invalid');
    phoneControl?.markAsTouched();

    const errorMessage = component.getErrorMessage('phone');
    expect(errorMessage).toContain('+91');
  });
});
