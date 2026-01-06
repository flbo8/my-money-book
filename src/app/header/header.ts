import { Component, inject } from '@angular/core';
import { UserRepoService } from '../user-repos/user-repos-service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private repoService = inject(UserRepoService);
  private authService = inject(AuthService);

  onLogout() {
    this.authService.logout();
    this.repoService.selectedRepo.set('all');
  }
}
