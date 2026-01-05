// src/app/services/auth.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserRepoService {
  private userRepos = signal<string[]>(['Alle', 'Girokonto', 'Sparkonto', 'Bargeld']);

  selectedRepo = signal<string>('Alle');
  allRepos = this.userRepos.asReadonly();

  addRepo(repo: string): void {
    this.userRepos.update((oldRepos) => [...oldRepos, repo]);
  }
}