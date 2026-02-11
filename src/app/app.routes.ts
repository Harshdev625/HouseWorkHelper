import { Routes } from '@angular/router';
import { LandingComponent } from './pages/auth/landing/landing.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterCustomerComponent } from './pages/auth/register-customer/register-customer.component';
import { RegisterExpertComponent } from './pages/auth/register-expert/register-expert.component';
import { CustomerDashboardComponent } from './pages/customer/customer-dashboard/customer-dashboard.component';
import { authGuard, customerGuard } from './core/guards/auth.guard';

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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
