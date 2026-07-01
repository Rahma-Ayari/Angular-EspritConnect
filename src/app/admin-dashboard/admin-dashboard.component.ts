import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../auth.service';
import { AdminDashboardResponse, AdminDashboardService } from '../admin-dashboard.service';

interface AdminStatCard {
  icon: string;
  label: string;
  value: number;
  delta: string;
  tone: 'green' | 'blue' | 'purple' | 'orange';
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  loading = true;
  error = '';
  adminName = 'Admin';

  dashboardData: AdminDashboardResponse | null = null;
  statCards: AdminStatCard[] = [];
  showingAllApprovals = false;

  constructor(
    private authService: AuthService,
    private adminDashboardService: AdminDashboardService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.adminName = user?.nom || 'Admin';
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';
    this.adminDashboardService.getDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.statCards = [
            { icon: 'bi-people', label: 'Total Users', value: data.summary.totalUsers, delta: '+12%', tone: 'green' },
            { icon: 'bi-mortarboard', label: 'Students', value: data.summary.students, delta: '+8%', tone: 'green' },
            { icon: 'bi-person-badge', label: 'Alumni', value: data.summary.alumni, delta: '+5%', tone: 'purple' },
            { icon: 'bi-buildings', label: 'Companies', value: data.summary.companies, delta: '+15%', tone: 'green' }
          ];
          this.loading = false;
        },
        error: () => {
          this.dashboardData = null;
          this.statCards = [];
          this.error = 'Unable to load dashboard data.';
          this.loading = false;
        }
      });
  }

  approvalInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  quickStartPercent(): number {
    if (!this.dashboardData || this.dashboardData.quickStart.totalSteps === 0) {
      return 0;
    }
    return Math.round((this.dashboardData.quickStart.completedSteps / this.dashboardData.quickStart.totalSteps) * 100);
  }

  approvePending(row: AdminDashboardResponse['pendingApprovals'][0]): void {
    const req =
      row.profileType === 'COMPANY' && row.companyId != null
        ? this.adminDashboardService.approveCompany(row.companyId)
        : row.userId
          ? this.adminDashboardService.approveUser(row.userId)
          : null;
    if (!req) return;
    req.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadDashboard(),
      error: () => {
        this.error = 'Unable to approve this item.';
      }
    });
  }

  declinePending(row: AdminDashboardResponse['pendingApprovals'][0]): void {
    const req =
      row.profileType === 'COMPANY' && row.companyId != null
        ? this.adminDashboardService.declineCompany(row.companyId)
        : row.userId
          ? this.adminDashboardService.declineUser(row.userId)
          : null;
    if (!req) return;
    req.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadDashboard(),
      error: () => {
        this.error = 'Unable to reject this item.';
      }
    });
  }

  toggleApprovalsView(): void {
    if (!this.dashboardData) {
      return;
    }
    const limit = this.showingAllApprovals ? 3 : 1000;
    this.adminDashboardService.getPendingApprovals(limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (approvals) => {
          if (!this.dashboardData) {
            return;
          }
          this.dashboardData.pendingApprovals = approvals;
          this.showingAllApprovals = !this.showingAllApprovals;
        },
        error: () => {
          this.error = 'Unable to load pending users.';
        }
      });
  }

  metricBarWidth(values: number[], current: number): number {
    const max = Math.max(...values, 1);
    return Math.max(5, Math.round((current / max) * 100));
  }

  formatDelta(delta: number): string {
    if (delta > 0) return `+${delta}%`;
    if (delta < 0) return `${delta}%`;
    return '0%';
  }
}
