import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { TaskListComponent } from '../task-list/task-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, TaskListComponent], // Add CommonModule if you need *ngIf etc.
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // REMOVE all properties related to protected data fetching:
  // protectedData: any = null;
  // errorMessage: string | null = null;
  // isLoading = true;

  // REMOVE HttpClient and AuthService from constructor if they are ONLY used for protectedData
  constructor(
    // private http: HttpClient, // REMOVE THIS LINE
    // private authService: AuthService // REMOVE THIS LINE
  ) { }

  ngOnInit(): void {
    // REMOVE THIS LINE:
    // this.fetchProtectedData();
  }

  // REMOVE THE ENTIRE METHOD BELOW:
  // fetchProtectedData(): void {
  //   this.isLoading = true;
  //   this.errorMessage = null;
  //   this.http.get(`${environment.backendUrl}/protected/profile`)
  //     .subscribe({
  //       next: (response) => {
  //         this.protectedData = response;
  //         this.isLoading = false;
  //       },
  //       error: (error) => {
  //         console.error('Error fetching protected data:', error);
  //         this.errorMessage = 'Failed to load protected data. Please try again.';
  //         if (error.status === 401 || error.status === 403) {
  //           this.errorMessage = 'Session expired or unauthorized access. Please log in again.';
  //         }
  //         this.isLoading = false;
  //       }
  //     });
  // }
}