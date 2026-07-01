import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth.service';
import {
  RegistrationSettings,
  RegistrationSettingsService
} from '../registration-settings.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-registration-settings',
  templateUrl: './admin-registration-settings.component.html',
  styleUrls: [
    '../admin-general-settings/admin-general-settings.component.css',
    './admin-registration-settings.component.css'
  ]
})
export class AdminRegistrationSettingsComponent implements OnInit {
  @ViewChild('termsEditor') termsEditor?: ElementRef<HTMLDivElement>;

  adminName = 'Admin';
  loading = true;
  saving = false;
  error = '';
  saveOk = false;

  settingsExpanded = true;
  userMgmtExpanded = true;

  settings: RegistrationSettings | null = null;

  constructor(
    private authService: AuthService,
    private registrationSettingsService: RegistrationSettingsService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.adminName = user?.nom || 'Admin';
    this.load();
  }

  onTermsInput(): void {
    if (!this.settings || !this.termsEditor) return;
    this.settings.termsAndPrivacyHtml = this.termsEditor.nativeElement.innerHTML;
  }

  execFormat(ev: MouseEvent, command: string, value?: string): void {
    ev.preventDefault();
    if (!isPlatformBrowser(this.platformId) || !this.termsEditor) return;
    const el = this.termsEditor.nativeElement;
    el.focus();
    try {
      if (command === 'createLink') {
        const url = window.prompt('Link URL (https://...)', 'https://');
        if (!url) return;
        document.execCommand(command, false, url);
      } else {
        document.execCommand(command, false, value);
      }
    } catch {
      /* some browsers restrict execCommand outside user gesture */
    }
    this.onTermsInput();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.saveOk = false;
    this.registrationSettingsService.get().subscribe({
      next: (s) => {
        this.settings = { ...s };
        this.loading = false;
        this.scheduleEditorSync();
      },
      error: (err: unknown) => {
        this.error = this.describeLoadError(err);
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.settings) return;
    if (isPlatformBrowser(this.platformId) && this.termsEditor) {
      this.settings.termsAndPrivacyHtml = this.termsEditor.nativeElement.innerHTML;
    }
    this.saving = true;
    this.saveOk = false;
    this.error = '';
    this.registrationSettingsService.update(this.settings).subscribe({
      next: (s) => {
        this.settings = { ...s };
        this.saving = false;
        this.saveOk = true;
        this.scheduleEditorSync();
        setTimeout(() => (this.saveOk = false), 3000);
      },
      error: (err: unknown) => {
        this.saving = false;
        if (err instanceof Error && err.message === 'TIMEOUT') {
          this.error = this.describeLoadError(err);
          return;
        }
        const http = err as { error?: { message?: string } };
        const msg = http?.error?.message;
        this.error =
          typeof msg === 'string' ? msg : 'Enregistrement impossible.';
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

  private describeLoadError(err: unknown): string {
    if (err instanceof Error && err.message === 'TIMEOUT') {
      return (
        'The server did not answer in time (20s). Is Spring Boot running on port 8089 with MySQL, ' +
        'and are you using ng serve with the proxy?'
      );
    }
    const http = err as { status?: number };
    if (http?.status === 0) {
      return (
        `Cannot reach the API (network). Start the backend on ${environment.backendBaseUrl} ` +
        '(see server.port in application.properties).'
      );
    }
    if (http?.status === 404) {
      return (
        'Registration settings API was not found (404). Run a backend build that includes ' +
        '/api/admin/settings/registration.'
      );
    }
    if (http?.status === 500) {
      return 'Server error while loading registration settings. Check Spring logs.';
    }
    return 'Unable to load registration settings.';
  }

  private scheduleEditorSync(): void {
    if (!isPlatformBrowser(this.platformId) || !this.settings) {
      return;
    }
    setTimeout(() => this.patchEditorFromSettings(), 10);
  }

  private patchEditorFromSettings(): void {
    if (!this.settings || !this.termsEditor) {
      return;
    }
    this.termsEditor.nativeElement.innerHTML =
      this.settings.termsAndPrivacyHtml || '';
  }
}
