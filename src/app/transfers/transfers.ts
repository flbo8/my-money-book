import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRepoService } from '../user-repos/user-repos-service';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-transfers',
  imports: [DecimalPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './transfers.html',
  styleUrl: './transfers.css',
})
export class Transfers {
  private repoService = inject(UserRepoService);
  private apiService = inject(ApiService);
  private formBuilder = inject(FormBuilder);

  // Expose signals from service for template
  selRepo = this.repoService.selectedRepoName;
  transfers = this.repoService.transfers;
  userRepos = this.repoService.allRepos;

  // Form state
  showForm = signal(false);
  isSubmitting = signal(false);

  // Transfer form
  transferForm: FormGroup = this.formBuilder.group({
    repoId: [null, Validators.required],
    transferValue: [0, [Validators.required, Validators.min(0.01)]],
    transferType: ['income', Validators.required],
    description: [''],
    transferDate: [this.getCurrentDateTime(), Validators.required]
  });

  toggleForm() {
    this.showForm.update(val => !val);
    if (this.showForm()) {
      // Pre-select current repo if not "Alle"
      const currentRepo = this.userRepos().find(repo => repo.repoName === this.selRepo());
      if (currentRepo) {
        this.transferForm.patchValue({ repoId: currentRepo.id });
      }
    }
  }

  onPostSubmitTransfer() {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.transferForm.value;
    const repoId = formValue.repoId;

    // Remove repoId and convert transferValue to string for API
    const { repoId: _, transferValue, ...rest } = formValue;
    const transferData = {
      ...rest,
      transferValue: String(transferValue)
    };

    this.apiService.createTransfer(repoId, transferData).subscribe({
      next: (newTransfer) => {
        console.log('Transfer created successfully:', newTransfer);

        // Refresh transfers list to get complete data with repoName
        this.repoService.fetchTransfersForSelectedRepo();

        // Also refresh balance since it changed
        this.repoService.fetchBalanceForSelectedRepo();

        // Reset form and close
        this.transferForm.reset({
          repoId: null,
          transferValue: 0,
          transferType: 'income',
          description: '',
          transferDate: this.getCurrentDateTime()
        });
        this.showForm.set(false);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error creating transfer:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  private getCurrentDateTime(): string {
    const now = new Date();
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(now).replace(' ', 'T');
  }
}
