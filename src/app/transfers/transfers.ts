import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRepoService } from '../user-repos/user-repos-service';
import { ApiService } from '../api.service';
import { Modal } from '../shared/modal/modal';
import type { Transfer } from './transfers.model';

@Component({
  selector: 'app-transfers',
  imports: [DecimalPipe, DatePipe, ReactiveFormsModule, Modal],
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
  isEditMode = signal(false);
  editingTransferId = signal<number | null>(null);
  editingTransferRepoId = signal<number | null>(null);

  // Delete modal state
  showDeleteModal = signal(false);
  transferToDelete = signal<Transfer | null>(null);

  // Transfer form
  transferForm: FormGroup = this.formBuilder.group({
    repoId: [null, Validators.required],
    transferValue: [0, [Validators.required, Validators.min(0.01)]],
    transferType: ['income', Validators.required],
    description: [''],
    transferDate: [this.getCurrentDateTime(), Validators.required]
  });

  // toggles form for new transfer
  toggleForm() {
    this.showForm.update(val => !val);
    if (this.showForm()) {
      // Reset edit mode when opening form for new transfer
      this.isEditMode.set(false);
      this.editingTransferId.set(null);
      this.editingTransferRepoId.set(null);

      // Pre-select current repo if not "Alle"
      const currentRepo = this.userRepos().find(repo => repo.repoName === this.selRepo());
      if (currentRepo) {
        this.transferForm.patchValue({ repoId: currentRepo.id });
      }
    }
  }

  startEditTransfer(transfer: any) {
    // Find the repo for this transfer
    const selectedRepo = this.userRepos().find(repo => repo.repoName === transfer.repoName);
    if (!selectedRepo) {
      console.error('Money repository not found for transfer');
      return;
    }

    // Set edit mode
    this.isEditMode.set(true);
    this.editingTransferId.set(transfer.id);
    this.editingTransferRepoId.set(selectedRepo.id);
    this.showForm.set(true);

    // Format the date for datetime-local input (YYYY-MM-DDTHH:mm)
    const transferDate = new Date(transfer.transferDate);
    const formattedDate = new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(transferDate).replace(' ', 'T');

    // Pre-fill form with transfer data
    this.transferForm.patchValue({
      repoId: selectedRepo.id,
      transferValue: transfer.transferValue,
      transferType: transfer.transferType,
      description: transfer.description,
      transferDate: formattedDate
    });
  }

  cancelEdit() {
    this.isEditMode.set(false);
    this.editingTransferId.set(null);
    this.editingTransferRepoId.set(null);
    this.showForm.set(false);
    this.transferForm.reset({
      repoId: null,
      transferValue: 0,
      transferType: 'income',
      description: '',
      transferDate: this.getCurrentDateTime()
    });
  }

  deleteTransfer(transfer: Transfer) {
    // Store the transfer to delete and show modal
    this.transferToDelete.set(transfer);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.transferToDelete.set(null);
  }

  confirmDelete() {
    const transfer = this.transferToDelete();
    if (!transfer) {
      return;
    }

    // Find the repo for this transfer
    const selectedRepo = this.userRepos().find(repo => repo.repoName === transfer.repoName);
    if (!selectedRepo) {
      console.error('Repository not found for transfer');
      this.closeDeleteModal();
      return;
    }

    // Delete the transfer
    this.apiService.deleteTransfer(selectedRepo.id, transfer.id).subscribe({
      next: () => {
        console.log('Transfer deleted successfully');

        // Refresh transfers list
        this.repoService.fetchTransfersForSelectedRepo();

        // Refresh balance since it changed
        this.repoService.fetchBalanceForSelectedRepo();

        // Close modal
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error deleting transfer:', err);
        alert('Fehler beim Löschen des Umsatzes. Bitte versuchen Sie es erneut.');
        this.closeDeleteModal();
      }
    });
  }

  // on press submit button of create/edit transfer form
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

    // Determine if creating or updating
    if (this.isEditMode() && this.editingTransferId() !== null) {
      // Update existing transfer
      const transferId = this.editingTransferId()!;
      this.apiService.updateTransfer(repoId, transferId, transferData).subscribe({
        next: (updatedTransfer) => {
          console.log('Transfer updated successfully:', updatedTransfer);

          // Refresh transfers list
          this.repoService.fetchTransfersForSelectedRepo();

          // Refresh balance since it changed
          this.repoService.fetchBalanceForSelectedRepo();

          // Reset form and close
          this.resetFormAndState();
        },
        error: (err) => {
          console.error('Error updating transfer:', err);
          this.isSubmitting.set(false);
        }
      });
    } else {
      // Create new transfer
      this.apiService.createTransfer(repoId, transferData).subscribe({
        next: (newTransfer) => {
          console.log('Transfer created successfully:', newTransfer);

          // Refresh transfers list to get complete data with repoName
          this.repoService.fetchTransfersForSelectedRepo();

          // Also refresh balance since it changed
          this.repoService.fetchBalanceForSelectedRepo();

          // Reset form and close
          this.resetFormAndState();
        },
        error: (err) => {
          console.error('Error creating transfer:', err);
          this.isSubmitting.set(false);
        }
      });
    }
  }

  private resetFormAndState() {
    this.transferForm.reset({
      repoId: null,
      transferValue: 0,
      transferType: 'income',
      description: '',
      transferDate: this.getCurrentDateTime()
    });
    this.showForm.set(false);
    this.isSubmitting.set(false);
    this.isEditMode.set(false);
    this.editingTransferId.set(null);
    this.editingTransferRepoId.set(null);
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
