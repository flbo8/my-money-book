import { Component, inject } from '@angular/core';
import { UserRepoService } from '../user-repos/user-repos-service';

@Component({
  selector: 'app-transfers',
  imports: [],
  templateUrl: './transfers.html',
  styleUrl: './transfers.css',
})
export class Transfers {
  // Mock transfers data
  private repoService = inject(UserRepoService);
  
  selRepo = this.repoService.selectedRepo;

  transfers = [
    { id: 1, date: '2026-01-03', description: 'Großeinkauf', amount: -45.50, category: 'Nahrungsmittel', repo: 'Girokonto' },
    { id: 2, date: '2026-01-02', description: 'Gehalt', amount: 3500.00, category: 'Einkommen', repo: 'Girokonto' },
    { id: 3, date: '2026-01-01', description: 'Miete', amount: -1200.00, category: 'Wohnen', repo: 'Girokonto' },
    { id: 4, date: '2025-12-31', description: 'Kaffeebar', amount: -5.50, category: 'Nahrungsmittel', repo: 'Bargeld' },
  ];

  get filteredTransfers() {
    if (this.repoService.selectedRepo() === 'Alle') {
      return this.transfers;
    }
    return this.transfers.filter(t => t.repo === this.repoService.selectedRepo());
  }
}
