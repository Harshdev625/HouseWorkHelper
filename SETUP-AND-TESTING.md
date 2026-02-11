# HouseMate - Complete Setup & Testing Guide

## 🚀 Quick Start (Updated for json-server)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend (json-server with JWT & bcrypt)
```bash
npm run server
```
✅ Backend running on: http://localhost:3000
✅ API endpoint: http://localhost:3000/api/v1
✅ Features: JWT authentication, bcrypt password hashing

### 3. Start Frontend
```bash
npm start
```
✅ Frontend running on: http://localhost:4200

### 4. Run Tests
```bash
npm test
```
✅ 81 unit tests covering all Milestone 1 features

---

## 📦 Backend Configuration

### json-server with Custom Middleware

The project uses json-server with custom middleware to handle:
- ✅ JWT token generation and verification
- ✅ bcrypt password hashing
- ✅ Custom authentication endpoints
- ✅ Protected routes
- ✅ CORS support

**Server file:** `server/server.js`

### Authentication Endpoints

```
POST   /api/v1/auth/login              # Login with phone & password
POST   /api/v1/auth/register/customer  # Register new customer
POST   /api/v1/auth/register/expert    # Register new expert
POST   /api/v1/auth/logout             # Logout (requires Bearer token)
GET    /api/v1/auth/me                 # Get current user (requires Bearer token)
```

### Resource Endpoints (json-server default)

```
GET    /api/v1/{resource}              # List all
GET    /api/v1/{resource}?field=value  # Filter by field
GET    /api/v1/{resource}/{id}         # Get by ID
POST   /api/v1/{resource}              # Create (requires auth)
PATCH  /api/v1/{resource}/{id}         # Update (requires auth)
DELETE /api/v1/{resource}/{id}         # Delete (requires auth)
```

**Available resources:**
- users, customerProfiles, expertProfiles
- services, bookings, zones, categories, addresses

---

## 🧪 Testing

### Test Suite Overview
- **Total Tests:** 81 unit tests
- **Coverage:** All Milestone 1 components & services
- **Framework:** Jasmine + Karma

### Run Tests
```bash
# Run all tests with watch mode
npm test

# Run tests once (CI mode)
ng test --watch=false

# Run with coverage report
ng test --code-coverage

# Run in headless mode
ng test --browsers=ChromeHeadless --watch=false
```

### Test Files Created

| Component | Test File | Tests |
|-----------|-----------|-------|
| AuthService | `auth.service.spec.ts` | 15 |
| LoginComponent | `login.component.spec.ts` | 12 |
| RegisterCustomerComponent | `register-customer.component.spec.ts` | 14 |
| RegisterExpertComponent | `register-expert.component.spec.ts` | 10 |
| CustomerDashboardComponent | `customer-dashboard.component.spec.ts` | 6 |
| ExpertDashboardComponent | `expert-dashboard.component.spec.ts` | 8 |
| LandingComponent | `landing.component.spec.ts` | 10 |
| Auth Guards | `auth.guard.spec.ts` | 6 |

---

## 🔐 Test Credentials

### Customer Account
- **Phone:** `+919876543210`
- **Password:** `Str0ngP@ssw0rd!`
- **Dashboard:** `/customer/dashboard`

### Expert Account
- **Phone:** `+919876543211`
- **Password:** `Str0ngP@ssw0rd!`
- **Dashboard:** `/expert/dashboard`

### Registration Testing
Use any valid data following these rules:
- **Phone:** Must start with `+91` followed by 10 digits
- **Password:** Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- **Age:** Between 18-100 (customer only)
- **Address:** Min 10 characters (customer only)
- **Skills:** At least one skill required (expert only)

---

## 📋 Milestone 1 Verification Checklist

### ✅ Features Implemented

#### 1. Landing Page
- [x] Hero section with service carousel
- [x] Customer Login / Expert Login buttons
- [x] Book Service / Become an Expert CTAs
- [x] Why Choose section (4 benefits)
- [x] Auto-rotating service showcase
- [x] Responsive design

#### 2. Registration
- [x] Customer registration form:
  - Full Name (required, min 2 chars)
  - Age (required, 18-100)
  - Location/Address (required, min 10 chars)
  - Mobile Number (required, +91 prefix)
  - Email (required, valid format)
  - Password (strong validation)
