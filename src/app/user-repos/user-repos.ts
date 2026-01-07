import { Component, inject, OnInit } from '@angular/core';
import { UserRepoService } from './user-repos-service';
import { MoneyRepo } from './user-repos.model';

@Component({
  selector: 'app-user-repos',
  imports: [],
  templateUrl: './user-repos.html',
  styleUrl: './user-repos.css',
})
export class UserRepos implements OnInit{
  // provides the list of money repos that a user can choose from
  // defaults to 'Alle'
  private repoService = inject(UserRepoService);

  selRepo = this.repoService.selectedRepoName;
  allRepos = this.repoService.allRepos;

  ngOnInit(): void {
    this.repoService.requestUserRepos();
  }

  selectRepo(repoName: string) {
    this.repoService.selectedRepoName.set(repoName);
    // No need to manually fetch - the effect in Transfers component will handle it
  }
}
