import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { AuthService } from '../../auth.service';
import { AdminNotification, AdminNotificationService } from '../../services/admin-notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchQuery = '';
  showDropdown = false;
  showNotifications = false;
  layoutType: 'admin' | 'entreprise' | 'default' = 'default';
  unreadNotificationsCount = 0;
  notifications: AdminNotification[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private adminNotificationService: AdminNotificationService
  ) {}

  ngOnInit(): void {
    this.updateLayoutType(this.router.url);
    this.refreshNotificationCounter();
    this.loadNotifications();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.updateLayoutType(event.urlAfterRedirects);
      this.refreshNotificationCounter();
      this.loadNotifications();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get isAdmin(): boolean {
    return this.layoutType === 'admin';
  }

  get isEntreprise(): boolean {
    return this.layoutType === 'entreprise';
  }

  updateLayoutType(url: string): void {
    if (url.startsWith('/admin')) {
      this.layoutType = 'admin';
    } else if (url.startsWith('/entreprise')) {
      this.layoutType = 'entreprise';
    } else {
      this.layoutType = 'default';
    }
  }

  private refreshNotificationCounter(): void {
    const role = this.currentUser?.role;
    if (!this.isAdmin || role !== 'ADMIN') {
      this.unreadNotificationsCount = 0;
      return;
    }

    this.adminNotificationService.getAdminUnreadCount().pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ count }) => {
        this.unreadNotificationsCount = count || 0;
      },
      error: () => {
        this.unreadNotificationsCount = 0;
      }
    });
  }

  private loadNotifications(): void {
    const role = this.currentUser?.role;
    if (!this.isAdmin || role !== 'ADMIN') {
      this.notifications = [];
      return;
    }
    this.adminNotificationService.getAdminNotifications().pipe(takeUntil(this.destroy$)).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: () => {
        this.notifications = [];
      }
    });
  }

  onSearch(): void {
    if (!this.isAdmin) {
      return;
    }
    console.log('Search:', this.searchQuery);
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
      this.refreshNotificationCounter();
    }
  }

  markNotificationAsRead(notification: AdminNotification, event: Event): void {
    event.stopPropagation();
    if (notification.lue) {
      return;
    }
    this.adminNotificationService.markAsRead(notification.idNotification).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) =>
          n.idNotification === notification.idNotification ? { ...n, lue: true } : n
        );
        this.refreshNotificationCounter();
      }
    });
  }

  markAllNotificationsAsRead(event: Event): void {
    event.stopPropagation();
    this.adminNotificationService.markAllAsRead().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) => ({ ...n, lue: true }));
        this.unreadNotificationsCount = 0;
      }
    });
  }

  formatNotificationDate(dateValue: string): string {
    if (!dateValue) {
      return '';
    }
    return new Date(dateValue).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu') && !target.closest('.notification-menu')) {
      this.showDropdown = false;
      this.showNotifications = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
