import { Component, Inject, OnDestroy, OnInit, Input, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subject, filter, takeUntil } from 'rxjs';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  expandedMenus: { [key: string]: boolean } = {
    users: false,
    settings: false,
    jobs: false
  };
  private isBrowser: boolean;
  layoutType: 'admin' | 'entreprise' | 'default' = 'default';
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.updateLayoutType(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.updateLayoutType(event.urlAfterRedirects);
      this.updateExpandedMenus(event.urlAfterRedirects);
    });

    if (this.isBrowser) {
      this.updateExpandedMenus(this.router.url);
    }
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

  updateExpandedMenus(url: string): void {
    this.expandedMenus = {
      users: url.includes('/admin/user-management'),
      settings: url.includes('/admin/settings'),
      jobs: url.includes('/admin/jobs')
    };
  }

  toggleMenu(menu: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.expandedMenus[menu] = !this.expandedMenus[menu];
  }

  logout(): void {
    this.authService.logout();
  }
}
