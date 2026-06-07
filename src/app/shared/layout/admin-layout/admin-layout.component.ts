import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppViewMode, ViewModeService } from '../services/view-mode.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  sidebarCollapsed = false;
  currentMode$;

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  constructor(
    private readonly viewMode: ViewModeService,
    private readonly router: Router
  ) {
    this.currentMode$ = this.viewMode.currentMode$;
  }

  backToAdmin(): void {
    this.viewMode.setMode('admin');
    this.router.navigate(['/activity-digest']);
  }

  getViewLabel(mode: AppViewMode): string {
    if (mode === 'student') return 'STUDENT VIEW';
    if (mode === 'alumni') return 'ALUMNI VIEW';
    return 'ADMIN VIEW';
  }
}