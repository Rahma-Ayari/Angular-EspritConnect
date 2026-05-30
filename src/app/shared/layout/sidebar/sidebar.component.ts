import { Component, Inject, PLATFORM_ID, OnInit, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  
  private isBrowser: boolean;
  expandedMenus: { [key: string]: boolean } = {
    users: false,
    settings: false,
    communications: true, // Ouvert par défaut pour accès rapide
    forum: false
  };

  // Mock currentUser car AuthService n'est pas présent dans le projet
  currentUser = {
    nom: 'Admin Esprit',
    email: 'admin.connect@esprit.tn'
  };

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
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
      if (url.includes('/activity-digest') || url.includes('/message-users') || url.includes('/email-history') || url.includes('/automatic-emails') || url.includes('/mailing-lists')) {
        this.expandedMenus['communications'] = true;
      }
      if (url.includes('/forum/')) {
        this.expandedMenus['forum'] = true;
      }
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