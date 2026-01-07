import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { catchError, Observable, throwError, of } from "rxjs";
import type { UserInfo } from "./user.model";
import type { MoneyRepo } from "./user-repos/user-repos.model";
import { Transfer } from "./transfers/transfers.model";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = "http://127.0.0.1:8000/api"

  /**
   * Creates Http Auth Headers for JWT Bearer Auth
   */
  private getAuthHeaders(): HttpHeaders{
      const jwtToken = this.authService.getToken();
      return new HttpHeaders ({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
      });
  }

  /**
   * Handles HTTP errors with specific handling for common status codes
   * 401 - Unauthorized (invalid/expired token)
   * 403 - Forbidden (valid token but insufficient permissions)
   * 404 - Not Found (resource doesn't exist)
   * 500 - Internal Server Error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
    // Client-side or network error
    errorMessage = `Network error: ${error.error.message}`;
    console.error('Client-side error:', error.error.message);
    } else {
    // Backend returned an unsuccessful response code
    switch (error.status) {
        case 401:
        errorMessage = 'Unauthorized: Your session has expired. Please log in again.';
        console.error('401 Unauthorized - Token may be invalid or expired');
        // Optionally trigger logout
        this.authService.logout();
        break;

        case 403:
        errorMessage = 'Forbidden: You do not have permission to access this resource.';
        console.error('403 Forbidden - Insufficient permissions');
        break;

        case 404:
        errorMessage = 'Not Found: The requested resource could not be found.';
        console.error('404 Not Found - Resource does not exist');
        break;

        case 500:
        errorMessage = 'Internal Server Error: Please try again later.';
        console.error('500 Internal Server Error - Server error occurred');
        break;

        default:
        errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
        console.error(`HTTP Error ${error.status}:`, error.error);
    }
    }

    // Return an observable with a user-facing error message
    return throwError(() => ({
    status: error.status,
    message: errorMessage,
    originalError: error
    }));
  }

  getUserProfile(): Observable<UserInfo> {
    return this.httpClient.get<UserInfo>(`${this.apiUrl}/users/my-info`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.error('404 Not Found - User profile does not exist');
          // Return empty UserInfo object on 404
          return of({ firstName: '', lastName: '', email: '' });
        }
        // For other errors, use standard error handler
        return this.handleError(error);
      })
    );
  }

  getUserRepos(): Observable<MoneyRepo[]> {
    return this.httpClient.get<MoneyRepo[]>(`${this.apiUrl}/money-repos/my`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.error('404 Not Found - User repos do not exist');
          // Return empty array on 404
          return of([]);
        }
        // For other errors, use standard error handler
        return this.handleError(error);
      })
    );
  }

  getReposTransfers(repoId: number): Observable<Transfer[]> {
    return this.httpClient.get<Transfer[]>(`${this.apiUrl}/money-repos/${repoId}/transfers`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.error('404 Not Found - User repos transfers do not exist');
          // Return empty array on 404
          return of([]);
        }
        // For other errors, use standard error handler
        return this.handleError(error);
      })
    );
  }

  getAllUsersTransfers(): Observable<Transfer[]>{
    return this.httpClient.get<Transfer[]>(`${this.apiUrl}/money-repos/transfers`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.error('404 Not Found - User repos transfers do not exist');
          // Return empty array on 404
          return of([]);
        }
        // For other errors, use standard error handler
        return this.handleError(error);
      })
    );
  }
}