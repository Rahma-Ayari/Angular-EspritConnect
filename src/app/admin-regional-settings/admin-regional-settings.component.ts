import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import {
  RegionalSettings,
  RegionalSettingsService
} from '../regional-settings.service';
import { environment } from '../../environments/environment';

export interface TimezoneOption {
  id: string;
  label: string;
}

export interface LanguageOption {
  code: string;
  label: string;
}

@Component({
  selector: 'app-admin-regional-settings',
  templateUrl: './admin-regional-settings.component.html',
  styleUrls: [
    '../admin-general-settings/admin-general-settings.component.css',
    './admin-regional-settings.component.css'
  ]
})
export class AdminRegionalSettingsComponent implements OnInit {
  adminName = 'Admin';
  loading = true;
  saving = false;
  error = '';
  saveOk = false;

  settingsExpanded = true;
  userMgmtExpanded = true;

  settings: RegionalSettings | null = null;

  timezoneCatalog: TimezoneOption[] = [
    { id: 'Africa/Tunis', label: 'Africa/Tunis (UTC+01:00)' },
    { id: 'Africa/Casablanca', label: 'Africa/Casablanca (UTC+01:00)' },
    { id: 'Africa/Algiers', label: 'Africa/Algiers (UTC+01:00)' },
    { id: 'Europe/Paris', label: 'Europe/Paris (UTC+01:00)' },
    { id: 'Europe/London', label: 'Europe/London (UTC+00:00)' },
    { id: 'Europe/Berlin', label: 'Europe/Berlin (UTC+01:00)' },
    { id: 'UTC', label: 'UTC (UTC+00:00)' },
    { id: 'America/New_York', label: 'America/New_York (UTC-05:00)' },
    { id: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-08:00)' },
    { id: 'America/Toronto', label: 'America/Toronto (UTC-05:00)' },
    { id: 'Asia/Dubai', label: 'Asia/Dubai (UTC+04:00)' },
    { id: 'Asia/Riyadh', label: 'Asia/Riyadh (UTC+03:00)' },
    { id: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+09:00)' },
    { id: 'Asia/Singapore', label: 'Asia/Singapore (UTC+08:00)' }
  ];

  languageCatalog: LanguageOption[] = [
    { code: 'en_GB', label: 'English (UK)' },
    { code: 'en_US', label: 'English (US)' },
    { code: 'fr_FR', label: 'French' },
    { code: 'ar_TN', label: 'العربية (Tunisia)' },
    { code: 'de_DE', label: 'Deutsch (German)' },
    { code: 'es_ES', label: 'Español (Spanish)' },
    { code: 'it_IT', label: 'Italiano (Italian)' }
  ];

  addTimezoneValue = '';
  addLanguageValue = '';

  constructor(
    private authService: AuthService,
    private regionalSettingsService: RegionalSettingsService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.adminName = user?.nom || 'Admin';
    this.load();
  }

  timezoneLabel(id: string): string {
    return this.timezoneCatalog.find((z) => z.id === id)?.label ?? id;
  }

  languageLabel(code: string): string {
    return this.languageCatalog.find((l) => l.code === code)?.label ?? code;
  }

  availableTimezonesToAdd(): TimezoneOption[] {
    if (!this.settings) return [];
    const used = new Set([
      this.settings.primaryTimezone,
      ...this.settings.additionalTimezones
    ]);
    return this.timezoneCatalog.filter((z) => !used.has(z.id));
  }

  availableLanguagesToAdd(): LanguageOption[] {
    if (!this.settings) return [];
    const used = new Set([
      this.settings.defaultLanguage,
      ...this.settings.additionalLanguages
    ]);
    return this.languageCatalog.filter((l) => !used.has(l.code));
  }

  addTimezone(): void {
    if (!this.settings || !this.addTimezoneValue) return;
    const z = this.addTimezoneValue;
    if (z === this.settings.primaryTimezone) return;
    if (this.settings.additionalTimezones.includes(z)) return;
    this.settings = {
      ...this.settings,
      additionalTimezones: [...this.settings.additionalTimezones, z]
    };
    this.addTimezoneValue = '';
  }

  removeTimezone(idx: number): void {
    if (!this.settings) return;
    const next = [...this.settings.additionalTimezones];
    next.splice(idx, 1);
    this.settings = { ...this.settings, additionalTimezones: next };
  }

  addLanguage(): void {
    if (!this.settings || !this.addLanguageValue) return;
    const c = this.addLanguageValue;
    if (c === this.settings.defaultLanguage) return;
    if (this.settings.additionalLanguages.includes(c)) return;
    this.settings = {
      ...this.settings,
      additionalLanguages: [...this.settings.additionalLanguages, c]
    };
    this.addLanguageValue = '';
  }

  removeLanguage(idx: number): void {
    if (!this.settings) return;
    const next = [...this.settings.additionalLanguages];
    next.splice(idx, 1);
    this.settings = { ...this.settings, additionalLanguages: next };
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.saveOk = false;
    this.regionalSettingsService.get().subscribe({
      next: (s) => {
        this.mergeTimezoneCatalog(s);
        this.mergeLanguageCatalog(s);
        this.settings = {
          ...s,
          additionalTimezones: [...(s.additionalTimezones ?? [])],
          additionalLanguages: [...(s.additionalLanguages ?? [])]
        };
        this.loading = false;
      },
      error: (err: unknown) => {
        this.error = this.describeLoadError(err);
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.settings) return;
    this.saving = true;
    this.saveOk = false;
    this.error = '';
    this.regionalSettingsService.update(this.settings).subscribe({
      next: (s) => {
        this.mergeTimezoneCatalog(s);
        this.mergeLanguageCatalog(s);
        this.settings = {
          ...s,
          additionalTimezones: [...(s.additionalTimezones ?? [])],
          additionalLanguages: [...(s.additionalLanguages ?? [])]
        };
        this.saving = false;
        this.saveOk = true;
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

  private mergeTimezoneCatalog(s: RegionalSettings): void {
    const seen = new Set(this.timezoneCatalog.map((z) => z.id));
    const push = (id: string | undefined) => {
      if (!id || seen.has(id)) return;
      this.timezoneCatalog = [...this.timezoneCatalog, { id, label: id }];
      seen.add(id);
    };
    push(s.primaryTimezone);
    (s.additionalTimezones ?? []).forEach(push);
  }

  private describeLoadError(err: unknown): string {
    if (err instanceof Error && err.message === 'TIMEOUT') {
      return (
        `The server did not answer in time (20s). Is Spring Boot running on port 8089 with MySQL, ` +
        'and are you using ng serve with the proxy?'
      );
    }
    const http = err as { status?: number; message?: string };
    if (http?.status === 0) {
      return (
        `Cannot reach the API (network). Start the backend on ${environment.backendBaseUrl} ` +
        '(see server.port in application.properties).'
      );
    }
    if (http?.status === 404) {
      return (
        'Regional settings API was not found (404). Deploy or run a backend version that includes ' +
        '/api/admin/settings/regional.'
      );
    }
    if (http?.status === 500) {
      return 'Server error while loading regional settings. Check Spring logs and the database.';
    }
    return 'Unable to load regional settings.';
  }

  private mergeLanguageCatalog(s: RegionalSettings): void {
    const seen = new Set(this.languageCatalog.map((l) => l.code));
    const push = (code: string | undefined) => {
      if (!code || seen.has(code)) return;
      this.languageCatalog = [...this.languageCatalog, { code, label: code }];
      seen.add(code);
    };
    push(s.defaultLanguage);
    (s.additionalLanguages ?? []).forEach(push);
  }
}
