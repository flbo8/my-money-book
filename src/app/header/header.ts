import { Component, inject, OnInit, computed } from '@angular/core';
import { UserRepoService } from '../user-repos/user-repos-service';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private repoService = inject(UserRepoService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  // Expose authentication state to template
  isAuthenticated = this.authService.isAuthenticated;

  // Computed signal for greeting message
  greeting = computed(() => {
    const userInfo = this.userService.getUserInfo();
     if (userInfo.firstName) {
      return `Hallo ${userInfo.firstName}!`;
    }
    return 'Hallo!';
  });

  ngOnInit() {
    // Fetch user info when component initializes
    this.userService.requestUserInfo();
  }

  onLogout() {
    this.authService.logout();
    this.repoService.selectedRepoName.set('Alle');
  }
}
