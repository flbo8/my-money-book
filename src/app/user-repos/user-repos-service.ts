// src/app/services/auth.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserRepoService {
  private userRepos = signal<string[]>(['all', 'Checking Account', 'Savings Account', 'Cash']);

  selectedRepo = signal<string>('all');
  allRepos = this.userRepos.asReadonly();

  addRepo(repo: string): void {
    this.userRepos.update((oldRepos) => [...oldRepos, repo]);
  }
}