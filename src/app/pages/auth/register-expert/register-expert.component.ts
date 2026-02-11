import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { registerExpert } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';

interface Service {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-register-expert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-expert.component.html',
  styleUrls: ['./register-expert.component.css']
})
export class RegisterExpertComponent implements OnInit {
  currentStep = 1;
  personalInfoForm!: FormGroup;
  serviceProfileForm!: FormGroup;
  idVerificationForm!: FormGroup;
  
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  // Services
  availableServices: Service[] = [
    { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
    { id: 'cooking', name: 'Cooking', icon: '👨‍🍳' },
    { id: 'gardening', name: 'Gardening', icon: '🌿' }
  ];
  selectedServices: string[] = [];

  // Languages
  availableLanguages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi', 'Urdu', 'Odia'];
  selectedLanguages: string[] = [];

  // Education levels
  availableEducationLevels = ['Below 10th', '10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Diploma/Certificate Course'];
  selectedEducationLevels: string[] = [];

  // Availability options
  availabilityOptions = ['Full-time\nAvailable 8-9 hours per day', 'Part-time\nAvailable 4-5 hours per day', 'Flexible\nAvailable as needed'];
  selectedAvailability = '';

  // ID Proof types
  idProofTypes = ['Aadhar Card', 'PAN Card', 'Driving License', 'Voter ID', 'Passport'];

  // File upload
  selectedFile: File | null = null;
  selectedFileName = '';

  // Years and Months for experience
  years = Array.from({ length: 51 }, (_, i) => i);
  months = Array.from({ length: 12 }, (_, i) => i);

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {
    // Step 1: Personal Information
    this.personalInfoForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
        ]
      ],
      dateOfBirth: ['', [Validators.required]],
      completeAddress: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      pinCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

    // Step 2: Service Profile
    this.serviceProfileForm = this.fb.group({
      experienceYears: ['', [Validators.required]],
      experienceMonths: ['', [Validators.required]],
      specializations: [''],
      expectedHourlyRate: ['', [Validators.required, Validators.min(1)]],
      aboutYourself: ['']
    });

    // Step 3: ID Verification
    this.idVerificationForm = this.fb.group({
      idProofType: ['Aadhar Card', [Validators.required]],
      idNumber: ['', [Validators.required, Validators.minLength(4)]],
      photograph: ['', [Validators.required]]
    });
  }

  // Service selection
  toggleService(serviceId: string): void {
    const index = this.selectedServices.indexOf(serviceId);
    if (index > -1) {
      this.selectedServices.splice(index, 1);
    } else {
      this.selectedServices.push(serviceId);
    }
  }

  isServiceSelected(serviceId: string): boolean {
    return this.selectedServices.includes(serviceId);
  }

  // Language selection
  toggleLanguage(language: string): void {
    const index = this.selectedLanguages.indexOf(language);
    if (index > -1) {
      this.selectedLanguages.splice(index, 1);
    } else {
      this.selectedLanguages.push(language);
    }
  }

  isLanguageSelected(language: string): boolean {
    return this.selectedLanguages.includes(language);
  }

  // Education level selection
  toggleEducationLevel(level: string): void {
    const index = this.selectedEducationLevels.indexOf(level);
    if (index > -1) {
      this.selectedEducationLevels.splice(index, 1);
    } else {
      this.selectedEducationLevels.push(level);
    }
  }

  isEducationLevelSelected(level: string): boolean {
    return this.selectedEducationLevels.includes(level);
  }

  // Availability selection
  selectAvailability(option: string): void {
    this.selectedAvailability = option;
  }

  isAvailabilitySelected(option: string): boolean {
    return this.selectedAvailability === option;
  }

  // File handling
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Please upload only JPG or PNG files');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.idVerificationForm.patchValue({ photograph: file.name });
    }
  }

  // Step navigation
  nextStep(): void {
    if (this.currentStep === 1 && this.validateStep1()) {
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.validateStep2()) {
      this.currentStep = 3;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateStep1(): boolean {
    if (this.personalInfoForm.invalid) {
      this.markFormGroupTouched(this.personalInfoForm);
      return false;
    }
    return true;
  }

  validateStep2(): boolean {
    if (this.serviceProfileForm.invalid || this.selectedServices.length === 0 || 
        this.selectedLanguages.length === 0 || this.selectedEducationLevels.length === 0 || 
        !this.selectedAvailability) {
      this.markFormGroupTouched(this.serviceProfileForm);
      return false;
    }
    return true;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onSubmit(): void {
    if (this.idVerificationForm.invalid) {
      this.markFormGroupTouched(this.idVerificationForm);
      return;
    }

    const formData = {
      ...this.personalInfoForm.value,
      ...this.serviceProfileForm.value,
      ...this.idVerificationForm.value,
      services: this.selectedServices,
      languages: this.selectedLanguages,
      educationLevels: this.selectedEducationLevels,
      availability: this.selectedAvailability,
      phone: '+91' + this.personalInfoForm.value.mobileNumber,
      skills: this.selectedServices,
      zoneIds: ['zone-blr-central'],
      email: `expert${Date.now()}@housemate.com`, // Temporary email
      password: this.personalInfoForm.value.password,
      hourlyRate: this.serviceProfileForm.value.expectedHourlyRate // Save hourly rate
    };

    this.store.dispatch(registerExpert({ request: formData }));
  }

  backToHome(): void {
    this.router.navigate(['/']);
  }

  getErrorMessage(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);
    if (control?.hasError('required')) {
      return `This field is required`;
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} characters required`;
    }
    if (control?.hasError('pattern')) {
      if (fieldName === 'mobileNumber') {
        return 'Please enter a valid 10-digit mobile number';
      }
      if (fieldName === 'pinCode') {
        return 'Please enter a valid 6-digit PIN code';
      }
      if (fieldName === 'password') {
        return 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
      }
    }
    if (control?.hasError('min')) {
      return 'Please enter a valid amount';
    }
    return '';
  }
}