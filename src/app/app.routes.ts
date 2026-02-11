import { Routes } from '@angular/router';
import { LandingComponent } from './pages/auth/landing/landing.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterCustomerComponent } from './pages/auth/register-customer/register-customer.component';
import { RegisterExpertComponent } from './pages/auth/register-expert/register-expert.component';
import { CustomerDashboardComponent } from './pages/customer/customer-dashboard/customer-dashboard.component';
import { BookServiceComponent } from './pages/customer/book-service/book-service.component';
import { MyBookingsComponent } from './pages/customer/my-bookings/my-bookings.component';
import { BookingDetailsComponent } from './pages/customer/booking-details/booking-details.component';
import { ModifyBookingComponent } from './pages/customer/modify-booking/modify-booking.component';
import { ProvideFeedbackComponent } from './pages/customer/provide-feedback/provide-feedback.component';
import { ExpertDashboardComponent } from './pages/expert/expert-dashboard/expert-dashboard.component';
import { authGuard, customerGuard, expertGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login/:role', component: LoginComponent },
  { path: 'register/customer', component: RegisterCustomerComponent },
  { path: 'register/expert', component: RegisterExpertComponent },
  { 
    path: 'customer',
    canActivate: [authGuard, customerGuard],
    children: [
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'book-service', component: BookServiceComponent },
      { path: 'bookings', component: MyBookingsComponent },
      { path: 'bookings/:id', component: BookingDetailsComponent },
      { path: 'bookings/:id/modify', component: ModifyBookingComponent },
      { path: 'feedback', component: ProvideFeedbackComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { 
    path: 'expert',
    canActivate: [authGuard, expertGuard],
    children: [
      { path: 'dashboard', component: ExpertDashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
