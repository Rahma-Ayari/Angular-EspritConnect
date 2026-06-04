import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchQuery = '';
  showDropdown = false;
  layoutType: 'admin' | 'entreprise' | 'default' = 'default';
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.updateLayoutType(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => this.updateLayoutType(event.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get isAdmin(): boolean {
    return this.layoutType === 'admin';
  }

  get isEntreprise(): boolean {
    return this.layoutType === 'entreprise';
  }

  updateLayoutType(url: string): void {
    if (url.startsWith('/admin')) {
      this.layoutType = 'admin';
    } else if (url.startsWith('/entreprise')) {
      this.layoutType = 'entreprise';
    } else {
      this.layoutType = 'default';
    }
  }

  onSearch(): void {
    if (!this.isAdmin) {
      return;
    }
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
