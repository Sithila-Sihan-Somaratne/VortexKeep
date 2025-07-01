import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'; // <<< Add NgbCollapseModule, NgbDropdownModule
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

// Import SharedModule (ensure it exports CommonModule, RouterLink, RouterLinkActive if you rely on it)
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    SharedModule, // SharedModule likely provides CommonModule, RouterLink, RouterLinkActive
    NgbCollapseModule, // <<< Add this
    NgbDropdownModule // <<< Add this
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isNavbarCollapsed = true;
  isLoggedIn$!: Observable<boolean>;

  constructor(
    private modalService: NgbModal,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  openAuthModal(mode: 'login' | 'signup') {
    const modalRef = this.modalService.open(AuthModalComponent, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.activeTab = mode;

    modalRef.result.then((result) => {
      console.log('Modal closed with:', result);
    }, (reason) => {
      console.log('Modal dismissed with:', reason);
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']); // Assuming AuthService doesn't handle navigation on its own, or you want to explicitly override
  }
}