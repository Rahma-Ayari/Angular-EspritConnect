import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobsService } from '../../services/jobs.service';
import { ImportJobResponse } from '../../models/job.model';
import { navigateJobs } from '../../jobs-router.util';

@Component({
  selector: 'app-import-job',
  templateUrl: './import-job.component.html',
  styleUrls: ['./import-job.component.css']
})
export class ImportJobComponent {
  importMethod: 'URL' | 'PDF' | 'TEXT' = 'URL';

  url = '';
  rawText = '';
  selectedFile: File | null = null;

  isImporting = false;
  importedData: ImportJobResponse | null = null;
  errorMessage = '';

  constructor(
    private jobsService: JobsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  selectMethod(method: 'URL' | 'PDF' | 'TEXT'): void {
    this.importMethod = method;
    this.errorMessage = '';
    this.importedData = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  importJob(): void {
    this.isImporting = true;
    this.errorMessage = '';
    this.importedData = null;

    this.jobsService.importJob({
      url: this.importMethod === 'URL' ? this.url : undefined,
      rawText: this.importMethod === 'TEXT' ? this.rawText : undefined,
      pdfFile: this.importMethod === 'PDF' ? this.selectedFile || undefined : undefined,
      source: this.importMethod
    }).subscribe({
      next: (response) => {
        this.importedData = response;
        this.isImporting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Import failed. Please try again.';
        this.isImporting = false;
      }
    });
  }

  useImportedData(): void {
    if (!this.importedData) return;

    navigateJobs(this.router, this.route, ['create'], {
      state: {
        importedJob: this.importedData
      }
    });
  }
}
