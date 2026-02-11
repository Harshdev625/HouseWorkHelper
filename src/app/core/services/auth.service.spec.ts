import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterCustomerRequest, RegisterExpertRequest } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login a customer successfully', () => {
      const loginRequest: LoginRequest = {
        phone: '+919876543210',
        password: 'Str0ngP@ssw0rd!',
        role: 'ROLE_CUSTOMER'
      };

      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          phone: '+919876543210',
          email: 'customer@example.com',
          fullName: 'Test Customer',
          password: 'hashedPassword',
          roles: ['ROLE_CUSTOMER'],
          blocked: false,
          createdAt: '2026-01-01T00:00:00Z'
        },
        profile: {
          id: '1',
          userId: '1',
          fullName: 'Test Customer',
          phone: '+919876543210',
          email: 'customer@example.com',
          age: 25,
          address: 'Test Address',
          preferredZoneIds: []
        }
      };

      service.login(loginRequest).subscribe(response => {
        expect(response.token).toBe('mock-jwt-token');
        expect(response.user.id).toBe('1');
        expect(response.user.email).toBe('customer@example.com');
        expect(response.user.roles).toContain('ROLE_CUSTOMER');
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      const loginRequest: LoginRequest = {
        phone: '+919876543210',
        password: 'wrongpassword',
        role: 'ROLE_CUSTOMER'
      };

      service.login(loginRequest).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(401);
          expect(error.error.error).toBe('Invalid credentials');
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/auth/login`);
      req.flush({ error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('registerCustomer', () => {
    it('should register a new customer', () => {
      const registerRequest: RegisterCustomerRequest = {
        fullName: 'New Customer',
        phone: '+919999999999',
        email: 'newcustomer@example.com',
        password: 'Str0ngP@ssw0rd!',
        age: 30,
        address: '123 Main St'
      };

      const mockResponse = {
        token: 'new-jwt-token',
        user: {
          id: '2',
          phone: '+919999999999',
          email: 'newcustomer@example.com',
          fullName: 'New Customer',
          password: 'hashedPassword',
          roles: ['ROLE_CUSTOMER'],
          blocked: false,
          createdAt: '2026-02-11T00:00:00Z'
        },
        profile: {
          id: '2',
          userId: '2',
          fullName: 'New Customer',
          phone: '+919999999999',
          email: 'newcustomer@example.com',
          age: 30,
          address: '123 Main St',
          preferredZoneIds: []
        }
      };

      service.registerCustomer(registerRequest).subscribe(response => {
        expect(response.token).toBe('new-jwt-token');
        expect(response.user.fullName).toBe('New Customer');
        expect(response.user.email).toBe('newcustomer@example.com');
        expect(response.user.roles).toContain('ROLE_CUSTOMER');
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/register/customer`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle duplicate user error', () => {
      const registerRequest: RegisterCustomerRequest = {
        fullName: 'Duplicate User',
        phone: '+919876543210',
        email: 'customer@example.com',
        password: 'Str0ngP@ssw0rd!'
      };

      service.registerCustomer(registerRequest).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(409);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/auth/register/customer`);
      req.flush({ error: 'User already exists' }, { status: 409, statusText: 'Conflict' });
    });
  });

  describe('registerExpert', () => {
    it('should register a new expert', () => {
      const registerRequest: RegisterExpertRequest = {
        fullName: 'New Expert',
        phone: '+918888888888',
        email: 'newexpert@example.com',
        password: 'Str0ngP@ssw0rd!',
        skills: ['Cleaning', 'Plumbing']
      };

      const mockResponse = {
        token: 'expert-jwt-token',
        user: {
          id: '3',
          phone: '+918888888888',
          email: 'newexpert@example.com',
          fullName: 'New Expert',
          password: 'hashedPassword',
          roles: ['ROLE_EXPERT'],
          blocked: false,
          createdAt: '2026-02-11T00:00:00Z'
        },
        profile: {
          id: '3',
          userId: '3',
          fullName: 'New Expert',
          phone: '+918888888888',
          email: 'newexpert@example.com',
          skills: ['Cleaning', 'Plumbing'],
          zoneIds: [],
          status: 'PENDING',
          onlineStatus: 'OFFLINE',
          rating: 0,
          totalJobs: 0,
          createdAt: '2026-02-11T00:00:00Z'
        }
      };

      service.registerExpert(registerRequest).subscribe(response => {
        expect(response.token).toBe('expert-jwt-token');
        expect(response.user.fullName).toBe('New Expert');
        expect(response.user.email).toBe('newexpert@example.com');
        expect(response.user.roles).toContain('ROLE_EXPERT');
        expect((response.profile as any)?.skills).toContain('Cleaning');
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/register/expert`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', () => {
      service.logout().subscribe(response => {
        expect(response.message).toBe('Logged out successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Logged out successfully' });
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user', () => {
      const mockResponse = {
        user: {
          id: '1',
          phone: '+919876543210',
          email: 'customer@example.com',
          fullName: 'Test Customer',
          password: 'hashedPassword',
          roles: ['ROLE_CUSTOMER'],
          blocked: false,
          createdAt: '2026-01-01T00:00:00Z'
        },
        profile: {
          id: '1',
          userId: '1',
          fullName: 'Test Customer',
          phone: '+919876543210',
          email: 'customer@example.com',
          preferredZoneIds: []
        }
      };

      service.getCurrentUser().subscribe(response => {
        expect(response.user.id).toBe('1');
        expect(response.user.email).toBe('customer@example.com');
        expect(response.user.fullName).toBe('Test Customer');
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('helper methods', () => {
    it('should check if user is authenticated', () => {
      expect(service.isAuthenticated()).toBeFalsy();
      
      localStorage.setItem('token', 'test-token');
      expect(service.isAuthenticated()).toBeTruthy();
    });

    it('should get token from localStorage', () => {
      expect(service.getToken()).toBeNull();
      
      localStorage.setItem('token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should remove token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      expect(localStorage.getItem('token')).toBe('test-token');
      
      service.removeToken();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
