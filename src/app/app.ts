import { Component, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule
  ],
  template: `
  @if (authService.currentUser()) {
    <nav>
      <a routerLink="/">📊 Dashboard</a>
      <a routerLink="/transactions">📈 Transactions</a>
      <a routerLink="/new-transaction">➕ Add</a>
      <a routerLink="/categories">📂 Categories</a>
      <a routerLink="/profile">👤 Profile</a>
      <button (click)="logout()">Logout</button>
    </nav>
  }
  <router-outlet />
  `,
  styleUrls: ['./app.css']
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}