import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User, ExpertProfile } from '../../../core/models';
import { selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-expert-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expert-dashboard.component.html',
  styleUrls: ['./expert-dashboard.component.css']
})
export class ExpertDashboardComponent implements OnInit {
  user$: Observable<User | null>;
  expertProfile: ExpertProfile | null = null;
  isOnline = false;

  appointments: any[] = [];
  pendingRequests: any[] = [];

  stats = {
    todayJobs: 0,
    thisWeekJobs: 0,
    totalEarnings: 0,
    rating: 0
  };

  constructor(private store: Store) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    // Load expert profile and stats
    this.user$.subscribe(user => {
      if (user) {
        // In a real app, fetch expert profile from store or service
        this.stats = {
          todayJobs: 2,
          thisWeekJobs: 8,
          totalEarnings: 4500,
          rating: 4.7
        };
      }
    });
  }

  toggleOnlineStatus(): void {
    this.isOnline = !this.isOnline;
    // In real app, update expert status in backend
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.store.dispatch(logout());
    }
  }
}
