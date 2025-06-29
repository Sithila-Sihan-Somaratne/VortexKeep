import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap'; // <-- Import NgbModal
import { AuthModalComponent } from '../auth-modal/auth-modal.component'; // <-- Import your SignupModalComponent

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NgbModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isNavbarCollapsed = true;

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