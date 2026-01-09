import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRepoService } from './user-repos-service';
import { MoneyRepo } from './user-repos.model';
import { ApiService } from '../api.service';
import { Modal } from '../shared/modal/modal';

@Component({
  selector: 'app-user-repos',
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './user-repos.html',
  styleUrl: './user-repos.css',
})
export class UserRepos implements OnInit{
  // provides the list of money repos that a user can choose from
  // defaults to 'Alle'
  private repoService = inject(UserRepoService);
  private apiService = inject(ApiService);
  private formBuilder = inject(FormBuilder);

  selRepo = this.repoService.selectedRepoName;
  allRepos = this.repoService.allRepos;

  // Form state
  showForm = signal(false);
  isSubmitting = signal(false);

  // Common currencies for the dropdown
  commonCurrencies = [
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'CHF', name: 'Swiss Franc (CHF)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
  ];

  // Repo form
  repoForm: FormGroup = this.formBuilder.group({
    repoName: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    startBalance: [0, [Validators.required]],
    startBalanceDate: [this.getCurrentDate(), Validators.required],
    currency: ['EUR', Validators.required]
  });

  ngOnInit(): void {
    this.repoService.requestUserRepos();
  }

  selectRepo(repoName: string) {
    this.repoService.selectedRepoName.set(repoName);
    // No need to manually fetch - the effect in Transfers component will handle it
  }

  toggleForm() {
    this.showForm.update(val => !val);
  }

  onSubmitRepo() {
    if (this.repoForm.invalid) {
      this.repoForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.repoForm.value;

    // Convert startBalance to string for API
    const repoData = {
      ...formValue,
      startBalance: String(formValue.startBalance)
    };

    console.log(repoData);

    this.apiService.createRepo(repoData).subscribe({
      next: (newRepo) => {
        console.log('Repository created successfully:', newRepo);
        console.log('Type of newRepo:', typeof newRepo);
        console.log('newRepo keys:', Object.keys(newRepo));

        this.repoService.requestUserRepos();

        // Reset form and close
        this.repoForm.reset({
          repoName: '',
          description: '',
          startBalance: 0,
          startBalanceDate: this.getCurrentDate(),
          currency: 'EUR'
        });
        this.showForm.set(false);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error creating repository:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  private getCurrentDate(): string {
    const now = new Date();
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
  }
}
