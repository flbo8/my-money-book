// src/app/components/jwt-test/jwt-test.component.ts
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

interface ApiResponse {
  type: 'success' | 'error';
  message: string;
  data?: any;
  timestamp: Date;
}

@Component({
  selector: 'app-lexik-auth-test',
  imports: [CommonModule, FormsModule],
  templateUrl: './lexik-auth-test.html',
  styleUrl: './lexik-auth-test.css',
})
export class LexikAuthTest {
  private authService = inject(AuthService);

  username = signal('');
  password = signal('');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  isAuthenticated = this.authService.isAuthenticated;
  currentToken = this.authService.token;

  onLogin() {
    this.loading.set(true);
    this.errorMessage.set(null);
    
    this.authService.login({
      username: this.username(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);

        // Log full error details to console
        console.error('Login error details:', {
          status: error.status,
          statusText: error.statusText,
          errorBody: error.error,
          fullError: error
        });

        // Create detailed error message
        const errorDetails = error.error
          ? JSON.stringify(error.error, null, 2)
          : error.message || 'Unknown error';

        this.errorMessage.set(
          `Login failed (${error.status} ${error.statusText}): ${errorDetails}`
        );
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.errorMessage.set(null);
  }
}