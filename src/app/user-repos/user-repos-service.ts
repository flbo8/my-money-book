// src/app/services/auth.service.ts
import { DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import type { MoneyRepo } from './user-repos.model';
import type { Transfer } from '../transfers/transfers.model';

@Injectable({
  providedIn: 'root'
})
export class UserRepoService {
  private userRepos = signal<MoneyRepo[]>([]);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  // Store selected repo name as string ('Alle' or specific repo name)
  selectedRepoName = signal<string>('Alle');
  allRepos = this.userRepos.asReadonly();
  transfers = signal<Transfer[]>([]);

  constructor() {
    // Automatically fetch transfers when selectedRepoName changes AND user is authenticated
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      this.selectedRepoName(); // Track dependency

      // Only fetch if user is authenticated
      if (isAuthenticated) {
        // Use untracked to prevent other signal reads from triggering this effect
        untracked(() => {
          this.fetchTransfersForSelectedRepo();
        });
      }
    });
  }

  requestUserRepos(){
    const subscription = this.apiService.getUserRepos().subscribe({
      next: (data) => {
        // API now returns MoneyRepo[] directly (empty array on 404)
        this.userRepos.set(data);
      },
      error: (err) => {
        // Handle specific error codes if needed
        if (err.status === 401) {
          // User will be redirected to login automatically by handleError
          console.log('Session expired, redirecting to login...');
        }
      }
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  /**
   * Fetches transfers based on currently selected repo
   * If 'Alle' is selected, fetches all user transfers
   * Otherwise fetches transfers for specific repo by ID
   */
  fetchTransfersForSelectedRepo() {
    const selectedName = this.selectedRepoName();

    if (selectedName === 'Alle') {
      // Fetch all user transfers
      const subscription = this.apiService.getAllUsersTransfers().subscribe({
        next: (data) => {
          this.transfers.set(data);
        },
        error: (err) => {
          if (err.status === 401) {
            console.log('Session expired, redirecting to login...');
          }
        }
      });
      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    } else {
      // Find the repo ID for the selected repo name
      const selectedRepo = this.userRepos().find(repo => repo.repoName === selectedName);

      if (selectedRepo) {
        const subscription = this.apiService.getReposTransfers(selectedRepo.id).subscribe({
          next: (data) => {
            this.transfers.set(data);
          },
          error: (err) => {
            if (err.status === 401) {
              console.log('Session expired, redirecting to login...');
            }
          }
        });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
      } else {
        // No repo found, set empty array
        this.transfers.set([]);
      }
    }
  }

  addRepo(repo: MoneyRepo): void {
    this.userRepos.update((oldRepos) => [...oldRepos, repo]);
  }
}