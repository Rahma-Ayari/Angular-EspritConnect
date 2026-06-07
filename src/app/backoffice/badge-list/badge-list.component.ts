import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BadgeService } from '../../services/badge.service';
import { Badge, BadgeRequest, RequestStatus } from '../../models/badge.model';

@Component({
  selector: 'app-badge-list',
  templateUrl: './badge-list.component.html',
  styleUrls: ['./badge-list.component.css']
})
export class BadgeListComponent implements OnInit {

  badges: Badge[] = [];
  requests: BadgeRequest[] = [];
  loading = true;
  errorMessage = '';

  activeTab: 'badges' | 'requests' = 'badges';

  // Toast
  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private badgeService: BadgeService,
    private router: Router
  ) {}

  get pendingCount(): number {
    return this.requests.filter(r => r.status === RequestStatus.PENDING).length;
  }

  get enabledCount(): number {
    return this.badges.filter(b => b.enabled).length;
  }

  get totalAssignments(): number {
    return this.badges.reduce((sum, b) => sum + (b.userCount || 0), 0);
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    forkJoin({
      badges: this.badgeService.getAllBadges(),
      requests: this.badgeService.getAllRequests()
    }).subscribe({
      next: ({ badges, requests }) => {
        this.badges = badges;
        this.requests = requests;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load data.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadBadges(): void {
    this.badgeService.getAllBadges().subscribe({
      next: (data) => this.badges = data,
      error: (err) => console.error(err)
    });
  }

  toggleBadge(badge: Badge): void {
    if (badge.id == null) return;
    this.badgeService.toggleBadgeStatus(badge.id).subscribe({
      next: (updated) => { badge.enabled = updated.enabled; },
      error: (err) => console.error('Failed to toggle badge:', err)
    });
  }

  toggleAll(enabled: boolean): void {
    const action = enabled ? 'enable' : 'disable';
    if (confirm(`Are you sure you want to ${action} ALL badges?`)) {
      this.badgeService.toggleAllBadges(enabled).subscribe({
        next: () => {
          this.badges.forEach(b => b.enabled = enabled);
          this.showToast(`Successfully ${action}d all badges.`, 'success');
        },
        error: () => this.showToast(`Failed to ${action} badges.`, 'error')
      });
    }
  }

  deleteBadge(id: number): void {
    if (confirm('Are you sure you want to delete this badge?')) {
      this.badgeService.deleteBadge(id).subscribe({
        next: () => { this.badges = this.badges.filter(b => b.id !== id); },
        error: (err) => console.error('Failed to delete badge:', err)
      });
    }
  }

  editBadge(id: number): void {
    this.router.navigate(['/admin/badges/edit', id]);
  }

  createBadge(): void {
    this.router.navigate(['/admin/badges/create']);
  }

  approveRequest(request: BadgeRequest): void {
    this.badgeService.handleRequest(request.id!, true).subscribe({
      next: () => {
        request.status = RequestStatus.APPROVED;
        this.showToast(`✓ Badge "${request.badgeName}" approved for ${request.userName}.`, 'success');
      },
      error: (err) => {
        const msg = err.error?.error || err.error?.message || 'Failed to approve request.';
        this.showToast(msg, 'error');
      }
    });
  }

  rejectRequest(request: BadgeRequest): void {
    this.badgeService.handleRequest(request.id!, false).subscribe({
      next: () => {
        request.status = RequestStatus.REJECTED;
        this.showToast(`Request for "${request.badgeName}" rejected.`, 'error');
      },
      error: (err) => {
        const msg = err.error?.error || err.error?.message || 'Failed to reject request.';
        this.showToast(msg, 'error');
      }
    });
  }

  getRequestsByStatus(status: RequestStatus): BadgeRequest[] {
    return this.requests.filter(r => r.status === status);
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 4000);
  }

  getIconClass(icon: string): string {
    return `badge-icon badge-icon-${icon}`;
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }

  readonly RequestStatus = RequestStatus;
}
