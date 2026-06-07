import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, IsActiveMatchOptions } from '@angular/router';
import { AppViewMode, ViewModeService } from '../services/view-mode.service';
import { AuthService } from '../../../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;

  private isBrowser: boolean;
  private modeSub?: Subscription;
  private userSub?: Subscription;
  currentMode: AppViewMode = 'admin';
  userRole: string | null = null;

  expandedMenus: { [key: string]: boolean } = {
    users: false,
    settings: false,
    jobs: false,
    communications: true,
    forum: false,
    support: false,
    badges: false
  };

  currentUser = {
    nom: 'Utilisateur',
    email: 'user@esprit.tn'
  };

  readonly jobsLinkActiveOptions: IsActiveMatchOptions = {
    paths: 'subset',
    matrixParams: 'ignored',
    queryParams: 'ignored',
    fragment: 'ignored'
  };

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router,
    private readonly viewMode: ViewModeService,
    private readonly authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get showAdminMenu(): boolean {
    return this.userRole === 'ADMIN' && this.currentMode === 'admin';
  }

  get showUserMenu(): boolean {
    return !this.showAdminMenu;
  }

  get userInitials(): string {
    const nom = this.currentUser.nom?.trim() || '';
    const parts = nom.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nom.substring(0, 2).toUpperCase() || 'U';
  }

  get userRoleLabel(): string {
    if (this.userRole === 'ADMIN' && this.currentMode !== 'admin') {
      return this.currentMode === 'alumni' ? 'Preview Alumni' : 'Preview Étudiant';
    }
    switch (this.userRole) {
      case 'ETUDIANT': return 'Étudiant';
      case 'ALUMNI': return 'Alumni';
      case 'ENTREPRISE': return 'Entreprise';
      case 'ADMIN': return 'Administrateur';
      default: return 'Utilisateur';
    }
  }

  logout(): void {
    this.viewMode.setMode('admin');
    this.authService.logout();
  }

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    if (this.userRole && this.userRole !== 'ADMIN') {
      this.viewMode.syncFromRole(this.userRole);
    }

    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userRole = user.role;
        this.currentUser = { nom: user.nom, email: user.email };
        if (user.role !== 'ADMIN') {
          this.viewMode.syncFromRole(user.role);
        }
      }
    });

    this.modeSub = this.viewMode.currentMode$.subscribe(mode => {
      this.currentMode = mode;
    });

    if (this.isBrowser) {
      this.expandMenusForUrl(this.router.url);
    }
  }

  ngOnDestroy(): void {
    this.modeSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  private expandMenusForUrl(url: string): void {
    if (url.includes('/admin/user-management')) {
      this.expandedMenus['users'] = true;
    }
    if (url.includes('/admin/jobs')) {
      this.expandedMenus['jobs'] = true;
    }
    if (url.includes('/admin/settings')) {
      this.expandedMenus['settings'] = true;
    }
    if (url.includes('/activity-digest') || url.includes('/message-users') || url.includes('/email-history') || url.includes('/automatic-emails') || url.includes('/mailing-lists')) {
      this.expandedMenus['communications'] = true;
    }
    if (url.includes('/forum/') || url.includes('/user/forum')) {
      this.expandedMenus['forum'] = true;
    }
    if (url.includes('/admin/badges')) {
      this.expandedMenus['badges'] = true;
    }
    if (url.includes('/admin/support') || url.includes('/admin/moderation')) {
      this.expandedMenus['support'] = true;
    }
    if (url.includes('/my-badges') || url.includes('/support')) {
      this.expandedMenus['support'] = true;
    }
  }

  toggleMenu(menu: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.expandedMenus[menu] = !this.expandedMenus[menu];
  }
}
