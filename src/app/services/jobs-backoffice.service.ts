import { Injectable } from '@angular/core';

export interface JobsSettingsState {
  employmentTypes: string[];
  showFeedWidget: boolean;
  showExternalWidget: boolean;
  widgetLanguage: string;
  widgetTitle: string;
  widgetDescription: string;
  widgetUrl: string;
  widgetButtonText: string;
  widgetImageName: string;
}

export interface ImportFeed {
  id: string;
  provider: 'handshake' | 'symplicity' | 'custom';
  feedUrl: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class JobsBackofficeService {
  private readonly settingsKey = 'jobs_backoffice_settings_v1';
  private readonly importsKey = 'jobs_backoffice_imports_v1';

  loadSettings(): JobsSettingsState {
    const raw = localStorage.getItem(this.settingsKey);
    if (raw) {
      return JSON.parse(raw) as JobsSettingsState;
    }
    return {
      employmentTypes: [
        'Full-time',
        'Part-time',
        'Final project Internship',
        'Job offer',
        'Short Internship'
      ],
      showFeedWidget: true,
      showExternalWidget: true,
      widgetLanguage: 'English (UK)',
      widgetTitle: '',
      widgetDescription: '',
      widgetUrl: '',
      widgetButtonText: '',
      widgetImageName: 'jobs-banner.png'
    };
  }

  saveSettings(state: JobsSettingsState): void {
    localStorage.setItem(this.settingsKey, JSON.stringify(state));
  }

  loadImports(): ImportFeed[] {
    const raw = localStorage.getItem(this.importsKey);
    if (raw) {
      return JSON.parse(raw) as ImportFeed[];
    }
    return [];
  }

  saveImports(items: ImportFeed[]): void {
    localStorage.setItem(this.importsKey, JSON.stringify(items));
  }
}
