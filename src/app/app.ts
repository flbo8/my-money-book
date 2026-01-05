import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Login } from './login/login';
import { UserRepos } from "./user-repos/user-repos";
import { UserRepoService } from './user-repos/user-repos-service';
import { Balances } from "./balances/balances";
import { Transfers } from "./transfers/transfers";

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, Login, UserRepos, Balances, Transfers],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private repoService = inject(UserRepoService);

  isAuthenticated = this.authService.isAuthenticated;
  selRepo = this.repoService.selectedRepo;

  onLogout() {
    this.authService.logout();
    this.repoService.selectedRepo.set('all');
  }
}
