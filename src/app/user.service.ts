import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import type { UserInfo } from "./user.model";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private destroyRef = inject(DestroyRef);
  private userInfoSignal = signal<UserInfo>({
    firstName: '',
    lastName: '',
    email: ''
  });

  private apiService = inject(ApiService);

  // Expose readonly signal
  userInfo = this.userInfoSignal.asReadonly();

  /**
   * Requests user data from api endpoint users/my-info
   * User's identity is bound to JWT access token
   */
  requestUserInfo(){
    const subscription = this.apiService.getUserProfile().subscribe({
      next: (data) => {
        this.userInfoSignal.set({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email
        });
      },
      error: (err) => {
        // Handle specific error codes if needed
        if (err.status === 401) {
        // User will be redirected to login automatically by handleError
        console.log('Session expired, redirecting to login...');
        } else if (err.status === 404) {
        console.log('Resource not found');
        }
      }
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  setUserInfo(info: UserInfo): void{
    this.userInfoSignal.set(info);
  }

  getUserInfo(): UserInfo {
    return this.userInfoSignal();
  }
}