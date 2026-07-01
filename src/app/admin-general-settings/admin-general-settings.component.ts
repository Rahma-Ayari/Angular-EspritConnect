import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { GeneralSettings, GeneralSettingsService } from '../general-settings.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-general-settings',
  templateUrl: './admin-general-settings.component.html',
  styleUrls: ['./admin-general-settings.component.css']
})
export class AdminGeneralSettingsComponent implements OnInit {
  adminName = 'Admin';
  loading = true;
  saving = false;
  error = '';
  saveOk = false;

  settingsExpanded = true;
  userMgmtExpanded = true;

  settings: GeneralSettings | null = null;

  constructor(
    private authService: AuthService,
    private generalSettingsService: GeneralSettingsService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.adminName = user?.nom || 'Admin';
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.saveOk = false;
    this.generalSettingsService.get().subscribe({
      next: (s) => {
        this.settings = { ...s };
        this.loading = false;
      },
      error: (err: { status?: number }) => {
        if (err?.status === 0) {
          this.error = `Unable to reach API (${environment.backendBaseUrl}). Start Spring Boot on port 8089.`;
        } else if (err?.status === 500) {
          this.error = 'Server error. Check Spring and MySQL logs (EspritConnecttest database).';
        } else {
          this.error = 'Unable to load settings.';
        }
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.settings) return;
    this.saving = true;
    this.saveOk = false;
    this.error = '';
    this.generalSettingsService.update(this.settings).subscribe({
      next: (s) => {
        this.settings = { ...s };
        this.saving = false;
        this.saveOk = true;
        setTimeout(() => (this.saveOk = false), 3000);
      },
      error: () => {
        this.saving = false;
        this.error = 'Enregistrement impossible.';
      }
    });
  }

  cancel(): void {
    this.load();
  }

  toggleSettings(): void {
    this.settingsExpanded = !this.settingsExpanded;
  }

  toggleUserMgmt(): void {
    this.userMgmtExpanded = !this.userMgmtExpanded;
  }

  logout(): void {
    this.authService.logout();
  }
}
