import { Component, OnInit } from '@angular/core';
import { JobsBackofficeService, JobsSettingsState } from '../../../services/jobs-backoffice.service';

@Component({
  selector: 'app-jobs-settings',
  templateUrl: './jobs-settings.component.html',
  styleUrls: ['./jobs-settings.component.css']
})
export class JobsSettingsComponent implements OnInit {
  state!: JobsSettingsState;
  newEmploymentType = '';
  saveMessage = '';

  constructor(private jobsService: JobsBackofficeService) {}

  ngOnInit(): void {
    this.state = this.jobsService.loadSettings();
  }

  addEmploymentType(): void {
    const value = this.newEmploymentType.trim();
    if (!value) return;
    this.state.employmentTypes.push(value);
    this.newEmploymentType = '';
  }

  removeEmploymentType(type: string): void {
    this.state.employmentTypes = this.state.employmentTypes.filter(t => t !== type);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.state.widgetImageName = file.name;
    }
  }

  save(): void {
    this.jobsService.saveSettings(this.state);
    this.saveMessage = 'Settings saved.';
    setTimeout(() => {
      this.saveMessage = '';
    }, 2200);
  }
}
