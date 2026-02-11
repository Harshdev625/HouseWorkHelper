import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  private http = inject(HttpClient);
  error?: string;

  users$: Observable<any[]> = this.http.get<any[]>('http://localhost:3000/users').pipe(
    catchError(err => {
      console.error('Failed to load users', err);
      this.error = 'Failed to load users.';
      return of([]);
    })
  );

  trackByIndex(index: number, _item: any): number {
    return index;
  }
}
