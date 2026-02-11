import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { registerExpert } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-register-expert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-expert.component.html',
  styleUrls: ['./register-expert.component.css']
})
export class RegisterExpertComponent implements OnInit {
  registrationForm!: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  availableSkills = ['Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Gardening', 'Cooking'];
  selectedSkills: string[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
      ]]
    });
  }

  toggleSkill(skill: string): void {
    const index = this.selectedSkills.indexOf(skill);
    if (index > -1) {
      this.selectedSkills.splice(index, 1);
    } else {
      this.selectedSkills.push(skill);
    }
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedSkills.includes(skill);
  }

  onSubmit(): void {
    if (this.registrationForm.valid && this.selectedSkills.length > 0) {
      const formData = {
        ...this.registrationForm.value,
        skills: this.selectedSkills,
        zoneIds: ['a3c62d2c-1d4b-4a26-9d0c-b6c1a7a7a111'] // Default zone
      };
      this.store.dispatch(registerExpert({ request: formData }));
    } else {
      Object.keys(this.registrationForm.controls).forEach(key => {
        const control = this.registrationForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registrationForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('pattern')) {
      if (fieldName === 'phone') {
        return 'Please enter a valid 10-digit phone number';
      }
      if (fieldName === 'password') {
        return 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
      }
    }
    return '';
  }
}