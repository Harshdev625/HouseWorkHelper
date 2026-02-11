# HouseMate - Home Services Platform

🏠 A modern, secure home services platform connecting customers with verified experts for on-demand and scheduled services.

## 📋 Project Overview

HouseMate enables customers to discover services, get quotes, book (ASAP or scheduled), pay, track jobs, and provide ratings. Service experts can register, set availability, accept/decline jobs, manage earnings, and grow their business.

**Current Status:** ✅ Milestone 1 Complete

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm
- Angular CLI 19+

### Installation

```bash
# Install dependencies
npm install

# Start backend server (Terminal 1)
npm run server

# Start Angular app (Terminal 2)
npm start
```

🌐 **Frontend:** http://localhost:4200  
🔌 **Backend API:** http://localhost:3000/api/v1

## 🔐 Test Credentials

| Role | Phone | Password | Dashboard |
|------|-------|----------|-----------|
| Customer | `+919876543210` | `Str0ngP@ssw0rd!` | /customer/dashboard |
| Expert | `+919876543211` | `Str0ngP@ssw0rd!` | /expert/dashboard |

## ✨ Features (Milestone 1)

### Security & Authentication
- ✅ JWT token authentication with 24h expiration
- ✅ bcrypt password hashing (10 salt rounds)
- ✅ Role-based access control (Customer/Expert)
- ✅ Protected API endpoints with Bearer tokens
- ✅ Secure route guards

### User Experience
- ✅ Landing page with service showcase
- ✅ Customer registration (Name, Age, Address, Phone, Email, Password)
- ✅ Expert registration with skills selection
- ✅ Phone validation (+91 prefix required)
- ✅ Strong password validation
- ✅ Customer dashboard with services
- ✅ Expert dashboard with metrics & availability toggle
- ✅ Responsive design (mobile-first)

### Backend API
- ✅ Express.js server with proper authentication
- ✅ RESTful endpoints for auth and resources
- ✅ CORS enabled for Angular frontend
- ✅ Proper HTTP status codes & error handling

## 📁 Project Structure

```
angular-final-assignment/
├── server/
│   ├── auth-server.js          # Express server with JWT & bcrypt
│   └── db.json                 # Database (JSON)
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/         # Route guards
│   │   │   ├── interceptors/   # HTTP interceptors
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   └── services/       # Business logic services
│   │   ├── pages/
│   │   │   ├── auth/           # Landing, Login, Registration
│   │   │   ├── customer/       # Customer dashboard
│   │   │   └── expert/         # Expert dashboard
│   │   ├── store/              # NgRx state management
│   │   └── app.routes.ts       # Application routes
│   └── ...
└── package.json
```

## 🛠️ Technology Stack

### Frontend
- **Framework:** Angular 19
- **State Management:** NgRx (Store, Effects)
- **UI Library:** Angular Material 19
- **Styling:** CSS3 (Custom)
- **HTTP Client:** Angular HttpClient
- **Routing:** Angular Router

### Backend
- **Framework:** json-server with custom middleware
- **Authentication:** jsonwebtoken
- **Password Hashing:** bcryptjs
- **Database:** JSON file (server/db.json)
- **Middleware:** Custom auth, CORS, body-parser

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/login              # Login
POST   /api/v1/auth/register/customer  # Register customer
POST   /api/v1/auth/register/expert    # Register expert
POST   /api/v1/auth/logout             # Logout (requires auth)
GET    /api/v1/auth/me                 # Get current user (requires auth)
```

### Resources (Generic CRUD)
```
GET    /api/v1/{resource}              # List all
GET    /api/v1/{resource}/{id}         # Get by ID
POST   /api/v1/{resource}              # Create (requires auth)
PATCH  /api/v1/{resource}/{id}         # Update (requires auth)
DELETE /api/v1/{resource}/{id}         # Delete (requires auth)
```

**Available Resources:** users, customerProfiles, expertProfiles, services, bookings, zones, categories, addresses

## 🔒 Security Features

1. **JWT Authentication**
   - Signed tokens with secret key
   - 24-hour token expiration
   - Automatic refresh handled by interceptor

2. **Password Security**
   - bcrypt hashing (10 salt rounds)
   - Strong password requirements:
     - Min 8 characters
     - At least 1 uppercase, 1 lowercase, 1 number, 1 special char
   - Passwords never exposed in API responses

3. **API Security**
   - Bearer token authentication
   - Role verification via x-roles header
   - CORS protection
   - Proper status codes (401, 403, 404, 409, 500)

4. **Frontend Security**
   - Route guards for protected pages
   - Role-based access control
   - Token stored in localStorage
   - Automatic logout on token expiration

## 📝 Validation Rules

### Registration
- **Full Name:** Required, min 2 characters
- **Age:** Required (customer only), 18-100
- **Address:** Required (customer only), min 10 characters
- **Phone:** Required, format: `+91XXXXXXXXXX`
- **Email:** Required, valid email format
- **Password:** Required, strong password (see Security Features)
- **Skills:** Required (expert only), at least one

### Login
- **Phone:** Required, format: `+91XXXXXXXXXX`
- **Password:** Required, min 8 characters

## 🏗️ Development

### Code Scaffolding
```bash
# Generate component
ng generate component component-name

# Generate service
ng generate service service-name

# Generate guard
ng generate guard guard-name
```

### Building
```bash
# Development build
ng build

# Production build
ng build --configuration production
```

### Testing
```bash
# Unit tests
ng test

# E2E tests
ng e2e
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill port 3000 (backend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Windows - Kill port 4200 (frontend)
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### Login Issues
- Ensure both servers are running
- Check browser console for errors
- Verify phone format includes +91
- Clear localStorage and try again

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
ng cache clean
```

## 📚 Additional Documentation

- **Implementation Details:** See `MILESTONE-1-FIXES.md`
- **Quick Start Guide:** See `QUICK-START.md`

## 🗺️ Roadmap

### ✅ Milestone 1: User Dashboard (Complete)
- Landing page, registration, login, dashboards

### 🔜 Milestone 2: Booking & Payment
- Service listing, quotes, booking flow, payment

### 🔜 Milestone 3: Expert Dashboard Enhancement
- Availability management, earnings, calendar

### 🔜 Milestone 4: Job Actions & History
- Job offers, accept/decline, booking history

### 🔜 Milestone 5: Modify & Cancel Booking
- Booking modifications, cancellation, ratings

### 🔜 Milestone 6: Advanced Features
- OTP verification, certificates, testing, accessibility

## 👥 Contributing

This is an assignment project. For issues or suggestions, please create an issue in the repository.

## 📄 License

This project is part of an Angular assignment.

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Material Design for UI components
- Community tutorials and documentation

---

**Built with ❤️ using Angular 19 & Express.js**

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
