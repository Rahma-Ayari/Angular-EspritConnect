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
  navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid' },
    { id: 'profile', label: 'Mon Profil', icon: 'bi-person' },
    { id: 'opportunities', label: 'Opportunités', icon: 'bi-briefcase' },
    { id: 'events', label: 'Événements', icon: 'bi-calendar-event' },
    { id: 'messages', label: 'Messages', icon: 'bi-chat-dots' },
    { id: 'settings', label: 'Paramètres', icon: 'bi-gear' }
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

  get userInitials(): string {
    const user = this.currentUser;
    if (!user?.nom) return 'U';
    return user.nom.substring(0, 2).toUpperCase();
  }

  setNav(navId: string): void {
    this.activeNav = navId;
    this.navChange.emit(navId);
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
}
