import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JobOffer } from '../../../jobs/models/job.model';
import { ResumeFile, ResumeFilesService } from '../../services/resume-files.service';
import { ApplicationsService } from '../../services/applications.service';

@Component({
  selector: 'app-apply-modal',
  templateUrl: './apply-modal.component.html',
  styleUrls: ['./apply-modal.component.css']
})
export class ApplyModalComponent implements OnInit {
  @Input() job!: JobOffer;
  @Output() closed = new EventEmitter<void>();
  @Output() applied = new EventEmitter<void>();

  cvs: ResumeFile[] = [];
  selectedCvId?: number;
  loadingCvs = false;
  uploading = false;

  yearsExperience?: number;
  availabilityDate = '';
  willingToRelocate: boolean | null = null;
  message = '';

  submitting = false;
  error = '';

  constructor(
    public resumeFiles: ResumeFilesService,
    private applications: ApplicationsService
  ) {}

  ngOnInit(): void {
    this.loadCvs();
  }

  loadCvs(): void {
    this.loadingCvs = true;
    this.resumeFiles.listMine().subscribe({
      next: (files) => {
        this.cvs = files.filter((f) => (f.typeFichier || '').toUpperCase() === 'CV' || !!f.url);
        if (this.cvs.length) this.selectedCvId = this.cvs[0].idFichier;
        this.loadingCvs = false;
      },
      error: (e) => {
        this.error = e.message;
        this.loadingCvs = false;
      }
    });
  }

  onUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading = true;
    this.error = '';
    this.resumeFiles.upload(file).subscribe({
      next: (saved) => {
        this.cvs = [saved, ...this.cvs];
        this.selectedCvId = saved.idFichier;
        this.uploading = false;
        input.value = '';
      },
      error: (e) => {
        this.error = e.message;
        this.uploading = false;
        input.value = '';
      }
    });
  }

  fileSize(bytes: number): string {
    if (!bytes) return '';
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  }

  submit(): void {
    if (!this.selectedCvId) {
      this.error = 'Please upload or select a resume.';
      return;
    }
    if (!this.job?.id) return;
    this.submitting = true;
    this.error = '';
    this.applications
      .apply({
        offreId: this.job.id,
        fichierId: this.selectedCvId,
        lettreMotivation: this.message.trim() || undefined,
        yearsExperience: this.yearsExperience ?? undefined,
        willingToRelocate:
          this.willingToRelocate === null ? undefined : this.willingToRelocate,
        availabilityDate: this.availabilityDate || undefined
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.applied.emit();
        },
        error: (e) => {
          this.error = e?.message || 'Could not submit application.';
          this.submitting = false;
        }
      });
  }

  close(): void {
    if (!this.submitting) this.closed.emit();
  }
}
