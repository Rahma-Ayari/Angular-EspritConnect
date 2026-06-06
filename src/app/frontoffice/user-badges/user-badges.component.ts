import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BadgeService } from '../../services/badge.service';
import { Badge, UserBadge, BadgeRequest, RequestStatus } from '../../models/badge.model';

@Component({
  selector: 'app-user-badges',
  templateUrl: './user-badges.component.html',
  styleUrls: ['./user-badges.component.css']
})
export class UserBadgesComponent implements OnInit {

  userBadges: UserBadge[] = [];
  userRequests: BadgeRequest[] = [];
  availableBadges: Badge[] = [];
  manualBadges: Badge[] = [];
  autoBadges: Badge[] = [];
  loading = true;

  // Modal state
  showModal = false;
  selectedBadge: Badge | null = null;
  motivation = '';
  submitting = false;

  // Toast state
  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(private badgeService: BadgeService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      allBadges: this.badgeService.getAllBadges(),
      userBadges: this.badgeService.getUserBadges(this.badgeService.CURRENT_USER_ID),
      userRequests: this.badgeService.getAllRequests().pipe(
        catchError(err => {
          console.warn('Failed to load requests. Endpoint may be missing on this branch.');
          return of([]);
        })
      )

    }).subscribe({
      next: ({ allBadges, userBadges, userRequests }) => {
        this.userBadges = userBadges;
        // In a real app, the backend would filter by user. Here we filter locally for the mock user.
        this.userRequests = userRequests.filter(r => r.userId === this.badgeService.CURRENT_USER_ID);
        
        const earnedIds = new Set(userBadges.map(ub => ub.badgeId));
        const available = allBadges.filter(b => b.enabled && !earnedIds.has(b.id!));
        
        this.manualBadges = available.filter(b => b.badgeType === 'MANUALLY_ASSIGNED');
        this.autoBadges = available.filter(b => b.badgeType === 'AUTOMATICALLY_EARNED');
        this.availableBadges = available;
        this.loading = false;
      },
      error: (err) => {
        this.showToast(`Failed to load badges (Status: ${err.status}).`, 'error');
        this.loading = false;
      }
    });
  }

  isPending(badgeId: number): boolean {
    return this.userRequests.some(r => r.badgeId === badgeId && r.status === RequestStatus.PENDING);
  }

  openRequestModal(badge: Badge): void {
    this.selectedBadge = badge;
    this.motivation = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedBadge = null;
    this.motivation = '';
  }

  submitRequest(): void {
    if (!this.selectedBadge || !this.motivation.trim()) return;
    this.submitting = true;

    this.badgeService.requestBadge(this.selectedBadge.id!, this.motivation.trim()).subscribe({
      next: () => {
        this.submitting = false;
        this.closeModal();
        this.showToast(`Request for "${this.selectedBadge?.name}" sent! The admin will review it.`, 'success');
        this.loadData();
      },
      error: (err) => {
        this.submitting = false;
        const msg = err.error?.error || err.error?.message || 'Failed to send request. Please try again.';
        this.showToast(msg, 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 4000);
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}
