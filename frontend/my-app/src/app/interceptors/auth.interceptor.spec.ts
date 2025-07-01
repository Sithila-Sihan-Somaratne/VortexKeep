// frontend/MyApp/src/app/interceptors/auth.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthInterceptor, // Provide the interceptor itself
        {
          provide: HTTP_INTERCEPTORS, // Register it as an HTTP interceptor
          useClass: AuthInterceptor,
          multi: true,
        },
        // Provide a mock or the actual AuthService
        // For testing the interceptor, a mock is often sufficient
        {
          provide: AuthService,
          useValue: {
            getToken: jasmine.createSpy('getToken').and.returnValue('mock-jwt-token'),
            // You might need to mock other methods if your interceptor relies on them
            // e.g., if you had an ErrorInterceptor using logout()
            // logout: jasmine.createSpy('logout'),
            // This needs to match environment.backendUrl used in interceptor for testing
            apiUrl: environment.backendUrl
          },
        },
      ],
    });

    interceptor = TestBed.inject(AuthInterceptor);
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient); // Inject HttpClient to make requests
  });

  afterEach(() => {
    // After every test, assert that no more requests are pending.
    httpMock.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add an Authorization header if a token exists and it is an API request', () => {
    const testUrl = `${environment.backendUrl}/api/test`;

    httpClient.get(testUrl).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.headers.has('Authorization')).toBeTruthy();
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token');
    req.flush({}); // Respond to the request
  });

  it('should NOT add an Authorization header if no token exists', () => {
    (authService.getToken as jasmine.Spy).and.returnValue(null); // Mock getToken to return null
    const testUrl = `${environment.backendUrl}/api/test`;

    httpClient.get(testUrl).subscribe();

    const req = httpMock.expectOne(testUrl);
    expect(req.request.headers.has('Authorization')).toBeFalsy();
    req.flush({});
  });

  it('should NOT add an Authorization header for non-API requests', () => {
    const nonApiUrl = 'https://external.api.com/data';

    httpClient.get(nonApiUrl).subscribe();

    const req = httpMock.expectOne(nonApiUrl);
    expect(req.request.headers.has('Authorization')).toBeFalsy();
    req.flush({});
  });
});