// ============================================================
// admin-layout.component.ts — Corrigé : navbarVariant déclaré
// ============================================================
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarVariant } from '../navbar/navbar.component';
import { SidebarItem } from '../../models/nav.model';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {

  /** Variante de la navbar : 'light' pour Email Communications */
  navbarVariant: NavbarVariant = 'light';

  sidebarCollapsed = false;
  mobileMenuOpen   = false;
  isMobile         = false;
  pageTitle        = 'Email Communications';

  sidebarItems: SidebarItem[] = [
    { id: 'home',  label: 'Homepage Settings',        icon: 'home' },
    { id: 'help',  label: 'Willing to Help Settings', icon: 'hand' },
    {
      id: 'users', label: 'User Management', icon: 'users',
      children: [
        { id: 'u1', label: 'Approval',     icon: 'chevron' },
        { id: 'u2', label: 'Affiliations', icon: 'chevron' }
      ]
    },
    {
      id: 'mail', label: 'Email Communications', icon: 'mail', accent: true,
      children: [
        { id: 'digest',   label: 'Activity Digest',      icon: 'chevron', active: true, route: '/activity-digest' },
        { id: 'msg',      label: 'Message Users',        icon: 'chevron', route: '/message-users' },
        { id: 'hist',     label: 'History & Statistics', icon: 'chevron', route: '/email-history' },
        { id: 'auto',     label: 'Automatic Emails',     icon: 'chevron', route: '/automatic-emails' },
        { id: 'maillist', label: 'Mailing Lists',        icon: 'chevron', route: '/mailing-lists' }
      ]
    },
    {
      id: 'forum', label: 'Espace Forum', icon: 'chat',
      children: [
        { id: 'forum-dash', label: 'Tableau de bord', icon: 'chevron', route: '/forum/dashboard' },
        { id: 'forum-cats', label: 'Catégories', icon: 'chevron', route: '/forum/categories' },
        { id: 'forum-posts', label: 'Gestion des Posts', icon: 'chevron', route: '/forum/posts' }
      ]
    },
    { id: 'jobs',     label: 'Jobs',     icon: 'briefcase' },
    { id: 'settings', label: 'Settings', icon: 'settings'  }
  ];

  constructor(private router: Router) {
    this.updateBreakpoints();
  }

  @HostListener('window:resize')
  onResize(): void { this.updateBreakpoints(); }

  private updateBreakpoints(): void {
    if (typeof window === 'undefined') { this.isMobile = false; return; }
    this.isMobile = window.innerWidth <= 900;
    if (!this.isMobile) this.mobileMenuOpen = false;
  }

  toggleMobileMenu():   void { this.mobileMenuOpen = !this.mobileMenuOpen; }
  closeMobileMenu():    void { this.mobileMenuOpen = false; }
  toggleSidebarCollapse(): void {
    if (this.isMobile) return;
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onNavigate(item: SidebarItem): void {
    if (!item.route) return;
    this.router.navigateByUrl(item.route);
    
    // Met à jour l'état actif des items de la sidebar
    this.sidebarItems.forEach(parent => {
      if (parent.children) {
        parent.children.forEach(child => {
          child.active = (child.route === item.route);
        });
      }
    });

    // Met à jour le titre de la page
    const titles: Record<string, string> = {
      '/activity-digest':  'Activity Digest',
      '/message-users':    'Message Users',
      '/email-history':    'Historique & Statistiques',
      '/automatic-emails': 'Automatic Emails',
      '/mailing-lists':    'Mailing Lists',
      '/forum/dashboard':  'Tableau de bord Forum',
      '/forum/categories': 'Catégories du Forum',
      '/forum/posts':      'Gestion des Publications',
    };
    this.pageTitle = titles[item.route] ?? 'Email Communications';
  }
}