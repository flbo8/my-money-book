import { Component, inject, computed, AfterViewInit, OnDestroy, ElementRef, ViewChild, effect, signal } from '@angular/core';
import { UserRepoService } from '../user-repos/user-repos-service';
import { Chart, registerables } from 'chart.js';
import { DecimalPipe } from '@angular/common';

Chart.register(...registerables);

interface BalanceHistory {
  date: string;
  balance: number;
}

@Component({
  selector: 'app-balances',
  imports: [DecimalPipe],
  templateUrl: './balances.html',
  styleUrl: './balances.css',
})
export class Balances implements AfterViewInit, OnDestroy {
  @ViewChild('balanceChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  private repoService = inject(UserRepoService);

  selectedRepo = this.repoService.selectedRepoName;
  balance = this.repoService.balance;

  balanceHistory = signal<BalanceHistory[]>([
    { date: '2025-12-01', balance: 1000.00 },
    { date: '2025-12-05', balance: 950.50 },
    { date: '2025-12-10', balance: 1200.00 },
    { date: '2025-12-15', balance: 1150.00 },
    { date: '2025-12-20', balance: 1300.00 },
    { date: '2025-12-25', balance: 1250.00 },
    { date: '2026-01-01', balance: 2050.00 },
    { date: '2026-01-05', balance: 2000.00 },
  ]);

  balanceChange = computed(() => {
    return this.balance().balance - this.balance().initialBalance;
  });

  balanceChangePercent = computed(() => {
    if (this.balance().initialBalance === 0) return 100.00;
    if ((this.balance().initialBalance < 0) && (this.balance().balance > 0)) return (this.balanceChange() / Math.abs(this.balance().initialBalance) * 100).toFixed(2);
    return ((this.balanceChange() / this.balance().initialBalance) * 100).toFixed(2);
  });

  constructor() {
    // Update chart when selectedRepo changes
    effect(() => {
      this.selectedRepo(); // Track dependency
      if (this.chart) {
        this.updateChart();
      }
    });
  }

  ngAfterViewInit() {
    // Use setTimeout to ensure the canvas is fully rendered
    setTimeout(() => {
      this.initChart();
    }, 0);
  }

  ngOnDestroy() {
    // Cleanup chart instance on component destruction
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  private initChart() {
    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.balanceHistory().map(item => item.date),
        datasets: [{
          label: 'Saldo',
          data: this.balanceHistory().map(item => item.balance),
          borderColor: '#fb923c',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#fb923c',
          pointBorderColor: '#fb923c',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.parsed.y?.toFixed(2)} €`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 0,
              autoSkipPadding: 20
            }
          },
          y: {
            grid: {
              color: '#e5e7eb'
            },
            ticks: {
              callback: (value) => `${value} €`
            }
          }
        }
      }
    });
  }

  private updateChart() {
    if (this.chart) {
      this.chart.data.labels = this.balanceHistory().map(item => item.date);
      this.chart.data.datasets[0].data = this.balanceHistory().map(item => item.balance);
      this.chart.update();
    }
  }
}
