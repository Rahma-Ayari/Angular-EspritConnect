import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  searchQuery: string = '';
  showDropdown: boolean = false;

  constructor(private authService: AuthService) {}

  get currentUser() {
    return this.authService.getCurrentUser();
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
    if (!target.closest('.user-menu')) {
      this.showDropdown = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
