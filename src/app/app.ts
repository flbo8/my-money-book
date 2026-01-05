import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Login } from './login/login';
import { UserRepos } from "./user-repos/user-repos";
import { UserRepoService } from './user-repos/user-repos-service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, Login, UserRepos],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private repoService = inject(UserRepoService);

  isAuthenticated = this.authService.isAuthenticated;
  selRepo = this.repoService.selectedRepo;

  // Mock transfers data
  transfers = [
    { id: 1, date: '2026-01-03', description: 'Grocery Shopping', amount: -45.50, category: 'Food', repo: 'Checking Account' },
    { id: 2, date: '2026-01-02', description: 'Salary', amount: 3500.00, category: 'Income', repo: 'Checking Account' },
    { id: 3, date: '2026-01-01', description: 'Rent Payment', amount: -1200.00, category: 'Housing', repo: 'Checking Account' },
    { id: 4, date: '2025-12-31', description: 'Coffee Shop', amount: -5.50, category: 'Food', repo: 'Cash' },
  ];

  get filteredTransfers() {
    if (this.repoService.selectedRepo() === 'all') {
      return this.transfers;
    }
    return this.transfers.filter(t => t.repo === this.repoService.selectedRepo());
  }

  onLogout() {
    this.authService.logout();
    this.repoService.selectedRepo.set('all');
  }
}
