// src/app/components/to-do/to-do.component.ts
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // <-- Import NgbModal
import { AuthModalComponent } from '../auth-modal/auth-modal.component'; // <-- Import your SignupModalComponent
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-to-do',
  standalone: true,
  imports: [
    SharedModule
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