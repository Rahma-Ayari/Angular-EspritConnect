import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppViewMode, ViewModeService } from '../services/view-mode.service';
import { AuthService } from '../../../auth.service';
import { UserApprovalService } from '../../../services/user-approval.service';
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
  pendingApprovalsCount = 0;
  private modeSub?: Subscription;
  private userSub?: Subscription;

  constructor(
    private readonly viewMode: ViewModeService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly userApprovalService: UserApprovalService
  ) {}

  get showAdminControls(): boolean {
    return this.userRole === 'ADMIN' && this.currentMode === 'admin';
  }

  get showAdminPreviewBar(): boolean {
    return this.userRole === 'ADMIN' && this.currentMode !== 'admin';
  }

  ngOnInit(): void {
    this.userRole = this.authService.getRole();

    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userRole = user.role;
        this.currentUser = { nom: user.nom, email: user.email };
        if (user.role === 'ADMIN' && this.currentMode === 'admin') {
          this.loadPendingApprovalsCount();
        }
      }
    });

    this.modeSub = this.viewMode.currentMode$.subscribe(mode => {
      this.currentMode = mode;
      if (this.userRole === 'ADMIN' && mode === 'admin') {
        this.loadPendingApprovalsCount();
      }
    });

    if (this.userRole === 'ADMIN') {
      this.loadPendingApprovalsCount();
    }
  }

  private loadPendingApprovalsCount(): void {
    this.userApprovalService.getStats().subscribe({
      next: (stats) => {
        this.pendingApprovalsCount = stats.pendingCount;
      },
      error: () => {
        this.pendingApprovalsCount = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.modeSub?.unsubscribe();
    this.userSub?.unsubscribe();
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
    if (!target.closest('.user-menu')) {
      this.showDropdown = false;
    }
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

}