- [x] Expert registration form with skills selection
- [x] Real-time validation with error messages
- [x] Terms of Service & Privacy Policy links

#### 3. Login
- [x] Role-based login (Customer/Expert)
- [x] Phone + password authentication
- [x] JWT token generation
- [x] Auto-redirect to respective dashboard
- [x] Error handling for invalid credentials

#### 4. Customer Dashboard
- [x] Welcome header with user name
- [x] Book Service CTA
- [x] Popular Services grid (Cleaning, Cooking, Gardening)
- [x] Upcoming Bookings section
- [x] User menu with logout
- [x] Protected route (auth + customer guard)

#### 5. Expert Dashboard
- [x] Welcome banner with user name
- [x] Online/Offline availability toggle
- [x] Performance metrics cards:
  - Today's Jobs
  - This Week
  - Total Earnings (₹)
  - My Rating
- [x] My Appointments section
- [x] Pending Requests sidebar
- [x] My Calendar widget
- [x] Location selector
- [x] Protected route (auth + expert guard)

#### 6. Security & Authentication
- [x] JWT token authentication
- [x] bcrypt password hashing (10 salt rounds)
- [x] Token expiration (24 hours)
- [x] Bearer token in HTTP requests
- [x] Protected API endpoints
- [x] Role-based access control
- [x] Route guards (auth, customer, expert)
- [x] Secure localStorage token management

#### 7. Backend (json-server)
- [x] Custom middleware for authentication
- [x] JWT token generation & verification
- [x] bcrypt password hashing
- [x] Authentication endpoints
- [x] CORS enabled
- [x] Error handling (401, 403, 409, 500)
- [x] JSON database with hashed passwords

#### 8. Testing
- [x] 81 unit tests created
- [x] Service tests with HTTP mocking
- [x] Component tests with MockStore
- [x] Route guard tests
- [x] Form validation tests
- [x] Authentication flow tests
- [x] Error handling tests

---

## 🔧 Manual Testing Steps

### 1. Landing Page
```
1. Open http://localhost:4200
2. Verify hero section displays
3. Verify service carousel rotates
4. Click "Customer Login" → Should go to /login/customer
5. Click "Expert Login" → Should go to /login/expert
6. Click "Book Service" → Should go to /register/customer
7. Click "Become an Expert" → Should go to /register/expert
```

### 2. Customer Registration
```
1. Navigate to /register/customer
2. Fill form:
   - Full Name: John Doe
   - Age: 25
   - Address: 123 Main Street, Bangalore
   - Phone: +919999999999 (new number)
   - Email: john@example.com (new email)
   - Password: Str0ngP@ssw0rd!
3. Click Register
4. Should auto-login and redirect to /customer/dashboard
5. Verify user name appears in dashboard
```

### 3. Expert Registration
```
1. Navigate to /register/expert
2. Fill form:
   - Full Name: Expert Name
   - Phone: +918888888888 (new number)
   - Email: expert@test.com (new email)
   - Password: Str0ngP@ssw0rd!
3. Select skills: Cleaning, Plumbing
4. Click Register
5. Should auto-login and redirect to /expert/dashboard
6. Verify expert name appears in dashboard
```

### 4. Customer Login
```
1. Navigate to /login/customer
2. Enter: +919876543210 / Str0ngP@ssw0rd!
3. Click Login
4. Should redirect to /customer/dashboard
5. Verify services displayed
6. Click Logout → Should redirect to /
```

### 5. Expert Login
```
1. Navigate to /login/expert
2. Enter: +919876543211 / Str0ngP@ssw0rd!
3. Click Login
4. Should redirect to /expert/dashboard
5. Toggle Online/Offline
6. Verify stats displayed
7. Click Logout → Should redirect to /
```

### 6. Route Guards
```
1. Logout completely
2. Try accessing /customer/dashboard → Redirected to /
3. Login as customer
4. Try accessing /expert/dashboard → Redirected to /
5. Logout
6. Login as expert
7. Try accessing /customer/dashboard → Redirected to /
8. Verify expert can access /expert/dashboard
```

### 7. Security Testing
```
1. Register new user
2. Open DevTools → Application → LocalStorage
3. Verify 'token' exists
4. Decode token at jwt.io:
   - Should have: id, role, phone, iat, exp
5. Check server/db.json:
   - New user's password should be bcrypt hash ($2b$...)
6. Try login with password from DB → Should fail
7. Clear token from localStorage
8. Try accessing dashboard → Redirected to /
```

