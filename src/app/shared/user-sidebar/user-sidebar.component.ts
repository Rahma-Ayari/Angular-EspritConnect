import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-user-sidebar',
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.css']
})
export class UserSidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Input() activeNav: string = 'dashboard';
  @Output() navChange = new EventEmitter<string>();
  @Output() toggleSidebar = new EventEmitter<void>();
  navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid', route: '/dashboard' },
    { id: 'profile', label: 'Mon Profil', icon: 'bi-person', route: '/profile' },
    { id: 'opportunities', label: 'Opportunités', icon: 'bi-briefcase', route: '/opportunities' },
    { id: 'events', label: 'Événements', icon: 'bi-calendar-event', route: '/events' },
    { id: 'messages', label: 'Messages', icon: 'bi-chat-dots', route: '/messages' },
    { id: 'settings', label: 'Paramètres', icon: 'bi-gear', route: '/settings' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.updateActiveNav(this.router.url);
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get userRoleLabel(): string {
    const role = this.currentUser?.role;
    if (!role) return '';
    switch (role.toUpperCase()) {
      case 'ALUMNI': return 'Alumni';
      case 'ETUDIANT': return 'Étudiant';
      case 'ADMIN': return 'Administrateur';
      case 'ENTREPRISE': return 'Entreprise';
      default: return role;
    }
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user?.nom) return 'U';
    return user.nom.substring(0, 2).toUpperCase();
  }

  setNav(navId: string): void {
    this.activeNav = navId;
    this.navChange.emit(navId);
    
    // Navigate to the route
    const navItem = this.navItems.find(item => item.id === navId);
    if (navItem && navItem.route) {
      this.router.navigate([navItem.route]);
    }
  }

  updateActiveNav(url: string): void {
    if (url.includes('/profile')) {
      this.activeNav = 'profile';
    } else if (url.includes('/opportunities')) {
      this.activeNav = 'opportunities';
    } else if (url.includes('/events')) {
      this.activeNav = 'events';
    } else if (url.includes('/messages')) {
      this.activeNav = 'messages';
    } else if (url.includes('/settings')) {
      this.activeNav = 'settings';
    } else {
      this.activeNav = 'dashboard';
    }
  }

  logout(): void {
    this.authService.logout();
  }

  onToggle(): void {
    this.collapsed = !this.collapsed;
    this.toggleSidebar.emit();
  }
}
