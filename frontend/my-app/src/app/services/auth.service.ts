import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.backendUrl;

  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable();

  private _usernameSource = new BehaviorSubject<string>('Guest');
  username$: Observable<string> = this._usernameSource.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this._isLoggedIn.next(!!localStorage.getItem('jwt_token'));
      
      // <<< FIX 1: Retrieve username from localStorage on init >>>
      const storedUsername = localStorage.getItem('username'); // Make sure you use the same key
      if (storedUsername) {
        this._usernameSource.next(storedUsername);
      }
      // <<< END FIX 1 >>>
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/signup`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/login`, credentials).pipe(
      tap((response: any) => {
        console.log('--- Full Backend Login Response ---', response);

        if (response.token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('jwt_token', response.token);

            // <<< FIX 2: Save the username to localStorage during login >>>
            if (response.user && response.user.username) { // <--- CONFIRM THIS PATH WITH YOUR CONSOLE.LOG
              localStorage.setItem('username', response.user.username); // <--- Save it here!
              this._usernameSource.next(response.user.username);
            } else {
              console.warn('Login response did not contain "user.username". Displaying "Guest". Full response:', response);
              // It's good to explicitly save 'Guest' or an empty string if no username is found,
              // to prevent it from loading a stale username on next refresh.
              localStorage.setItem('username', 'Guest');
            }
            // <<< END FIX 2 >>>
          }
          this._isLoggedIn.next(true);
          console.log('Login successful!', response.message);
        }
      }),
      catchError(error => {
        console.error('Login failed:', error);
        this._isLoggedIn.next(false);
        this._usernameSource.next('Guest');
        // <<< FIX 3: Also clear username from localStorage on login failure, if it exists >>>
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('username');
        }
        // <<< END FIX 3 >>>
        throw error;
      })
    );
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      return !!token;
    }
    return false;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }

  getProtectedData(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return new Observable(observer => {
        observer.error({ status: 401, message: 'No authentication token found.' });
        observer.complete();
      });
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/protected/profile`, { headers });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
      // <<< FIX 4: Clear username from localStorage on logout >>>
      localStorage.removeItem('username'); // <--- Uncomment this!
      this._usernameSource.next('Guest');
    }
    this._isLoggedIn.next(false);
    this.router.navigate(['/']);
    console.log('User logged out.');
  }
}