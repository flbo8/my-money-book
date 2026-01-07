import { Component, inject, computed, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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

  // Mocked balance history data
  balanceHistory: BalanceHistory[] = [
    { date: '2025-12-01', balance: 1000.00 },
    { date: '2025-12-05', balance: 950.50 },
    { date: '2025-12-10', balance: 1200.00 },
    { date: '2025-12-15', balance: 1150.00 },
    { date: '2025-12-20', balance: 1300.00 },
    { date: '2025-12-25', balance: 1250.00 },
    { date: '2026-01-01', balance: 2050.00 },
    { date: '2026-01-05', balance: 2000.00 },
  ];

  balanceChange = computed(() => {
    return this.balance().balance - this.balance().initialBalance;
  });

  balanceChangePercent = computed(() => {
    if (this.balance().initialBalance === 0) return 100.00;
    if ((this.balance().initialBalance < 0) && (this.balance().balance > 0)) return (this.balanceChange() / Math.abs(this.balance().initialBalance) * 100).toFixed(2);
    return ((this.balanceChange() / this.balance().initialBalance) * 100).toFixed(2);
  });

  ngAfterViewInit() {
    setTimeout(() => {
      this.initChart();
    }, 0);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  private initChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.balanceHistory.map(item => item.date);
    const data = this.balanceHistory.map(item => item.balance);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Saldo',
          data: data,
          borderColor: '#fb923c',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fb923c',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.3,
          fill: true
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
              title: (items) => {
                const date = new Date(items[0].label);
                return date.toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                });
              },
              label: (context) => `Saldo: ${context.parsed.y?.toFixed(2)} €`
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
              autoSkip: true,
              maxTicksLimit: 8,
              callback: function(_value, index) {
                const date = new Date(labels[index]);
                return date.toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'short'
                });
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: (value) => `${value} €`
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }
}