---

## 📊 Expected Test Results

When you run `npm test`, you should see:

```
Chrome Headless: Executed 81 of 81 SUCCESS

✅ AuthService
   ✓ should be created
   ✓ should login a customer successfully
   ✓ should handle login error
   ✓ should register a new customer
   ✓ should handle duplicate user error
   ✓ should register a new expert
   ✓ should call logout endpoint
   ✓ should get current user
   ✓ should check if user is authenticated
   ✓ should get token from localStorage
   ✓ should remove token from localStorage
   ... and 4 more

✅ LoginComponent
   ✓ should create
   ✓ should initialize form with empty values
   ✓ should set userRole to ROLE_CUSTOMER for customer route
   ✓ should validate phone number format
   ✓ should validate password length
   ✓ should dispatch login action when form is valid
   ... and 6 more

✅ RegisterCustomerComponent
   ✓ should create
   ✓ should initialize form with all required fields
   ✓ should validate fullName field
   ✓ should validate age field
   ✓ should validate address field
   ✓ should validate phone number with +91 prefix
   ... and 8 more

✅ RegisterExpertComponent
   ✓ should create
   ✓ should toggle skill selection
   ✓ should validate form fields
   ✓ should dispatch registerExpert action with skills
   ... and 6 more

✅ CustomerDashboardComponent
   ✓ should create
   ✓ should load user from store
   ✓ should dispatch logout action when confirmed
   ... and 3 more

✅ ExpertDashboardComponent
   ✓ should create
   ✓ should toggle online status
   ✓ should have stats defined
   ... and 5 more

✅ LandingComponent
   ✓ should create
   ✓ should initialize with services
   ✓ should rotate services
   ... and 7 more

✅ Auth Guards
   ✓ authGuard should allow access if authenticated
   ✓ customerGuard should allow only customers
   ✓ expertGuard should allow only experts
   ... and 3 more
```

---

## 🐛 Troubleshooting

### Backend Issues

**Port 3000 already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart
npm run server
```

**Database not updating:**
- Check `server/db.json` permissions
- Restart server after manual DB edits

### Frontend Issues

**Port 4200 already in use:**
```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Then restart
npm start
```

**Login not working:**
- Clear localStorage
- Verify both servers are running
- Check browser console for errors
- Verify phone format (+91 prefix)

### Test Issues

**Tests failing:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
ng cache clean

# Run tests again
npm test
```

**Token/LocalStorage errors in tests:**
- Tests should clear localStorage in beforeEach/afterEach
- Check test file has proper cleanup

---

## 📁 Key Files

### Backend
- `server/server.js` - json-server with JWT & bcrypt middleware
- `server/db.json` - Database with hashed passwords

### Frontend Services
- `src/app/core/services/auth.service.ts` - Authentication service
- `src/app/core/services/auth.service.spec.ts` - Auth service tests

### Frontend Guards
- `src/app/core/guards/auth.guard.ts` - Route guards
- `src/app/core/guards/auth.guard.spec.ts` - Guard tests

### Frontend Components
- `src/app/pages/auth/landing/` - Landing page
- `src/app/pages/auth/login/` - Login component
- `src/app/pages/auth/register-customer/` - Customer registration
- `src/app/pages/auth/register-expert/` - Expert registration
- `src/app/pages/customer/customer-dashboard/` - Customer dashboard
- `src/app/pages/expert/expert-dashboard/` - Expert dashboard

### Configuration
- `package.json` - Scripts and dependencies
- `karma.conf.js` - Test configuration
- `tsconfig.json` - TypeScript configuration

---

## ✅ Milestone 1 Status: COMPLETE

All requirements have been implemented and tested:
- ✅ Landing page with service showcase
- ✅ User registration (Customer & Expert)
- ✅ User login with JWT authentication
- ✅ Customer dashboard
- ✅ Expert dashboard  
- ✅ Password security (bcrypt)
- ✅ Route guards
- ✅ json-server backend
- ✅ 81 unit tests

**Ready to proceed with Milestone 2!** 🚀

For detailed test documentation, see: `MILESTONE-1-TESTS.md`
