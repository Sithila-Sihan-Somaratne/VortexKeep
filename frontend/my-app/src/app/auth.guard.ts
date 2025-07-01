import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service'; // Adjust path if your auth.service is elsewhere

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isAuthenticated()) {
      return true; // User is authenticated, allow access to the route
    } else {
      // User is NOT authenticated, redirect them to the home/login page
      this.router.navigate(['/']); // Redirect to the home page (you can change this to '/login' if you have a dedicated login page)
      return false; // Prevent access to the route
    }
  }
}