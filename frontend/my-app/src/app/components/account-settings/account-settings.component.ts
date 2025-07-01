import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Adjust path if necessary
import { HttpErrorResponse } from '@angular/common/http'; // For error handling
import { SharedModule } from '../../shared/shared.module'; // <<< IMPORTANT: Import SharedModule

@Component({
  selector: 'app-account-settings',
  standalone: true, // Keep it standalone
  imports: [
    SharedModule // <<< IMPORTANT: Use SharedModule here for CommonModule, etc.
  ],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.css'
})
export class AccountSettingsComponent implements OnInit {
  protectedData: any = {}; // Initialize to an empty object
  errorMessage: string = '';
  isLoading: boolean = true; // Add loading state

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.fetchProtectedData();
  }

  fetchProtectedData(): void {
    this.isLoading = true; // Set loading to true
    this.errorMessage = ''; // Clear previous errors

    // Call AuthService to get protected data
    this.authService.getProtectedData().subscribe({
      next: (data) => {
        this.protectedData = data;
        this.isLoading = false; // Loading complete
        console.log('Protected Data Received in Account Settings:', data);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching protected data for account settings:', error);
        this.errorMessage = 'Failed to load account data. Please try again.';
        this.isLoading = false; // Loading complete
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'You are not authorized to view this content. Please log in again.';
          // Optionally redirect to login or show login modal
        }
      }
    });
  }
}