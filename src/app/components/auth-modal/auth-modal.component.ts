// src/app/components/auth-modal/auth-modal.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors // Import ValidationErrors
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash, faCopy } from '@fortawesome/free-solid-svg-icons'; // Add faCopy icon for generate button
import { NgbActiveModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

// Custom validator for strong password requirements
function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  if (!value) {
    return null; // Let Validators.required handle empty passwords
  }

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  // Matches common special characters: !@#$%^&*()_+-=[]{};':"\|,<.>/?~
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

// Custom validator function for password mismatch
function passwordMismatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // Return null if controls are not yet initialized or values are null
  if (!password || !confirmPassword || password.value === null || confirmPassword.value === null) {
    return null;
  }

  if (password.value !== confirmPassword.value) {
    // Only set mismatch error if confirmPassword is not already invalid due to 'required'
    if (!confirmPassword.errors || !confirmPassword.errors['required']) {
      confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
    }
    return { mismatch: true };
  } else {
    // If passwords match and mismatch error was present, clear it.
    if (confirmPassword.hasError('mismatch')) {
      const errors = { ...confirmPassword.errors };
      delete errors['mismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }
}

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgbNavModule
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
  faCopy = faCopy; // Icon for the generate password button

  constructor(private fb: FormBuilder, public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    // Signup Form Initialization
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]], // Added minLength for username
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator]], // Applied strongPasswordValidator
      confirmPassword: ['', Validators.required]
    }, {
      validators: passwordMismatchValidator // Form-level validator for mismatch
    });

    // Subscriptions for real-time password mismatch validation
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

  // Method to generate a strong password
  generatePassword(): void {
    const length = 16; // A good length for strong, generated passwords
    const charset = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      digits: '0123456789',
      special: '!@#$%^&*()_+-=[]{};\':"\\|,.<>/?~' // Standard set of special characters
    };

    let password = '';
    // Ensure at least one of each required character type
    let requiredChars = [
      charset.lower[Math.floor(Math.random() * charset.lower.length)],
      charset.upper[Math.floor(Math.random() * charset.upper.length)],
      charset.digits[Math.floor(Math.random() * charset.digits.length)],
      charset.special[Math.floor(Math.random() * charset.special.length)]
    ];

    password += requiredChars.join(''); // Add the guaranteed characters

    const allChars = charset.lower + charset.upper + charset.digits + charset.special;
    // Fill the rest of the password length with random characters
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to ensure randomness of character positions
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    // Set the generated password to both password fields
    this.signupForm.get('password')?.setValue(password);
    this.signupForm.get('confirmPassword')?.setValue(password);

    // Manually mark controls as dirty/touched to trigger immediate validation UI updates
    this.signupForm.get('password')?.markAsDirty();
    this.signupForm.get('password')?.markAsTouched();
    this.signupForm.get('confirmPassword')?.markAsDirty();
    this.signupForm.get('confirmPassword')?.markAsTouched();

    // Automatically copy to clipboard
    this.copyToClipboard(password);
  }

  // Helper to copy text to clipboard
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Password copied to clipboard!');
      // You could add a temporary visual feedback here (e.g., a "Copied!" message)
    }).catch(err => {
      console.error('Failed to copy password: ', err);
      // Handle error (e.g., browser not supporting clipboard API, or permission denied)
    });
  }


  onSignupSubmit(): void {
    if (this.signupForm.valid) {
      console.log('Sign-up form submitted!', this.signupForm.value);
      // Here you would typically call your authentication service
      this.activeModal.close('Signup successful');
    } else {
      console.log('Sign-up form is invalid.');
      // Mark all controls as touched to display validation messages
      this.signupForm.markAllAsTouched();
    }
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login form submitted!', this.loginForm.value);
      // Here you would typically call your authentication service
      this.activeModal.close('Login successful');
    } else {
      console.log('Login form is invalid.');
      // Mark all controls as touched to display validation messages
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