import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent implements OnInit {
  searchQuery = '';
  showDropdown = false;
  notifications = [
    { id: 1, message: 'Nouvelle opportunité disponible', time: '2 min' },
    { id: 2, message: 'Votre profil a été vu', time: '1 h' },
    { id: 3, message: 'Événement demain à 14h', time: '3 h' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user?.nom) return 'U';
    return user.nom.substring(0, 2).toUpperCase();
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
    if (!target.closest('.user-menu') && !target.closest('.notification-menu')) {
      this.showDropdown = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
