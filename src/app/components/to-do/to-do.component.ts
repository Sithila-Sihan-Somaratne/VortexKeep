// src/app/components/to-do/to-do.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Ensure RouterLink is imported if used
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Keep if you use FA icons here
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // <-- Import NgbModal
import { AuthModalComponent } from '../auth-modal/auth-modal.component'; // <-- Import your SignupModalComponent

@Component({
  selector: 'app-to-do',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FontAwesomeModule // Keep if you use FA icons here
  ],
  templateUrl: './to-do.component.html',
  styleUrls: ['./to-do.component.css']
})
export class ToDoComponent {
  // Inject the NgbModal service
  constructor(private modalService: NgbModal) {}

  // Method to open the signup modal
  openAuthModal(initialTab: 'login' | 'signup') { 
    const modalRef = this.modalService.open(AuthModalComponent, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.activeTab = initialTab;

    modalRef.result.then((result) => {
      console.log('Modal closed with:', result);
    }, (reason) => {
      console.log('Modal dismissed with:', reason);
    });
  }
}