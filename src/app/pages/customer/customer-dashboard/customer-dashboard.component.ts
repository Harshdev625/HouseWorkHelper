import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../core/models';
import { selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  user$: Observable<User | null>;

  services = [
    { id: 'cleaning', name: 'Cleaning', icon: 'cleaning_services' },
    { id: 'cooking', name: 'Cooking', icon: 'restaurant' },
    { id: 'gardening', name: 'Gardening', icon: 'yard' }
  ];

  upcomingBookings: any[] = [];

  constructor(private store: Store) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    // Load bookings would go here in later milestones
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.store.dispatch(logout());
    }
  }
}
