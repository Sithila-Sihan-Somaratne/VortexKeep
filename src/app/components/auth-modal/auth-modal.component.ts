// src/app/components/auth-modal/auth-modal.component.ts
import { Component, OnInit, Input } from '@angular/core'; // <-- Add Input
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap'; // <-- Import NgbNavModule

// Custom validator function for password mismatch
function passwordMismatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword || password.value === null || confirmPassword.value === null) {
    return null;
  }

  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
    return { mismatch: true };
  } else {
    if (confirmPassword.hasError('mismatch')) {
      const errors = { ...confirmPassword.errors };
      delete errors['mismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }
}

@Component({
  selector: 'app-auth-modal', // <-- Renamed selector
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgbNavModule // <-- Add NgbNavModule for tab functionality
  ],
  templateUrl: './auth-modal.component.html', // <-- Updated template URL
  styleUrl: './auth-modal.component.css' // <-- Updated style URL
})
export class AuthModalComponent implements OnInit { // <-- Renamed class
  @Input() activeTab: 'login' | 'signup' = 'signup'; // Input to control initial tab

  signupForm!: FormGroup;
  loginForm!: FormGroup; // <-- New: Login Form Group
  passwordVisible = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  constructor(private fb: FormBuilder, public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    // Signup Form Initialization
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.min(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: passwordMismatchValidator
    });

    this.signupForm.get('password')?.valueChanges.subscribe(() => {
        this.signupForm.get('confirmPassword')?.updateValueAndValidity({ emitEvent: false });
    });
    this.signupForm.get('confirmPassword')?.valueChanges.subscribe(() => {
        this.signupForm.get('password')?.updateValueAndValidity({ emitEvent: false });
    });

    // Login Form Initialization
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSignupSubmit(): void { // <-- Renamed for clarity
    if (this.signupForm.valid) {
      console.log('Sign-up form submitted!', this.signupForm.value);
      // Call your backend signup service here
      this.activeModal.close('Signup successful');
    } else {
      console.log('Sign-up form is invalid.');
      this.signupForm.markAllAsTouched();
    }
  }

  onLoginSubmit(): void { // <-- New: Login Submit Method
    if (this.loginForm.valid) {
      console.log('Login form submitted!', this.loginForm.value);
      // Call your backend login service here
      this.activeModal.close('Login successful');
    } else {
      console.log('Login form is invalid.');
      this.loginForm.markAllAsTouched();
    }
  }

  // Method to programmatically switch tabs
  selectTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
  }

  closeModal(): void {
    this.activeModal.dismiss('User dismissed');
  }
}