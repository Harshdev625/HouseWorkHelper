# HouseMate - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Backend Server (Terminal 1)**
   ```bash
   npm run server
   ```
   ✅ Server running on: http://localhost:3000

3. **Start Angular App (Terminal 2)**
   ```bash
   npm start
   ```
   ✅ App running on: http://localhost:4200

## 🧪 Test Credentials

### Customer Account
- **Phone:** `+919876543210`
- **Password:** `Str0ngP@ssw0rd!`
- **Access:** Customer Dashboard

### Expert Account
- **Phone:** `+919876543211`
- **Password:** `Str0ngP@ssw0rd!`
- **Access:** Expert Dashboard

## 📝 Features Implemented (Milestone 1)

✅ Landing Page with Service Showcase  
✅ Customer Registration (Full Name, Age, Address, Phone, Email, Password)  
✅ Expert Registration (with Skills Selection)  
✅ Login with JWT Authentication  
✅ Password Hashing with bcrypt  
✅ Customer Dashboard  
✅ Expert Dashboard  
✅ Role-based Routing & Guards  
✅ Secure API with Express.js  

## 🔐 Security Features

- JWT tokens with 24-hour expiration
- bcrypt password hashing (10 salt rounds)
- Protected API endpoints
- Role-based access control
- CORS enabled

## 📱 User Flows

### New Customer Registration
1. Go to http://localhost:4200
2. Click "Book Service" or "Customer Login" → "Register"
3. Fill: Name, Age, Address, Phone (+91...), Email, Password
4. Click "REGISTER"
5. Automatically logged in → Redirected to Customer Dashboard

### New Expert Registration
1. Go to http://localhost:4200
2. Click "Become an Expert" or "Expert Login" → "Register"
3. Fill: Name, Phone (+91...), Email, Password
4. Select at least one skill
5. Click "REGISTER"
6. Automatically logged in → Redirected to Expert Dashboard

### Existing User Login
1. Click "Customer Login" or "Expert Login"
2. Enter Phone & Password
3. Redirected to respective dashboard

## 🛠️ Development Notes

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&#)

### Phone Format
- Must include country code: `+91XXXXXXXXXX`
- Example: `+919876543210`

### API Base URL
- `http://localhost:3000/api/v1`

## 📂 Key Files

### Backend
- `server/auth-server.js` - Express server with JWT & bcrypt
- `server/db.json` - Database (JSON)

### Frontend
- `src/app/pages/auth/` - Landing, Login, Registration
- `src/app/pages/customer/` - Customer Dashboard
- `src/app/pages/expert/` - Expert Dashboard
- `src/app/core/services/auth.service.ts` - Authentication service
- `src/app/core/guards/auth.guard.ts` - Route guards

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 4200 (frontend)
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### Login Not Working
- Ensure both servers are running
- Check browser console for errors
- Verify credentials format (+91 for phone)
- Clear localStorage and try again

### Cannot Access Dashboard
- Check if JWT token is in localStorage
- Verify user role matches route (customer vs expert)
- Check browser network tab for 401/403 errors

## 📖 For Detailed Information

See `MILESTONE-1-FIXES.md` for complete implementation details and changes.

---

**Ready to proceed with Milestone 2! 🎉**
