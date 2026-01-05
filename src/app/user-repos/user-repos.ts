import { Component, inject } from '@angular/core';
import { UserRepoService } from './user-repos-service';

@Component({
  selector: 'app-user-repos',
  imports: [],
  templateUrl: './user-repos.html',
  styleUrl: './user-repos.css',
})
export class UserRepos {
  // provides the list of money repos that a user can choose from
  // defaults to 'all'
  private repoService = inject(UserRepoService);

  selRepo = this.repoService.selectedRepo;
  allRepos = this.repoService.allRepos;

  selectRepo(repo: string) {
    this.repoService.selectedRepo.set(repo);
  }
}
