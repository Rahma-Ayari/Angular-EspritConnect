import { Component, Inject, PLATFORM_ID, OnDestroy, OnInit, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  
  private isBrowser: boolean;
  private routerEventsSubscription?: Subscription;
  expandedMenus: { [key: string]: boolean } = {
    users: false,
    settings: false
  };

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.syncExpandedMenus(this.router.url);
      this.routerEventsSubscription = this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(event => this.syncExpandedMenus(event.urlAfterRedirects));
    }
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription?.unsubscribe();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  toggleMenu(menu: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.expandedMenus[menu] = !this.expandedMenus[menu];
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  private syncExpandedMenus(url: string): void {
    this.expandedMenus['users'] = url.startsWith('/admin/user-management');
    this.expandedMenus['settings'] = url.startsWith('/admin/settings');
  }
}
