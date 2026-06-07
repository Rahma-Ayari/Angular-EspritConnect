import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppViewMode, ViewModeService } from '../services/view-mode.service';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  sidebarCollapsed = false;
  currentMode$;

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  constructor(
    private readonly viewMode: ViewModeService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.currentMode$ = this.viewMode.currentMode$;
  }

  ngOnInit(): void {
    const role = this.authService.getRole();
    if (role && role !== 'ADMIN') {
      this.viewMode.syncFromRole(role);
    }
  }

  backToAdmin(): void {
    this.viewMode.setMode('admin');
    this.router.navigate(['/admin/dashboard']);
  }

  getViewLabel(mode: AppViewMode): string {
    if (mode === 'student') return 'STUDENT VIEW';
    if (mode === 'alumni') return 'ALUMNI VIEW';
    return 'ADMIN VIEW';
  }
}