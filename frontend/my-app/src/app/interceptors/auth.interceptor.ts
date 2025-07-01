import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Import your AuthService

@Injectable() // Mark the class as an injectable service
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {} // Inject AuthService to get the token

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken(); // Get the token from AuthService

    // If a token exists, clone the request and add the Authorization header
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // Set the Authorization header
        }
      });
    }

    // Pass the (modified or original) request to the next handler in the chain
    return next.handle(request);
  }
}