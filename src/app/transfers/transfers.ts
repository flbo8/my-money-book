import { Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { UserRepoService } from '../user-repos/user-repos-service';

@Component({
  selector: 'app-transfers',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './transfers.html',
  styleUrl: './transfers.css',
})
export class Transfers {
  private repoService = inject(UserRepoService);

  // Expose signals from service for template
  selRepo = this.repoService.selectedRepoName;
  transfers = this.repoService.transfers;

  // No constructor needed - effect is handled in the service
}
