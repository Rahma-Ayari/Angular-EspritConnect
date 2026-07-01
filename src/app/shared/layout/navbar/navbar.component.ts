import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppViewMode, ViewModeService } from '../services/view-mode.service';
import { AuthService } from '../../../auth.service';
import { AdminNotification, AdminNotificationService } from '../../../services/admin-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  showDropdown: boolean = false;
  currentMode: AppViewMode = 'admin';
  userRole: string | null = null;
  currentUser: { nom: string; email: string } | null = null;
  unreadNotificationsCount = 0;
  notifications: AdminNotification[] = [];
  showNotifications = false;
  private modeSub?: Subscription;
  private userSub?: Subscription;
  private refreshTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly viewMode: ViewModeService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly adminNotificationService: AdminNotificationService
  ) {}

  get showAdminControls(): boolean {
    return this.userRole === 'ADMIN' && this.currentMode === 'admin';
  }

  get showAdminPreviewBar(): boolean {
    return this.userRole === 'ADMIN' && this.currentMode !== 'admin';
  }

  get userViewLabel(): string {
    if (this.userRole === 'ALUMNI' || this.currentMode === 'alumni') {
      return 'VUE ALUMNI';
    }
    if (this.userRole === 'ENTREPRISE') {
      return 'VUE ENTREPRISE';
    }
    return 'VUE ÉTUDIANT';
  }

  ngOnInit(): void {
    this.userRole = this.authService.getRole();

    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userRole = user.role;
        this.currentUser = { nom: user.nom, email: user.email };
        if (user.role === 'ADMIN' && this.currentMode === 'admin') {
          this.refreshNotificationCounter();
        }
      }
    });

    this.modeSub = this.viewMode.currentMode$.subscribe(mode => {
      this.currentMode = mode;
      if (this.userRole === 'ADMIN' && mode === 'admin') {
        this.refreshNotificationCounter();
      }
    });

    if (this.userRole === 'ADMIN') {
      this.refreshNotificationCounter();
      this.loadNotifications();
      this.refreshTimer = setInterval(() => {
        if (this.showAdminControls) {
          this.refreshNotificationCounter();
          this.loadNotifications();
        }
      }, 30000);
    }
  }

  private refreshNotificationCounter(): void {
    if (!this.showAdminControls) {
      this.unreadNotificationsCount = 0;
      return;
    }
    this.adminNotificationService.getAdminUnreadCount().subscribe({
      next: ({ count }) => {
        this.unreadNotificationsCount = count ?? 0;
      },
      error: () => {
        this.unreadNotificationsCount = 0;
      }
    });
  }

  private loadNotifications(): void {
    if (!this.showAdminControls) {
      this.notifications = [];
      return;
    }
    this.adminNotificationService.getAdminNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: () => {
        this.notifications = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.modeSub?.unsubscribe();
    this.userSub?.unsubscribe();
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  onSearch(): void {
    console.log('Search:', this.searchQuery);
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu') && !target.closest('.notification-menu')) {
      this.showDropdown = false;
      this.showNotifications = false;
    }
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
    this.adminNotificationService.markAsRead(notification.idNotification).subscribe({
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
    this.adminNotificationService.markAllAsRead().subscribe({
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

  logout(): void {
    this.showDropdown = false;
    this.viewMode.setMode('admin');
    this.authService.logout();
  }

  switchTo(mode: AppViewMode): void {
    this.viewMode.setMode(mode);
    this.showDropdown = false;
    if (mode === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  goToEnterpriseJobs(): void {
    this.router.navigate(['/entreprise/jobs/all']);
  }
}
