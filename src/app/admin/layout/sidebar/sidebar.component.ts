import { Component, Inject, PLATFORM_ID, OnInit, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  
  private isBrowser: boolean;
  expandedMenus: { [key: string]: boolean } = {
    users: false,
    settings: false,
    jobs: false
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
      const url = this.router.url;
      if (url.includes('/admin/user-management')) {
        this.expandedMenus['users'] = true;
      }
      if (url.includes('/admin/settings')) {
        this.expandedMenus['settings'] = true;
      }
      if (url.includes('/admin/jobs')) {
        this.expandedMenus['jobs'] = true;
      }
    }
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
}
