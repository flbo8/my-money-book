import { Component, inject, signal, output } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // Login form
  username = signal<string>('');
  password = signal<string>('');
  loginError = signal<string>('');
  isLoggingIn = signal<boolean>(false);

  private authService = inject(AuthService);
  private userService = inject(UserService);

  switchToRegistration = output<void>();

  onSwitchToRegistration() {
    this.switchToRegistration.emit();
  }

  onLogin() {
    this.isLoggingIn.set(true);
    this.loginError.set('');

    this.authService.login({
      username: this.username(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.isLoggingIn.set(false);
        this.username.set('');
        this.password.set('');
      },
      error: (error) => {
        this.isLoggingIn.set(false);
        console.error('Login error:', error);
        this.loginError.set(error.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }
}