// src/app/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authHttpClient = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api';
  
  private tokenSignal = signal<string | null>(
    localStorage.getItem('jwt_token')
  );
  
  token = this.tokenSignal.asReadonly();
  isAuthenticated = computed(() => !!this.tokenSignal());

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.authHttpClient.post<LoginResponse>(
      `${this.apiUrl}/login_check`,
      credentials
    ).pipe(
      tap(response => this.setToken(response.token))
    );
  }

  logout(): void {
    this.clearToken();
  }

  private setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
    this.tokenSignal.set(token);
  }

  // for logout only drop token
  private clearToken(): void {
    localStorage.removeItem('jwt_token');
    this.tokenSignal.set(null);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}