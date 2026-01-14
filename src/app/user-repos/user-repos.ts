import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRepoService } from './user-repos-service';
import { MoneyRepo } from './user-repos.model';
import { ApiService } from '../api.service';
import { Modal } from '../shared/modal/modal';

@Component({
  selector: 'app-user-repos',
  imports: [ReactiveFormsModule, Modal, DecimalPipe, DatePipe],
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
  isEditMode = signal(false);
  editingRepoId = signal<number | null>(null);

  // Delete modal state
  showDeleteModal = signal(false);
  repoToDelete = signal<MoneyRepo | null>(null);

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

  selectRepo(repoName: string, balanceDate: string) {
    this.repoService.selectedRepoName.set(repoName);
    this.repoService.selectedBalanceDate.set(balanceDate);
    // No need to manually fetch - the effect in Transfers component will handle it
  }

  toggleForm() {
    this.showForm.update(val => !val);
    if (this.showForm()) {
      // Reset edit mode when opening form for new repo
      this.isEditMode.set(false);
      this.editingRepoId.set(null);
    }
  }

  startEditRepo(repo: MoneyRepo) {
    // Set edit mode
    this.isEditMode.set(true);
    this.editingRepoId.set(repo.id);
    this.showForm.set(true);

    // Pre-fill form with repo data
    this.repoForm.patchValue({
      repoName: repo.repoName,
      description: repo.description,
      startBalance: repo.startBalance,
      startBalanceDate: this.formatDateForInput(repo.startBalanceDate),
      currency: repo.currency
    });
  }

  cancelEdit() {
    this.isEditMode.set(false);
    this.editingRepoId.set(null);
    this.showForm.set(false);
    this.repoForm.reset({
      repoName: '',
      description: '',
      startBalance: 0,
      startBalanceDate: this.getCurrentDate(),
      currency: 'EUR'
    });
  }

  deleteRepo(repo: MoneyRepo) {
    // Store the repo to delete and show modal
    this.repoToDelete.set(repo);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.repoToDelete.set(null);
  }

  confirmDeleteRepo() {
    const repo = this.repoToDelete();
    if (!repo) {
      return;
    }

    // Delete the repo
    this.apiService.deleteRepo(repo.id).subscribe({
      next: () => {
        console.log('Repository deleted successfully');

        // If the deleted repo was selected, switch to "Alle"
        if (this.selRepo() === repo.repoName) {
          this.selectRepo('Alle', '');
        }

        // Refresh repos list
        this.repoService.requestUserRepos();

        // Close modal
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error deleting repository:', err);
        alert('Fehler beim Löschen des Kontos. Bitte versuchen Sie es erneut.');
        this.closeDeleteModal();
      }
    });
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

    // Determine if we're creating or updating
    if (this.isEditMode() && this.editingRepoId() !== null) {
      // Update existing repo
      const repoId = this.editingRepoId()!;
      this.apiService.updateRepo(repoId, repoData).subscribe({
        next: (updatedRepo) => {
          console.log('Repository updated successfully:', updatedRepo);

          // Refresh repos list
          this.repoService.requestUserRepos();

          //update balance since changed
          this.repoService.fetchBalanceForSelectedRepo()

          // Reset form and close
          this.resetFormAndState();
        },
        error: (err) => {
          console.error('Error updating repository:', err);
          this.isSubmitting.set(false);
        }
      });
    } else {
      // Create new repo
      this.apiService.createRepo(repoData).subscribe({
        next: (newRepo) => {
          console.log('Repository created successfully:', newRepo);

          // Refresh repos list
          this.repoService.requestUserRepos();

          //update balance since changed
          this.repoService.fetchBalanceForSelectedRepo()

          // Reset form and close
          this.resetFormAndState();
        },
        error: (err) => {
          console.error('Error creating repository:', err);
          this.isSubmitting.set(false);
        }
      });
    }
  }

  private resetFormAndState() {
    this.repoForm.reset({
      repoName: '',
      description: '',
      startBalance: 0,
      startBalanceDate: this.getCurrentDate(),
      currency: 'EUR'
    });
    this.showForm.set(false);
    this.isSubmitting.set(false);
    this.isEditMode.set(false);
    this.editingRepoId.set(null);
  }

  private getCurrentDate(): string {
    return this.formatDateForInput(new Date());
  }

  private formatDateForInput(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  }
}
