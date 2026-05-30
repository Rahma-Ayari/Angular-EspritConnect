import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  searchQuery: string = '';
  showDropdown: boolean = false;

  // Mock currentUser car AuthService n'est pas présent dans le projet
  currentUser = {
    nom: 'Admin Esprit',
    email: 'admin.connect@esprit.tn'
  };

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
    console.log('Déconnexion de l\'administrateur');
  }
}