import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Login } from './login/login';
import { RegistrationComponent } from './registration/registration';
import { UserRepos } from "./user-repos/user-repos";
import { UserRepoService } from './user-repos/user-repos-service';
import { Balances } from "./balances/balances";
import { Transfers } from "./transfers/transfers";
import { Header } from "./header/header";

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, Login, RegistrationComponent, UserRepos, Balances, Transfers, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private repoService = inject(UserRepoService);

  isAuthenticated = this.authService.isAuthenticated;
  selRepo = this.repoService.selectedRepoName;
  showRegistration = signal<boolean>(false);

  toggleToRegistration() {
    this.showRegistration.set(true);
  }

  toggleToLogin() {
    this.showRegistration.set(false);
  }
}
