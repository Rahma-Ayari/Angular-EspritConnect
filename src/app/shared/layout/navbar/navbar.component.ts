import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppViewMode, ViewModeService } from '../services/view-mode.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  showDropdown: boolean = false;
  currentMode: AppViewMode = 'admin';
  private modeSub?: Subscription;

  // Mock currentUser car AuthService n'est pas présent dans le projet
  currentUser = {
    nom: 'Admin Esprit',
    email: 'admin.connect@esprit.tn'
  };

  constructor(
    private readonly viewMode: ViewModeService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.modeSub = this.viewMode.currentMode$.subscribe(mode => {
      this.currentMode = mode;
      if (mode === 'student') {
        this.currentUser = {
          nom: 'Étudiant Demo',
          email: 'etudiant.demo@esprit.tn'
        };
      } else if (mode === 'alumni') {
        this.currentUser = {
          nom: 'Alumni Demo',
          email: 'alumni.demo@esprit.tn'
        };
      } else {
        this.currentUser = {
          nom: 'Admin Esprit',
          email: 'admin.connect@esprit.tn'
        };
      }
    });
  }

  ngOnDestroy(): void {
    if (this.modeSub) {
      this.modeSub.unsubscribe();
    }
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
    console.log('Déconnexion de l\'administrateur');
  }

  switchTo(mode: AppViewMode): void {
    this.viewMode.setMode(mode);
    this.showDropdown = false;
    if (mode === 'admin') {
      this.router.navigate(['/activity-digest']);
    } else {
      this.router.navigate(['/user/forum']);
    }
  }
}