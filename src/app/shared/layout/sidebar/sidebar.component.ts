import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AppViewMode, ViewModeService } from '../services/view-mode.service';
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
  currentMode: AppViewMode = 'admin';

  expandedMenus: { [key: string]: boolean } = {
    users: false,
    settings: false,
    communications: true, // Ouvert par défaut pour accès rapide
    forum: false
  };

  currentUser = {
    nom: 'Admin Esprit',
    email: 'admin.connect@esprit.tn'
  };

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router,
    private readonly viewMode: ViewModeService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.modeSub = this.viewMode.currentMode$.subscribe(mode => {
      this.currentMode = mode;
      if (mode === 'student') {
        this.currentUser = {
          nom: 'Étudiant Demo',
          email: 'etudiant.demo@esprit.tn'
        };
        this.expandedMenus['forum'] = true;
      } else if (mode === 'alumni') {
        this.currentUser = {
          nom: 'Alumni Demo',
          email: 'alumni.demo@esprit.tn'
        };
        this.expandedMenus['forum'] = true;
      } else {
        this.currentUser = {
          nom: 'Admin Esprit',
          email: 'admin.connect@esprit.tn'
        };
      }
    });

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
      if (url.includes('/forum/') || url.includes('/user/forum')) {
        this.expandedMenus['forum'] = true;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.modeSub) {
      this.modeSub.unsubscribe();
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