// frontend/MyApp/src/app/components/auth-modal/auth-modal.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash, faCopy } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service'; // Adjust path if you placed it elsewhere
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

// --- Custom Validators (keep these as they are) ---
function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(value);
  const isLongEnough = value.length >= 8;

  const errors: { [key: string]: boolean } = {};
  if (!hasUpperCase) errors['hasUpperCase'] = true;
  if (!hasLowerCase) errors['hasLowerCase'] = true;
  if (!hasNumeric) errors['hasNumeric'] = true;
  if (!hasSpecialChar) errors['hasSpecialChar'] = true;
  if (!isLongEnough) errors['isLongEnough'] = true;

  return Object.keys(errors).length ? { strongPassword: errors } : null;
}

function passwordMismatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword || password.value === null || confirmPassword.value === null) {
    return null;
  }

  if (password.value !== confirmPassword.value) {
    if (!confirmPassword.errors || !confirmPassword.errors['required']) {
      confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
    }
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
// --- End Custom Validators ---

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css'
})
export class AuthModalComponent implements OnInit {
  @Input() activeTab: 'login' | 'signup' = 'signup';

  signupForm!: FormGroup;
  loginForm!: FormGroup;
  passwordVisible = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faCopy = faCopy;

  loginError: string | null = null; // To display backend login errors
  signupError: string | null = null; // To display backend signup errors

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private authService: AuthService, // Injected AuthService
    private router: Router // Injected Router
  ) {
    // --- Signup Form Initialization (keep this as is) ---
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator]],
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

    // --- Login Form Initialization (keep this as is) ---
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if the user is already authenticated when the modal opens
    if (this.authService.isAuthenticated()) {
      // If authenticated, close the modal and redirect them (e.g., to a dashboard)
      this.activeModal.close('Already logged in');
      this.router.navigate(['/dashboard']); // IMPORTANT: Adjust '/dashboard' to your actual authenticated route
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  generatePassword(): void {
    const length = 16;
    const charset = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      digits: '0123456789',
      special: '!@#$%^&*()_+-=[]{};\':"\\|,.<>\/?~'
    };

    let password = '';
    let requiredChars = [
      charset.lower[Math.floor(Math.random() * charset.lower.length)],
      charset.upper[Math.floor(Math.random() * charset.upper.length)],
      charset.digits[Math.floor(Math.random() * charset.digits.length)],
      charset.special[Math.floor(Math.random() * charset.special.length)]
    ];

    password += requiredChars.join('');

    const allChars = charset.lower + charset.upper + charset.digits + charset.special;
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    this.signupForm.get('password')?.setValue(password);
    this.signupForm.get('confirmPassword')?.setValue(password);

    this.signupForm.get('password')?.markAsDirty();
    this.signupForm.get('password')?.markAsTouched();
    this.signupForm.get('confirmPassword')?.markAsDirty();
    this.signupForm.get('confirmPassword')?.markAsTouched();

    this.copyToClipboard(password);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Password copied to clipboard!');
      // Optional: Add a temporary visual feedback here (e.g., a "Copied!" message)
    }).catch(err => {
      console.error('Failed to copy password: ', err);
    });
  }

  // --- IMPORTANT: Updated Signup Submission Logic ---
  onSignupSubmit(): void {
    this.signupError = null; // Clear any previous errors
    if (this.signupForm.valid) {
      const { username, email, password } = this.signupForm.value;
      this.authService.register({ username, email, password }).subscribe({
        next: (response) => {
          console.log('Sign-up successful!', response.message);
          this.activeModal.close('Signup successful'); // Close the modal on success
          this.router.navigate(['/dashboard']); // Redirect to your authenticated route
        },
        error: (err) => {
          console.error('Sign-up failed:', err);
          // Display error message from the backend, or a generic one
          this.signupError = err.error?.message || 'An unknown error occurred during signup. Please try again.';
          // Mark all controls as touched to ensure validation messages are shown
          this.signupForm.markAllAsTouched();
        }
      });
    } else {
      console.log('Sign-up form is invalid. Showing validation errors.');
      this.signupForm.markAllAsTouched(); // Trigger display of all validation errors
      this.signupError = 'Please correct the highlighted errors in the form.';
    }
  }

  // --- IMPORTANT: Updated Login Submission Logic ---
  onLoginSubmit(): void {
    this.loginError = null; // Clear any previous errors
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login({ email, password }).subscribe({
        next: (response) => {
          console.log('Login successful!', response.message);
          this.activeModal.close('Login successful'); // Close the modal on success
          this.router.navigate(['/dashboard']); // Redirect to your authenticated route
        },
        error: (err) => {
          console.error('Login failed:', err);
          // Display error message from the backend, or a generic one
          this.loginError = err.error?.message || 'Invalid credentials. Please try again.';
          // Mark all controls as touched to ensure validation messages are shown
          this.loginForm.markAllAsTouched();
        }
      });
    } else {
      console.log('Login form is invalid. Showing validation errors.');
      this.loginForm.markAllAsTouched(); // Trigger display of all validation errors
      this.loginError = 'Please enter your email and password.';
    }
  }

  // Method to programmatically switch tabs
  selectTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
    // Reset forms and clear any previous errors/messages when switching tabs
    this.loginForm.reset();
    this.signupForm.reset();
    this.loginError = null;
    this.signupError = null;
    this.passwordVisible = false; // Reset password visibility for new tab
  }

  closeModal(): void {
    this.activeModal.dismiss('User dismissed');
  }
}